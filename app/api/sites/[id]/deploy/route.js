import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSiteById, getCFAccountById, updateSite, addDeployLog, getMgrSetting } from '@/lib/db';
import {
  createD1Database,
  executeSQLOnD1,
  createPagesProject,
  configurePagesProjectBindings,
  bindPagesDomain,
  triggerPagesDomainValidation,
  getZoneIdByDomain,
  createOrUpdateDNSRecord,
  setupEmailForwarding
} from '@/lib/cf-api';
import { triggerGithubDeploy } from '@/lib/github-api';
import { childSiteSqlTemplate } from '@/lib/sql-template';

export const runtime = 'edge';

export async function POST(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id } = await params;
  const siteId = parseInt(id);

  try {
    // 1. 获取站点与关联的 Cloudflare 账户信息
    const site = await getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const account = await getCFAccountById(site.cf_account_id);
    if (!account) {
      return NextResponse.json({ error: 'Associated Cloudflare account not found' }, { status: 404 });
    }

    // 更新站点部署状态为 "deploying" (部署中)
    await updateSite(siteId, { deploy_status: 'deploying' });
    await addDeployLog(siteId, 'deploy_start', 'info', `Starting deployment sequence for ${site.domain}...`);

    const pagesProject = site.pages_project_name || site.name;
    let databaseId = site.d1_database_id;
    const apiToken = account.api_token;
    const accountId = account.account_id;

    // 2. 如果没有 D1 数据库，自动创建
    if (!databaseId) {
      try {
        await addDeployLog(siteId, 'create_d1', 'info', 'Creating D1 database on Cloudflare...');
        const dbName = `db-${site.name}`;
        const newDb = await createD1Database(apiToken, accountId, dbName);
        databaseId = newDb.databaseId;

        await updateSite(siteId, { d1_database_id: databaseId });
        await addDeployLog(siteId, 'create_d1', 'success', `D1 database created successfully with ID: ${databaseId}`);
      } catch (err) {
        await updateSite(siteId, { deploy_status: 'failed' });
        await addDeployLog(siteId, 'create_d1_failed', 'error', `D1 Database creation failed: ${err.message}`);
        return NextResponse.json({ error: `D1 Creation Error: ${err.message}` }, { status: 500 });
      }
    }

    // 3. 校验并导入数据库初始表结构与种子数据 (幂等操作)
    try {
      await addDeployLog(siteId, 'import_sql', 'info', 'Verifying database schema and seeding data...');
      
      // 动态注入自定义参数修改 SQL 中的设置
      let seedSql = childSiteSqlTemplate;
      seedSql = seedSql.replace(
        "INSERT OR IGNORE INTO settings (key, value) VALUES ('site_name', 'AffSite Deals');",
        `INSERT OR IGNORE INTO settings (key, value) VALUES ('site_name', '${site.seo_title.split('-')[0].trim()}');`
      );
      const siteDomain = site.domain || `${pagesProject}.pages.dev`;
      seedSql = seedSql.replace(
        "INSERT OR IGNORE INTO settings (key, value) VALUES ('site_url', 'https://www.affsite.com');",
        `INSERT OR IGNORE INTO settings (key, value) VALUES ('site_url', 'https://${siteDomain}');`
      );
      seedSql = seedSql.replace(
        "INSERT OR IGNORE INTO settings (key, value) VALUES ('site_email', 'info@affsite.com');",
        `INSERT OR IGNORE INTO settings (key, value) VALUES ('site_email', 'info@${siteDomain}');`
      );
      seedSql = seedSql.replace(
        "INSERT OR IGNORE INTO settings (key, value) VALUES ('meta_title', 'AffSite Deals - Curated Fashion & Multi-Category Cashback Coupons');",
        `INSERT OR IGNORE INTO settings (key, value) VALUES ('meta_title', '${site.seo_title}');`
      );
      seedSql = seedSql.replace(
        "INSERT OR IGNORE INTO settings (key, value) VALUES ('meta_description', 'Discover top cashback deals, coupons, and discounts across Apparel, Electronics, Home, and more. Shop partner brands and save.');",
        `INSERT OR IGNORE INTO settings (key, value) VALUES ('meta_description', '${site.seo_description}');`
      );

      // 分离表结构创建 (part 1) 和示例商品数据 (part 2)
      const sqlParts = seedSql.split('-- 示例产品数据');
      const schemaSql = sqlParts[0];
      const demoDataSql = sqlParts[1] ? `-- 示例产品数据` + sqlParts[1] : '';

      // 首先始终运行表结构创建及默认设置（非破坏性操作）
      await executeSQLOnD1(apiToken, accountId, databaseId, schemaSql);

      // 同步子网站 PayPal 支付配置与自定义 HTML Header 标签
      const syncSettingsSql = `
        INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('paypal_client_id', '${(site.paypal_client_id || '').replace(/'/g, "''")}', CURRENT_TIMESTAMP);
        INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('paypal_client_secret', '${(site.paypal_client_secret || '').replace(/'/g, "''")}', CURRENT_TIMESTAMP);
        INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('paypal_mode', '${(site.paypal_mode || 'sandbox').replace(/'/g, "''")}', CURRENT_TIMESTAMP);
        INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('custom_html_tags', '${(site.custom_html_tags || '').replace(/'/g, "''")}', CURRENT_TIMESTAMP);
      `;
      await executeSQLOnD1(apiToken, accountId, databaseId, syncSettingsSql);

      // 检查当前 D1 数据库中是否已有商品数据，如果有，说明已经被使用，跳过填充示例商品/页面，防止把用户删掉的示例数据再次找回
      let shouldSeedDemo = true;
      try {
        const checkRes = await executeSQLOnD1(apiToken, accountId, databaseId, "SELECT COUNT(*) as count FROM products;");
        const count = checkRes?.[0]?.results?.[0]?.count;
        if (typeof count === 'number' && count > 0) {
          shouldSeedDemo = false;
          await addDeployLog(siteId, 'import_sql', 'info', 'Existing products detected. Skipping demo data seeding to preserve custom state.');
        }
      } catch (checkErr) {
        console.error('Failed to query products count from D1, proceeding to seed:', checkErr);
      }

      if (shouldSeedDemo && demoDataSql) {
        await executeSQLOnD1(apiToken, accountId, databaseId, demoDataSql);
        await addDeployLog(siteId, 'import_sql', 'success', 'Database schema initialized and demo data seeded successfully.');
      } else {
        await addDeployLog(siteId, 'import_sql', 'success', 'Database schema verified/updated successfully. Seeding bypassed.');
      }
    } catch (err) {
      await updateSite(siteId, { deploy_status: 'failed' });
      await addDeployLog(siteId, 'import_sql_failed', 'error', `D1 Database configuration failed: ${err.message}`);
      return NextResponse.json({ error: `D1 Config Error: ${err.message}` }, { status: 500 });
    }

    // 3. 如果没有 Pages 项目，自动创建并配置 D1 绑定和域名
    try {
      await addDeployLog(siteId, 'create_pages', 'info', `Verifying Pages project: ${pagesProject}...`);
      
      // 尝试创建 Pages 项目 (如果项目已存在，CF API 可能会抛错，我们接住并继续绑定)
      try {
        await createPagesProject(apiToken, accountId, pagesProject);
        await addDeployLog(siteId, 'create_pages', 'success', `Created new Pages project: ${pagesProject}`);
      } catch (err) {
        await addDeployLog(siteId, 'create_pages', 'info', `Pages project ${pagesProject} already exists or ready.`);
      }

      // 配置 D1 绑定与 nodejs_compat
      await addDeployLog(siteId, 'bind_d1', 'info', 'Configuring Pages D1 database bindings...');
      await configurePagesProjectBindings(apiToken, accountId, pagesProject, databaseId);
      await addDeployLog(siteId, 'bind_d1', 'success', 'D1 binding configured successfully.');

      // 绑定自定义域名并全自动生成 DNS 解析记录与即时校验 (3步自动化流程)
      if (site.domain) {
        await addDeployLog(siteId, 'bind_domain', 'info', `Processing 100% automatic domain setup for ${site.domain}...`);
        try {
          const targetPagesDev = `${pagesProject}.pages.dev`;

          // 步骤 1: 优先生成/更新 Cloudflare DNS 表中的 CNAME 解析记录 (@ 与 www)
          try {
            const zoneId = await getZoneIdByDomain(apiToken, site.domain);
            await addDeployLog(siteId, 'auto_dns', 'info', `Step 1: Creating CNAME DNS records: @ and www -> ${targetPagesDev}`);
            await createOrUpdateDNSRecord(apiToken, zoneId, 'CNAME', site.domain, targetPagesDev, true);
            await createOrUpdateDNSRecord(apiToken, zoneId, 'CNAME', `www.${site.domain}`, targetPagesDev, true);
            await addDeployLog(siteId, 'auto_dns', 'success', `Step 1 Complete: DNS CNAME records active.`);
          } catch (dnsErr) {
            await addDeployLog(siteId, 'auto_dns_warning', 'info', `DNS setup note: ${dnsErr.message}`);
          }

          // 步骤 2: 关联根域名与 www 子域名到 Cloudflare Pages 项目
          await addDeployLog(siteId, 'bind_domain', 'info', `Step 2: Linking domain to Pages project...`);
          await bindPagesDomain(apiToken, accountId, pagesProject, site.domain);
          try {
            await bindPagesDomain(apiToken, accountId, pagesProject, `www.${site.domain}`);
          } catch (_) {}

          // 步骤 3: 触发 Pages 即时 DNS / SSL 自动校验
          await addDeployLog(siteId, 'trigger_val', 'info', `Step 3: Triggering Cloudflare SSL & Edge Routing verification...`);
          await triggerPagesDomainValidation(apiToken, accountId, pagesProject, site.domain);
          await triggerPagesDomainValidation(apiToken, accountId, pagesProject, `www.${site.domain}`);

          await addDeployLog(siteId, 'bind_domain', 'success', `Custom domain ${site.domain} and www.${site.domain} fully bound & activated automatically!`);
        } catch (err) {
          await addDeployLog(siteId, 'bind_domain', 'info', `Domain binding note: ${err.message}`);
        }
      } else {
        await addDeployLog(siteId, 'bind_domain', 'info', 'No custom domain provided. Using default pages.dev subdomain.');
      }

      // 更新 Pages 项目名到数据库中
      await updateSite(siteId, { pages_project_name: pagesProject });
    } catch (err) {
      await updateSite(siteId, { deploy_status: 'failed' });
      await addDeployLog(siteId, 'pages_config_failed', 'error', `Pages project configuration failed: ${err.message}`);
      return NextResponse.json({ error: `Pages Config Error: ${err.message}` }, { status: 500 });
    }

    // 4. 配置子域名邮件转发规则 (Email Routing)
    if (site.domain && site.email_forwarding === 1) {
      try {
        await addDeployLog(siteId, 'setup_email', 'info', `Configuring Cloudflare Email Routing for ${site.domain}...`);
        
        // 获取域名的 Zone ID
        const zoneId = await getZoneIdByDomain(apiToken, site.domain);
        
        // 获取系统设定的目标邮箱，如果没有，则默认转发到 codeiswo@outlook.com
        const forwardDest = (await getMgrSetting('default_forward_email')) || 'codeiswo@outlook.com';
        
        await setupEmailForwarding(apiToken, zoneId, site.domain, forwardDest);
        await addDeployLog(siteId, 'setup_email', 'success', `Email forwarding configured: info@${site.domain} -> ${forwardDest}`);
      } catch (err) {
        // 邮件转发失败不阻断核心打包进程，仅记录警告
        await addDeployLog(siteId, 'setup_email_warning', 'error', `Email routing configuration failed (Warning only): ${err.message}`);
      }
    } else {
      await addDeployLog(siteId, 'setup_email', 'info', 'Email forwarding disabled or no custom domain provided. Skipping Email Routing.');
    }

    // 5. 调用 GitHub Webhook 触发 Actions 编译打包
    try {
      await addDeployLog(siteId, 'trigger_github', 'info', 'Sending build payload to GitHub Actions...');
      
      const githubToken = (await getMgrSetting('github_token')) || process.env.GITHUB_TOKEN || '';
      const githubOwner = (await getMgrSetting('github_owner')) || 'codeiswo';
      // 模板项目名称使用所选的 template，无则使用系统配置默认的 github_repo
      const githubRepo = site.template || (await getMgrSetting('github_repo')) || 'AffSite';

      const requestUrl = new URL(request.url);
      const callbackUrl = `${requestUrl.protocol}//${requestUrl.host}/api/deploy-callback`;
      const adminPassword = (await getMgrSetting('admin_password')) || 'dl0101';

      await triggerGithubDeploy({
        githubToken,
        owner: githubOwner,
        repo: githubRepo,
        siteName: site.seo_title.split('-')[0].trim(),
        domain: site.domain || `${pagesProject}.pages.dev`,
        primaryColor: site.primary_color,
        accentColor: site.accent_color,
        seo_title: site.seo_title,
        seo_description: site.seo_description,
        cfPagesProjectName: pagesProject,
        cfApiToken: apiToken,
        cfAccountId: accountId,
        d1DatabaseId: databaseId,
        siteId,
        callbackUrl,
        callbackSecret: adminPassword,
      });

      await updateSite(siteId, {
        deploy_status: 'deploying',
        last_deployed_at: new Date().toISOString()
      });
      await addDeployLog(siteId, 'deploy_success', 'success', 'GitHub Actions workflow triggered successfully! Compilation & deployment in progress.');
    } catch (err) {
      await updateSite(siteId, { deploy_status: 'failed' });
      await addDeployLog(siteId, 'github_trigger_failed', 'error', `Failed to trigger GitHub compile pipeline: ${err.message}`);
      return NextResponse.json({ error: `GitHub Trigger Error: ${err.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, databaseId, pagesProject });
  } catch (error) {
    console.error('Site deployment general error:', error);
    await updateSite(siteId, { deploy_status: 'failed' });
    await addDeployLog(siteId, 'general_error', 'error', `Deployment crashed: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

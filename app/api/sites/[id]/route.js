import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSiteById, deleteSite, getCFAccountById, updateSite } from '@/lib/db';
import { deletePagesProject, deleteD1Database, executeSQLOnD1 } from '@/lib/cf-api';

export const runtime = 'edge';

export async function PATCH(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { id } = await params;
    const siteId = parseInt(id);

    const site = await getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    const body = await request.json();
    const {
      name,
      domain,
      primary_color,
      accent_color,
      seo_title,
      seo_description,
      template,
      email_forwarding,
      paypal_client_id,
      paypal_client_secret,
      paypal_mode,
      custom_html_tags
    } = body;

    await updateSite(siteId, {
      name,
      domain: domain ? domain.trim() : '',
      primary_color,
      accent_color,
      seo_title,
      seo_description,
      template,
      email_forwarding: email_forwarding ? 1 : 0,
      paypal_client_id: paypal_client_id !== undefined ? paypal_client_id.trim() : undefined,
      paypal_client_secret: paypal_client_secret !== undefined ? paypal_client_secret.trim() : undefined,
      paypal_mode: paypal_mode || 'sandbox',
      custom_html_tags: custom_html_tags !== undefined ? custom_html_tags.trim() : undefined
    });

    // Synchronize PayPal credentials & Custom HTML Tags to child site D1 database immediately
    if (site.d1_database_id && site.cf_account_id) {
      try {
        const account = await getCFAccountById(site.cf_account_id);
        if (account && account.api_token && account.account_id) {
          const finalClientId = paypal_client_id !== undefined ? paypal_client_id.trim() : (site.paypal_client_id || '');
          const finalClientSecret = paypal_client_secret !== undefined ? paypal_client_secret.trim() : (site.paypal_client_secret || '');
          const finalMode = paypal_mode || site.paypal_mode || 'sandbox';
          const finalCustomHtmlTags = custom_html_tags !== undefined ? custom_html_tags.trim() : (site.custom_html_tags || '');

          const syncSettingsSql = `
            INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('paypal_client_id', '${finalClientId.replace(/'/g, "''")}', CURRENT_TIMESTAMP);
            INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('paypal_client_secret', '${finalClientSecret.replace(/'/g, "''")}', CURRENT_TIMESTAMP);
            INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('paypal_mode', '${finalMode.replace(/'/g, "''")}', CURRENT_TIMESTAMP);
            INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('custom_html_tags', '${finalCustomHtmlTags.replace(/'/g, "''")}', CURRENT_TIMESTAMP);
          `;
          await executeSQLOnD1(account.api_token, account.account_id, site.d1_database_id, syncSettingsSql);
        }
      } catch (syncErr) {
        console.error('Failed to sync settings directly to child D1 database:', syncErr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update site config error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update site configuration' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { id } = await params;
    const siteId = parseInt(id);

    // 1. 获取站点详情
    const site = await getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    // 2. 尝试获取关联 of Cloudflare 凭证
    const account = await getCFAccountById(site.cf_account_id);
    if (account) {
      const apiToken = account.api_token;
      const accountId = account.account_id;

      // 3. 同步删除 Cloudflare Pages 项目
      if (site.pages_project_name) {
        try {
          console.log(`Deleting Cloudflare Pages project: ${site.pages_project_name}`);
          await deletePagesProject(apiToken, accountId, site.pages_project_name);
        } catch (err) {
          console.error(`Failed to delete Cloudflare Pages project ${site.pages_project_name}:`, err.message);
        }
      }

      // 4. 同步删除 Cloudflare D1 数据库
      if (site.d1_database_id) {
        try {
          console.log(`Deleting Cloudflare D1 database: ${site.d1_database_id}`);
          await deleteD1Database(apiToken, accountId, site.d1_database_id);
        } catch (err) {
          console.error(`Failed to delete Cloudflare D1 database ${site.d1_database_id}:`, err.message);
        }
      }
    }

    // 5. 从管理器数据库中删除
    await deleteSite(siteId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete site config error:', error);
    return NextResponse.json({ error: 'Failed to delete site configuration' }, { status: 500 });
  }
}

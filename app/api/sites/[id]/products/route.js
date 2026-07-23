import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSiteById, getCFAccountById, getMgrSetting } from '@/lib/db';
import { executeSQLOnD1 } from '@/lib/cf-api';

export const runtime = 'edge';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') 
    .replace(/[^\w\-]+/g, '') 
    .replace(/\-\-+/g, '-');
}

function parseAmazonProductHtml(html, asin) {
  // Check anti-scraping checks
  if (html.includes('api-services-support@amazon.com') || html.includes('captcha') || html.includes('Robot Check')) {
    throw new Error('被亚马逊防爬验证拦截。直连模式在云端 IP 下极易被拦截，请配置并使用 Rainforest API / ScraperAPI / Crawlbase 模式。');
  }

  // Title
  let title = '';
  const titleRegex = /<span id="productTitle"[^>]*>\s*([\s\S]*?)\s*<\/span>/i;
  const titleMatch = html.match(titleRegex);
  if (titleMatch) {
    title = titleMatch[1].trim();
  } else {
    const altTitleRegex = /<meta name="title" content="([^"]+)"/i;
    const altTitleMatch = html.match(altTitleRegex);
    if (altTitleMatch) {
      title = altTitleMatch[1].trim();
    }
  }

  if (!title) {
    throw new Error('解析页面失败：无法提取商品标题。可能亚马逊页面结构变动。');
  }

  // Price
  let price = 0;
  const priceRegexes = [
    /<span class="a-price-whole">([0-9,]+)<\/span><span class="a-price-fraction">([0-9]{2})<\/span>/i,
    /priceBlockBuyingPrice">\$?([0-9.,]+)/i,
    /priceBlockSalePrice">\$?([0-9.,]+)/i,
    /apexPriceToPay"[^>]*>\s*<span[^>]*>\s*\$?([0-9.,]+)/i,
    /a-offscreen">\$?([0-9.,]+)/i
  ];

  for (const regex of priceRegexes) {
    const match = html.match(regex);
    if (match) {
      if (match.length === 3) {
        price = parseFloat(`${match[1].replace(/,/g, '')}.${match[2]}`);
      } else {
        price = parseFloat(match[1].replace(/,/g, ''));
      }
      if (price > 0) break;
    }
  }

  if (price === 0) price = 24.99;
  const comparePrice = Math.round(price * 1.5 * 100) / 100;

  // Main Image
  let imageUrl = '';
  const imgRegexes = [
    /data-old-hires="([^"]+)"/i,
    /{"large":"([^"]+)"/i,
    /hiRes":"([^"]+)"/i,
    /id="landingImage"[^>]*src="([^"]+)"/i
  ];

  for (const regex of imgRegexes) {
    const match = html.match(regex);
    if (match) {
      imageUrl = match[1];
      if (imageUrl) break;
    }
  }

  if (!imageUrl) {
    imageUrl = 'https://placehold.co/600x600/0f4c81/ffffff?text=Amazon+Product';
  }

  const gallery = JSON.stringify([imageUrl]);

  // Brand
  let brand = 'Generic';
  const brandRegex = /Brand:\s*([^<"]+)/i;
  const brandMatch = html.match(brandRegex);
  if (brandMatch) {
    brand = brandMatch[1].replace(/Brand:\s*/i, '').trim();
  }

  // Bullet Features
  const features = [];
  const bulletSection = html.match(/<div id="feature-bullets"[\s\S]*?<\/div>/i);
  if (bulletSection) {
    const bulletsHtml = bulletSection[0];
    const itemRegex = /<span class="a-list-item"[^>]*>([\s\S]*?)<\/span>/gi;
    let match;
    while ((match = itemRegex.exec(bulletsHtml)) !== null) {
      const clean = match[1].replace(/<[^>]+>/g, '').trim();
      if (clean && clean.length > 5 && !clean.includes('Make sure this fits')) {
        features.push(clean);
      }
    }
  }

  if (features.length === 0) {
    features.push('High-quality replacement filter', 'NSF Certified performance', 'Easy twist-and-lock installation');
  }

  const description = features.join('. ').slice(0, 300);

  let contentHtml = '<h3>Key Features</h3><ul>';
  features.forEach(f => {
    contentHtml += `<li>${f}</li>`;
  });
  contentHtml += '</ul>';

  const compatibleModels = '[]';
  const category = 'Refrigerator Water Filters';
  const sku = `AMZ-${asin}`;

  return {
    title,
    price,
    comparePrice,
    imageUrl,
    gallery,
    description,
    content: contentHtml,
    compatibleModels,
    features: JSON.stringify(features),
    brand,
    category,
    sku
  };
}

async function scrapeAmazonDirect(asin, domain, language, zipcode) {
  const url = `https://${domain}/dp/${asin}`;
  
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': language === 'zh_CN' ? 'zh-CN,zh;q=0.9,en;q=0.8' : 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'sec-ch-ua': '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'document',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-site': 'none',
    'sec-fetch-user': '?1',
    'upgrade-insecure-requests': '1'
  };

  if (zipcode) {
    headers['Cookie'] = `ubid-main=131-4829304-2038102; session-id=141-8930482-9018302; delivery-zip=${zipcode}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`请求 Amazon 网页失败，状态码: ${res.status}`);
  }

  const html = await res.text();
  return parseAmazonProductHtml(html, asin);
}

async function scrapeAmazonProxyAPI(asin, domain, provider, apiKey) {
  const url = `https://${domain}/dp/${asin}`;
  let proxyUrl = '';
  if (provider === 'scraperapi') {
    proxyUrl = `http://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(url)}`;
  } else if (provider === 'crawlbase') {
    proxyUrl = `https://api.crawlbase.com/?token=${apiKey}&url=${encodeURIComponent(url)}`;
  }

  const res = await fetch(proxyUrl);
  if (!res.ok) {
    throw new Error(`${provider} API 抓取请求失败，状态码: ${res.status}`);
  }

  const html = await res.text();
  return parseAmazonProductHtml(html, asin);
}

// Rainforest API 抓取
async function scrapeAmazonRainforest(asin, domain, language, zipcode, apiKey) {
  let url = `https://api.rainforestapi.com/request?api_key=${apiKey}&type=product&asin=${asin}&amazon_domain=${domain}`;
  if (language) url += `&language=${language}`;
  if (zipcode) url += `&customer_zipcode=${zipcode}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Rainforest API 抓取失败，HTTP 状态码: ${res.status}`);
  }

  const data = await res.json();
  if (!data.product) {
    throw new Error(data.request_info?.message || '亚马逊商品数据抓取未返回任何商品信息');
  }

  const p = data.product;
  const title = p.title || `Amazon Product ${asin}`;
  const price = p.buybox_winner?.price?.value || p.price?.value || p.buybox_winner?.price?.amount || 24.99;
  const comparePrice = price ? Math.round(price * 1.5 * 100) / 100 : 39.99;
  const imageUrl = p.main_image?.link || '';
  const gallery = JSON.stringify((p.images || []).map(img => img.link).filter(Boolean));
  const description = p.description || p.feature_bullets_flat || '';
  
  let contentHtml = '';
  if (p.feature_bullets && p.feature_bullets.length > 0) {
    contentHtml += '<h3>Key Features</h3><ul>';
    p.feature_bullets.forEach(bullet => {
      contentHtml += `<li>${bullet}</li>`;
    });
    contentHtml += '</ul>';
  }
  if (p.description) {
    contentHtml += `<h3>Product Description</h3><p>${p.description}</p>`;
  }

  const compatibleModels = '[]';
  const features = JSON.stringify(p.feature_bullets || []);
  const brand = p.brand || 'Generic';
  const category = p.categories?.[p.categories.length - 1]?.name || 'Water Filters';
  const sku = `AMZ-${asin}`;

  return {
    title,
    price,
    comparePrice,
    imageUrl,
    gallery,
    description: description.slice(0, 300),
    content: contentHtml,
    compatibleModels,
    features,
    brand,
    category,
    sku
  };
}

export async function GET(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id: siteId } = params;

  try {
    const site = await getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 444 });
    }

    if (!site.d1_database_id) {
      return NextResponse.json([]);
    }

    const cfAccount = await getCFAccountById(site.cf_account_id);
    if (!cfAccount) {
      return NextResponse.json({ error: 'Cloudflare account not found' }, { status: 400 });
    }

    const { api_token: apiToken, account_id: accountId } = cfAccount;

    const sql = `SELECT * FROM products ORDER BY sort_order ASC, id DESC`;
    const result = await executeSQLOnD1(apiToken, accountId, site.d1_database_id, sql);
    
    const products = result[0]?.results || result.results || [];
    return NextResponse.json(products);
  } catch (error) {
    console.error('Fetch site products error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch site products' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id: siteId } = params;

  try {
    const site = await getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 444 });
    }

    if (!site.d1_database_id) {
      return NextResponse.json({ error: '请先部署该站点以初始化 D1 数据库。' }, { status: 400 });
    }

    const cfAccount = await getCFAccountById(site.cf_account_id);
    if (!cfAccount) {
      return NextResponse.json({ error: '未找到绑定的 Cloudflare 账号凭证。' }, { status: 400 });
    }

    const { api_token: apiToken, account_id: accountId } = cfAccount;
    const body = await request.json();
    const { asins, products, domain = 'amazon.com', language = 'en_US', zipcode = '', publishDirectly = false } = body;

    // 如果前端直接传输了已经抓取完成的商品数据，则直接入库
    if (products && Array.isArray(products) && products.length > 0) {
      const results = [];
      for (const p of products) {
        try {
          const cleanSlug = `${slugify(p.title.slice(0, 50))}-${p.sku.replace('AMZ-', '').toLowerCase()}`;
          const insertSql = `
            INSERT INTO products (
              title, slug, description, content, price, compare_price, 
              category, brand, sku, image_url, gallery, compatible_models, features, affiliate_link, is_active, is_featured
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
          `;
          const insertParams = [
            p.title,
            cleanSlug,
            p.description || '',
            p.content || '',
            p.price,
            p.comparePrice,
            p.category || 'apparel',
            p.brand || 'Generic',
            p.sku,
            p.imageUrl,
            p.gallery || JSON.stringify([p.imageUrl]),
            p.compatibleModels || '[]',
            p.features || '[]',
            p.affiliate_link || p.link || '',
            publishDirectly ? 1 : 0
          ];
          await executeSQLOnD1(apiToken, accountId, site.d1_database_id, insertSql, insertParams);
          results.push({ 
            asin: p.sku.replace('AMZ-', ''), 
            success: true, 
            title: p.title,
            price: p.price,
            comparePrice: p.comparePrice,
            imageUrl: p.imageUrl,
            sku: p.sku,
            brand: p.brand
          });
        } catch (err) {
          console.error(`Failed to import pre-scraped product:`, err);
          results.push({ asin: p.sku?.replace('AMZ-', '') || 'unknown', success: false, error: err.message });
        }
      }
      const successCount = results.filter(r => r.success).length;
      if (successCount === 0) {
        return NextResponse.json({ error: `上架失败。首个错误信息: ${results[0]?.error}`, results }, { status: 500 });
      }
      return NextResponse.json({
        success: true,
        results,
        message: `成功保存并上架 ${successCount}/${products.length} 个商品。`
      });
    }

    // 支持接收 asins 数组或单串逗号分隔 of asins
    let asinList = [];
    if (Array.isArray(asins)) {
      asinList = asins.map(a => a.trim()).filter(Boolean);
    } else if (typeof asins === 'string') {
      asinList = asins.split(/[\s,;\n\r]+/).map(a => a.trim()).filter(Boolean);
    }

    if (asinList.length === 0) {
      return NextResponse.json({ error: '至少需要提供一个 ASIN 编码。' }, { status: 400 });
    }

    const scraperType = (await getMgrSetting('amazon_scraper_type')) || 'direct';
    const scraperKey = (await getMgrSetting('amazon_scraper_key')) || '';

    const results = [];

    // 循环依次处理所有 ASIN 抓取上架
    for (const asin of asinList) {
      try {
        let productDetails;
        if (scraperType === 'rainforest' && scraperKey) {
          productDetails = await scrapeAmazonRainforest(asin, domain, language, zipcode, scraperKey);
        } else if ((scraperType === 'scraperapi' || scraperType === 'crawlbase') && scraperKey) {
          productDetails = await scrapeAmazonProxyAPI(asin, domain, scraperType, scraperKey);
        } else {
          productDetails = await scrapeAmazonDirect(asin, domain, language, zipcode);
        }

        const cleanSlug = `${slugify(productDetails.title.slice(0, 50))}-${asin.toLowerCase()}`;

        const insertSql = `
          INSERT INTO products (
            title, slug, description, content, price, compare_price, 
            category, brand, sku, image_url, gallery, compatible_models, features, is_active, is_featured
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `;

        const insertParams = [
          productDetails.title,
          cleanSlug,
          productDetails.description,
          productDetails.content,
          productDetails.price,
          productDetails.comparePrice,
          productDetails.category,
          productDetails.brand,
          productDetails.sku,
          productDetails.imageUrl,
          productDetails.gallery,
          productDetails.compatibleModels,
          productDetails.features,
          publishDirectly ? 1 : 0
        ];

        await executeSQLOnD1(apiToken, accountId, site.d1_database_id, insertSql, insertParams);

        results.push({ 
          asin, 
          success: true, 
          title: productDetails.title,
          price: productDetails.price,
          comparePrice: productDetails.comparePrice,
          imageUrl: productDetails.imageUrl,
          sku: productDetails.sku,
          brand: productDetails.brand
        });
      } catch (err) {
        console.error(`Failed to import ASIN ${asin}:`, err);
        results.push({ asin, success: false, error: err.message });
      }
    }

    // 判断是否有成功的上架
    const successCount = results.filter(r => r.success).length;
    if (successCount === 0 && asinList.length > 0) {
      return NextResponse.json({ 
        error: `全部 ASIN 上架失败。首个错误信息: ${results[0]?.error}`, 
        results 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      results,
      message: `成功抓取并上架 ${successCount}/${asinList.length} 个商品。` 
    });
  } catch (error) {
    console.error('Batch import products error:', error);
    return NextResponse.json({ error: error.message || 'Failed to import products' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id: siteId } = params;

  try {
    const site = await getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 444 });
    }

    if (!site.d1_database_id) {
      return NextResponse.json({ error: '请先部署该站点以初始化 D1 数据库。' }, { status: 400 });
    }

    const cfAccount = await getCFAccountById(site.cf_account_id);
    if (!cfAccount) {
      return NextResponse.json({ error: '未找到绑定的 Cloudflare 账号凭证。' }, { status: 400 });
    }

    const { api_token: apiToken, account_id: accountId } = cfAccount;
    const body = await request.json();
    const { productIds } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: '未选择任何商品。' }, { status: 400 });
    }

    const placeholders = productIds.map(() => '?').join(', ');
    const sql = `DELETE FROM products WHERE id IN (${placeholders})`;

    await executeSQLOnD1(apiToken, accountId, site.d1_database_id, sql, productIds);

    return NextResponse.json({ success: true, message: `成功删除 ${productIds.length} 个商品。` });
  } catch (error) {
    console.error('Batch delete products error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete products' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id: siteId } = params;

  try {
    const site = await getSiteById(siteId);
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 });
    }

    if (!site.d1_database_id) {
      return NextResponse.json({ error: '请先部署该站点以初始化 D1 数据库。' }, { status: 400 });
    }

    const cfAccount = await getCFAccountById(site.cf_account_id);
    if (!cfAccount) {
      return NextResponse.json({ error: '未找到绑定的 Cloudflare 账号凭证。' }, { status: 400 });
    }

    const { api_token: apiToken, account_id: accountId } = cfAccount;
    const body = await request.json();
    const { productIds, isActive, isFeatured } = body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: '未选择任何商品。' }, { status: 400 });
    }

    if (isActive === undefined && isFeatured === undefined) {
      return NextResponse.json({ error: '缺少更新参数' }, { status: 400 });
    }

    let sql = '';
    let paramsList = [];

    if (isActive !== undefined) {
      const targetStatus = isActive ? 1 : 0;
      const placeholders = productIds.map(() => '?').join(', ');
      sql = `UPDATE products SET is_active = ? WHERE id IN (${placeholders})`;
      paramsList = [targetStatus, ...productIds];
    } else if (isFeatured !== undefined) {
      const targetFeatured = isFeatured ? 1 : 0;
      const placeholders = productIds.map(() => '?').join(', ');
      sql = `UPDATE products SET is_featured = ? WHERE id IN (${placeholders})`;
      paramsList = [targetFeatured, ...productIds];
    }

    await executeSQLOnD1(apiToken, accountId, site.d1_database_id, sql, paramsList);

    let successMsg = '';
    if (isActive !== undefined) {
      successMsg = isActive 
        ? `成功上架所选的 ${productIds.length} 个商品！` 
        : `成功下架所选的 ${productIds.length} 个商品！`;
    } else {
      successMsg = isFeatured
        ? `成功将所选的 ${productIds.length} 个商品设为首页推荐！`
        : `成功取消所选 ${productIds.length} 个商品的首页推荐。`;
    }

    return NextResponse.json({ 
      success: true, 
      message: successMsg
    });
  } catch (error) {
    console.error('Batch status update products error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update products status' }, { status: 500 });
  }
}

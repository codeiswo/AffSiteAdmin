import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getMgrSetting } from '@/lib/db';

export const runtime = 'edge';

// Direct Cloud search algorithm using HTML parsing
async function scrapeAmazonSearchDirect(query, domain, language, limit = 100) {
  const allResults = [];
  const seenAsins = new Set();
  let pageNum = 1;
  const maxPages = Math.ceil(limit / 16) + 2;

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': language === 'zh_CN' ? 'zh-CN,zh;q=0.9,en;q=0.8' : 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  while (allResults.length < limit && pageNum <= maxPages) {
    const searchUrl = `https://www.${domain}/s?k=${encodeURIComponent(query)}&page=${pageNum}&language=${language}`;
    const res = await fetch(searchUrl, { headers });
    if (!res.ok) break;

    const html = await res.text();
    if (html.includes('captcha') || html.includes('Robot Check')) {
      if (allResults.length > 0) break; // Return whatever results we got so far
      throw new Error('被亚马逊防爬验证拦截。直连模式在云端 IP 下易被拦截，建议启动“本地抓取助手”(npm run local-scraper) 或配置 Rainforest API。');
    }

    // Split HTML by data-asin="
    const parts = html.split('data-asin="');
    let pageAdded = 0;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const asin = part.slice(0, 10);
      if (!/^[A-Z0-9]{10}$/.test(asin)) continue;
      if (seenAsins.has(asin)) continue;

      const snippet = part.slice(0, 10000);

      // Image
      let imageUrl = '';
      const imgMatch = snippet.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/i);
      if (imgMatch) imageUrl = imgMatch[1];

      // Title: find longest text inside h2 or alt attribute
      let title = '';
      const h2Matches = [...snippet.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>/gi)];
      for (const h2 of h2Matches) {
        const text = h2[0].replace(/<[^>]+>/g, '').trim();
        if (text.length > title.length && text !== "Amazon's Choice" && !text.includes('Sponsor')) {
          title = text;
        }
      }
      if (!title || title.length < 10) {
        const altMatch = snippet.match(/alt="([^"]{10,250})"/i);
        if (altMatch) title = altMatch[1].trim();
      }
      if (!title || title.length < 5) continue;

      // Price
      let price = '';
      const priceOffscreen = snippet.match(/<span class="a-offscreen">([^<]+)<\/span>/i);
      if (priceOffscreen) {
        price = priceOffscreen[1].trim();
      } else {
        const priceWhole = snippet.match(/<span class="a-price-whole">([0-9.,]+)<\/span>/i);
        const priceFrac = snippet.match(/<span class="a-price-fraction">([0-9]{2})<\/span>/i);
        if (priceWhole) {
          price = `$${priceWhole[1]}${priceFrac ? '.' + priceFrac[1] : ''}`;
        }
      }

      // Rating
      let rating = '';
      const ratingMatch = snippet.match(/aria-label="([0-9\.]+\s+out of 5 stars[^"]*)"/i) || snippet.match(/<span class="a-icon-alt">([^<]+)<\/span>/i);
      if (ratingMatch) rating = ratingMatch[1].replace(', rating details', '').trim();

      // Reviews count
      let reviewsCount = '';
      const reviewsMatch = snippet.match(/a-size-base s-underline-text">([0-9,]+)<\/span>/i) || snippet.match(/aria-label="([0-9,]+) ratings"/i);
      if (reviewsMatch) reviewsCount = reviewsMatch[1].trim();

      seenAsins.add(asin);
      allResults.push({
        asin,
        title: title.replace(/\s+/g, ' ').slice(0, 150),
        image_url: imageUrl,
        price,
        rating,
        reviews_count: reviewsCount,
        link: `https://www.${domain}/dp/${asin}`
      });

      pageAdded++;
      if (allResults.length >= limit) break;
    }

    if (pageAdded === 0) break;
    pageNum++;
  }

  return allResults;
}

// Rainforest Search API
async function scrapeAmazonSearchRainforest(query, domain, language, apiKey, limit = 100) {
  const allResults = [];
  let pageNum = 1;
  const maxPages = Math.ceil(limit / 16) + 1;

  while (allResults.length < limit && pageNum <= maxPages) {
    let url = `https://api.rainforestapi.com/request?api_key=${apiKey}&type=search&search_term=${encodeURIComponent(query)}&amazon_domain=${domain}&page=${pageNum}`;
    if (language) url += `&language=${language}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Rainforest Search API 响应状态码: ${res.status}`);

    const data = await res.json();
    const searchResults = data.search_results || [];
    if (searchResults.length === 0) break;

    for (const item of searchResults) {
      if (!item.asin) continue;
      allResults.push({
        asin: item.asin,
        title: item.title || `Amazon Product ${item.asin}`,
        image_url: item.image || item.main_image?.link || '',
        price: item.price?.raw || (item.price?.value ? `$${item.price.value}` : ''),
        rating: item.rating ? `${item.rating} out of 5 stars` : '',
        reviews_count: item.ratings_total ? `${item.ratings_total}` : '',
        link: item.link || `https://www.${domain}/dp/${item.asin}`
      });
      if (allResults.length >= limit) break;
    }

    pageNum++;
  }

  return allResults;
}

// Proxy-based Amazon Search (ScraperAPI / Crawlbase)
async function scrapeAmazonSearchProxyAPI(query, domain, language, provider, apiKey, limit = 100) {
  const allResults = [];
  const seenAsins = new Set();
  let pageNum = 1;
  const maxPages = Math.ceil(limit / 16) + 1;

  while (allResults.length < limit && pageNum <= maxPages) {
    const searchUrl = `https://www.${domain}/s?k=${encodeURIComponent(query)}&page=${pageNum}&language=${language}`;
    let proxyUrl = '';
    if (provider === 'scraperapi') {
      proxyUrl = `http://api.scraperapi.com/?api_key=${apiKey}&url=${encodeURIComponent(searchUrl)}`;
    } else if (provider === 'crawlbase') {
      proxyUrl = `https://api.crawlbase.com/?token=${apiKey}&url=${encodeURIComponent(searchUrl)}`;
    }

    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`Proxy API returned status ${res.status}`);

    const html = await res.text();
    if (html.includes('captcha') || html.includes('Robot Check')) {
      throw new Error('Proxy was blocked or encountered a Captcha.');
    }

    const parts = html.split('data-asin="');
    let pageAdded = 0;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      const asin = part.slice(0, 10);
      if (!/^[A-Z0-9]{10}$/.test(asin)) continue;
      if (seenAsins.has(asin)) continue;

      const snippet = part.slice(0, 10000);

      // Image
      let imageUrl = '';
      const imgMatch = snippet.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/i);
      if (imgMatch) imageUrl = imgMatch[1];

      // Title
      let title = '';
      const h2Matches = [...snippet.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>/gi)];
      for (const h2 of h2Matches) {
        const text = h2[0].replace(/<[^>]+>/g, '').trim();
        if (text.length > title.length && text !== "Amazon's Choice" && !text.includes('Sponsor')) {
          title = text;
        }
      }
      if (!title || title.length < 10) {
        const altMatch = snippet.match(/alt="([^"]{10,250})"/i);
        if (altMatch) title = altMatch[1].trim();
      }
      if (!title || title.length < 5) continue;

      // Price
      let price = '';
      const priceOffscreen = snippet.match(/<span class="a-offscreen">([^<]+)<\/span>/i);
      if (priceOffscreen) {
        price = priceOffscreen[1].trim();
      } else {
        const priceWhole = snippet.match(/<span class="a-price-whole">([0-9.,]+)<\/span>/i);
        const priceFrac = snippet.match(/<span class="a-price-fraction">([0-9]{2})<\/span>/i);
        if (priceWhole) {
          price = `$${priceWhole[1]}${priceFrac ? '.' + priceFrac[1] : ''}`;
        }
      }

      // Rating
      let rating = '';
      const ratingMatch = snippet.match(/aria-label="([0-9\.]+\s+out of 5 stars[^"]*)"/i) || snippet.match(/<span class="a-icon-alt">([^<]+)<\/span>/i);
      if (ratingMatch) rating = ratingMatch[1].replace(', rating details', '').trim();

      // Reviews count
      let reviewsCount = '';
      const reviewsMatch = snippet.match(/a-size-base s-underline-text">([0-9,]+)<\/span>/i) || snippet.match(/aria-label="([0-9,]+) ratings"/i);
      if (reviewsMatch) reviewsCount = reviewsMatch[1].trim();

      seenAsins.add(asin);
      allResults.push({
        asin,
        title: title.replace(/\s+/g, ' ').slice(0, 150),
        image_url: imageUrl,
        price,
        rating,
        reviews_count: reviewsCount,
        link: `https://www.${domain}/dp/${asin}`
      });

      pageAdded++;
      if (allResults.length >= limit) break;
    }

    if (pageAdded === 0) break;
    pageNum++;
  }

  return allResults;
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { query, domain = 'amazon.com', language = 'en_US', limit = 100 } = await request.json();

    if (!query || !query.trim()) {
      return NextResponse.json({ error: '搜索关键词不能为空' }, { status: 400 });
    }

    const scraperType = (await getMgrSetting('amazon_scraper_type')) || 'direct';
    const scraperKey = (await getMgrSetting('amazon_scraper_key')) || '';

    let results = [];
    if (scraperType === 'rainforest' && scraperKey) {
      results = await scrapeAmazonSearchRainforest(query.trim(), domain, language, scraperKey, limit);
    } else if ((scraperType === 'scraperapi' || scraperType === 'crawlbase') && scraperKey) {
      results = await scrapeAmazonSearchProxyAPI(query.trim(), domain, language, scraperType, scraperKey, limit);
    } else {
      results = await scrapeAmazonSearchDirect(query.trim(), domain, language, limit);
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Amazon search API error:', error);
    return NextResponse.json({ error: error.message || '搜索处理异常' }, { status: 500 });
  }
}

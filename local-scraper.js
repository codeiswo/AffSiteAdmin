const http = require('http');
const { URL } = require('url');

const fs = require('fs');

let puppeteer;
let isCore = false;
try {
  puppeteer = require('puppeteer');
} catch (e) {
  try {
    puppeteer = require('puppeteer-core');
    isCore = true;
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', '--------------------------------------------------------------');
    console.error('\x1b[31m%s\x1b[0m', '提示：本地抓取助手需要依赖 puppeteer-core。');
    console.error('\x1b[31m%s\x1b[0m', '请直接在终端运行以下命令（免浏览器下载，极速安装）：');
    console.error('\x1b[33m%s\x1b[0m', '  npm install puppeteer-core');
    console.error('\x1b[31m%s\x1b[0m', '--------------------------------------------------------------');
  }
}

// 自动检测本地系统中的 Chrome/Chromium 可执行文件路径
let chromePath = '';
if (process.platform === 'darwin') {
  const paths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      chromePath = p;
      break;
    }
  }
} else if (process.platform === 'win32') {
  const paths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    (process.env.LOCALAPPDATA || '') + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      chromePath = p;
      break;
    }
  }
} else {
  // Linux
  const paths = [
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) {
      chromePath = p;
      break;
    }
  }
}

const PORT = 3005;

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);

  if (parsedUrl.pathname === '/scrape' && req.method === 'POST') {
    if (!puppeteer) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '本地缺少 puppeteer 依赖，请在终端运行 "npm install puppeteer" 安装它，并重启该抓取助手。' }));
      return;
    }

    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { asin, domain = 'amazon.com', language = 'en_US', zipcode = '', headless = true } = payload;

        if (!asin) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '缺少 ASIN 编码' }));
          return;
        }

        console.log(`[抓取任务] 正在抓取 ASIN: ${asin}, 站点: ${domain}, 语言: ${language}, 邮编: ${zipcode || '默认'}, 可视化: ${!headless}`);

        const result = await scrapeProduct(asin, domain, language, zipcode, headless);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('抓取失败:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || '抓取失败' }));
      }
    });
  } else if (parsedUrl.pathname === '/scrape-search' && req.method === 'POST') {
    if (!puppeteer) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: '本地缺少 puppeteer 依赖。' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        const { query, domain = 'amazon.com', language = 'en_US', limit = 100, headless = true } = payload;

        if (!query) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '缺少搜索关键词' }));
          return;
        }

        console.log(`[搜索任务] 正在搜索关键词: "${query}", 站点: ${domain}, 语言: ${language}, 目标抓取数: ${limit}`);

        const result = await scrapeSearch(query, domain, language, limit, headless);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('搜索抓取失败:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message || '搜索抓取失败' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

async function scrapeProduct(asin, domain, language, zipcode, headless) {
  let browser;
  try {
    const launchOptions = {
      headless: headless ? 'new' : false,
      defaultViewport: null,
      args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
    };

    if (chromePath) {
      launchOptions.executablePath = chromePath;
      console.log(`[启动参数] 自动检测到本地 Chrome 路径: ${chromePath}`);
    } else if (isCore) {
      console.warn('[警告] 使用 puppeteer-core 但未检测到本地 Chrome，请确保系统已安装 Chrome 浏览器。');
    }

    browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();
    
    // Set custom User Agent
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    // 强制设置对应的 Accept-Language 标头，防止中文操作系统浏览器默认发送 zh-CN 导致亚马逊自动机翻标题/详情
    let acceptLang = 'en-US,en;q=0.9';
    if (language === 'zh_CN') acceptLang = 'zh-CN,zh;q=0.9,en;q=0.8';
    else if (language === 'ja_JP') acceptLang = 'ja-JP,ja;q=0.9,en;q=0.8';
    else if (language === 'de_DE') acceptLang = 'de-DE,de;q=0.9,en;q=0.8';
    else if (language === 'es_ES') acceptLang = 'es-ES,es;q=0.9,en;q=0.8';
    else if (language === 'fr_FR') acceptLang = 'fr-FR,fr;q=0.9,en;q=0.8';
    else if (language === 'it_IT') acceptLang = 'it-IT,it;q=0.9,en;q=0.8';

    await page.setExtraHTTPHeaders({
      'Accept-Language': acceptLang
    });

    // 预先写入语言 Cookie，确保亚马逊服务端的 HTML 输出为指定语言
    try {
      await page.setCookie({
        name: 'lc-main',
        value: language,
        domain: '.' + domain,
        path: '/'
      });
      await page.setCookie({
        name: 'lc-main-amazon',
        value: language,
        domain: '.' + domain,
        path: '/'
      });
    } catch (cookieErr) {
      console.log('设置语言 Cookie 失败:', cookieErr.message);
    }

    // 1. Navigate to Amazon product page (URL 加上 language 参数三重保险)
    const url = `https://${domain}/dp/${asin}?language=${language}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // 检测验证码页面，以及“Continue shopping（继续购物）”的安全屏障页面
    const checkCaptchaStatus = async () => {
      return await page.evaluate(() => {
        const html = document.body.innerHTML;
        return html.includes('captcha') || 
               html.includes('Robot Check') || 
               html.includes('continue shopping') || 
               html.includes('Continue shopping') ||
               document.querySelector('input[type="submit"][value*="shopping"]') !== null ||
               document.querySelector('button[type="submit"]') !== null && document.body.innerHTML.includes('shopping');
      });
    };

    const isCaptcha = await checkCaptchaStatus();

    if (isCaptcha) {
      if (headless) {
        // 如果是无头模式，尝试自动寻找并点击一次 "Continue shopping" 按钮
        try {
          const btn = await page.$('input[type="submit"], button, .a-button-text');
          if (btn) {
            await btn.click();
            await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});
            const stillCaptcha = await checkCaptchaStatus();
            if (!stillCaptcha) {
              console.log('无头模式下成功自动点击 Continue shopping 并通过验证。');
            } else {
              throw new Error('被亚马逊防爬拦截（需要输入验证码）。请开启“可视化”选项抓取，以便在弹出浏览器时手动滑动解锁验证码。');
            }
          } else {
            throw new Error('被亚马逊防爬拦截（需要输入验证码）。请开启“可视化”选项抓取，以便在弹出浏览器时手动滑动解锁验证码。');
          }
        } catch (autoErr) {
          throw new Error('被亚马逊防爬拦截（需要输入验证码）。请开启“可视化”选项抓取，以便在弹出浏览器时手动滑动解锁验证码。');
        }
      } else {
        console.log('检测到验证码或“继续购物”安全屏障，正在尝试自动点击或等待手动解锁...');
        
        // 尝试自动寻找并点击一次 "Continue shopping" 按钮，免去用户手动点击
        try {
          const btn = await page.$('input[type="submit"], button, .a-button-text');
          if (btn) {
            await btn.click();
            console.log('已自动点击 "Continue shopping" 按钮...');
          }
        } catch (err) {
          console.log('尝试自动点击 "Continue shopping" 按钮时出错:', err.message);
        }

        // 最长等待 60 秒供用户手动滑动验证码或处理
        let resolved = false;
        for (let i = 0; i < 30; i++) {
          await new Promise(r => setTimeout(r, 2000));
          try {
            const stillCaptcha = await checkCaptchaStatus();
            if (!stillCaptcha) {
              resolved = true;
              break;
            }
          } catch (e) {
            // Execution context destroyed 说明页面正在跳转刷新中，这是正常的
            console.log('检测到页面正在跳转中...');
            resolved = true;
            break;
          }
        }
        if (!resolved) {
          throw new Error('验证码或验证界面超时未解锁，请重试并尽快解锁。');
        }
        console.log('验证已解锁，等待商品页面加载...');
        // 等待跳转后的内容完全加载
        try {
          await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 });
        } catch (e) {
          // 忽略超时
        }
        await new Promise(r => setTimeout(r, 3000));
        console.log('继续抓取数据...');
      }
    }

    // 2. Set zip code if provided
    if (zipcode) {
      try {
        console.log(`正在设置收货邮编: ${zipcode}...`);
        
        // Wait for delivery location button
        const locationButton = await page.$('#nav-global-location-popover-link');
        if (locationButton) {
          await locationButton.click();
          await page.waitForSelector('#GLUXZipUpdateInput', { visible: true, timeout: 5000 });
          
          // Type zip code
          await page.type('#GLUXZipUpdateInput', zipcode);
          
          // Click update
          const applyBtn = await page.$('#GLUXZipUpdate input[type="submit"]');
          if (applyBtn) {
            await applyBtn.click();
          } else {
            const applyBtn2 = await page.$('#GLUXZipUpdateInput_submit');
            if (applyBtn2) await applyBtn2.click();
          }
          
          // Wait for popover or reload
          await new Promise(r => setTimeout(r, 2000));
          
          // Reload page to apply new location details
          await page.reload({ waitUntil: 'domcontentloaded' });
        }
      } catch (err) {
        console.log('设置邮编遇到错误，跳过邮编设定:', err.message);
      }
    }

    // Wait a brief moment for page to stabilize
    await new Promise(r => setTimeout(r, 2000));

    // 3. Extract raw product attributes from browser context (using async page.evaluate to downscale and compare pixel data via Canvas)
    const rawDetails = await page.evaluate(async () => {
      const cleanImage = (src) => {
        if (!src) return '';
        try {
          src = decodeURIComponent(src);
        } catch (e) {}
        return src.replace(/\._[^.]+\.([^.]+)$/, '.$1');
      };

      // Title
      const titleEl = document.querySelector('#productTitle');
      const title = titleEl ? titleEl.textContent.trim() : '';

      // Price
      let price = 0;
      const wholeEl = document.querySelector('.a-price-whole');
      const fractionEl = document.querySelector('.a-price-fraction');
      if (wholeEl && fractionEl) {
        const wholeStr = wholeEl.textContent.replace(/[^0-9]/g, '').trim();
        const fractionStr = fractionEl.textContent.replace(/[^0-9]/g, '').trim();
        price = parseFloat(`${wholeStr}.${fractionStr}`);
      } else {
        const offscreenEl = document.querySelector('.a-offscreen');
        if (offscreenEl) {
          price = parseFloat(offscreenEl.textContent.replace(/[^0-9.]/g, ''));
        }
      }
      if (!price) price = 24.99;

      const comparePrice = Math.round(price * 1.5 * 100) / 100;

      // Main Image
      const imgEl = document.querySelector('#landingImage');
      const imageUrl = imgEl ? imgEl.getAttribute('src') : 'https://placehold.co/600x600/0f4c81/ffffff?text=Amazon+Product';
      const cleanImageUrl = cleanImage(imageUrl);

      // Brand
      const brandEl = document.querySelector('#bylineInfo');
      let brand = 'Generic';
      if (brandEl) {
        brand = brandEl.textContent.replace(/Brand:\s*/i, '').replace(/Visit the\s+/i, '').replace(/\s+Store/i, '').trim();
      }

      // Feature Bullets
      const features = [];
      const bulletItems = document.querySelectorAll('#feature-bullets ul li span.a-list-item');
      bulletItems.forEach(item => {
        const clean = item.textContent.replace(/<[^>]+>/g, '').trim();
        if (clean && clean.length > 5 && !clean.includes('Make sure this fits')) {
          features.push(clean);
        }
      });

      if (features.length === 0) {
        features.push('High-quality replacement filter', 'NSF Certified performance', 'Easy twist-and-lock installation');
      }

      // Collect all candidate image URLs, starting with the main image
      const candidateUrls = [];
      if (cleanImageUrl) {
        candidateUrls.push(cleanImageUrl);
      }

      const imgEls = document.querySelectorAll('#altImages img');
      imgEls.forEach(img => {
        // Exclude hidden elements to prevent loading unselected variation images
        if (img.offsetWidth === 0 && img.offsetHeight === 0) {
          return;
        }
        const src = img.getAttribute('src');
        if (src) {
          const parentLi = img.closest('li, span, div');
          const parentClass = parentLi ? parentLi.className.toLowerCase() : '';
          const parentHtml = parentLi ? parentLi.innerHTML.toLowerCase() : '';
          
          // Exclude video items
          const isVideo = parentClass.includes('video') || parentClass.includes('play') ||
                          parentHtml.includes('video') || parentHtml.includes('play') ||
                          src.toLowerCase().includes('video') || src.toLowerCase().includes('play');
          if (!isVideo) {
            const highResUrl = cleanImage(src);
            if (highResUrl && !candidateUrls.includes(highResUrl)) {
              candidateUrls.push(highResUrl);
            }
          }
        }
      });

      // Canvas based pixel comparison functions to detect identical images with different filenames
      const getPixelData = (url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous'; // media-amazon.com supports CORS *
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 30;
            canvas.height = 30;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 30, 30);
            try {
              resolve(ctx.getImageData(0, 0, 30, 30).data);
            } catch (e) {
              resolve(null); // Return null if tainted canvas or read error occurs
            }
          };
          img.onerror = () => resolve(null);
          img.src = url + (url.includes('?') ? '&' : '?') + '_ts=' + Date.now();
        });
      };

      const comparePixels = (d1, d2) => {
        if (!d1 || !d2) return 999;
        let diff = 0;
        for (let i = 0; i < d1.length; i += 4) {
          diff += Math.abs(d1[i] - d2[i]) + 
                  Math.abs(d1[i+1] - d2[i+1]) + 
                  Math.abs(d1[i+2] - d2[i+2]);
        }
        return diff / (30 * 30 * 3);
      };

      // Load all candidate pixels in parallel
      const loadedData = [];
      try {
        const promises = candidateUrls.map(async (url) => {
          const pixels = await getPixelData(url);
          return { url, pixels };
        });
        const results = await Promise.all(promises);
        loadedData.push(...results);
      } catch (err) {
        // Fallback to raw list if browser loading fails
        candidateUrls.forEach(url => loadedData.push({ url, pixels: null }));
      }

      // Filter duplicates based on average color difference threshold (< 15)
      const galleryUrls = [];
      const addedPixels = [];

      for (const item of loadedData) {
        let isDuplicate = false;
        if (item.pixels) {
          for (const added of addedPixels) {
            const diff = comparePixels(item.pixels, added.pixels);
            if (diff < 22) {
              isDuplicate = true;
              break;
            }
          }
        }
        if (!isDuplicate) {
          galleryUrls.push(item.url);
          if (item.pixels) {
            addedPixels.push(item);
          }
        }
      }

      return {
        title,
        price,
        comparePrice,
        imageUrl: cleanImageUrl || imageUrl,
        galleryUrls,
        brand,
        rawFeatures: features
      };
    });

    const cleanImageUrl = rawDetails.imageUrl;
    const galleryUrls = rawDetails.galleryUrls;

    // Optimize Title
    const optimizedTitle = optimizeTitle(rawDetails.title, rawDetails.brand);

    // Generate marketing data, descriptions and structured HTML content (Key Features card)
    const marketing = generateMarketingData(optimizedTitle, rawDetails.brand, rawDetails.rawFeatures);

    const details = {
      title: optimizedTitle,
      price: rawDetails.price,
      comparePrice: rawDetails.comparePrice,
      imageUrl: cleanImageUrl || rawDetails.imageUrl,
      gallery: JSON.stringify(galleryUrls),
      description: marketing.description,
      content: marketing.content,
      compatibleModels: '[]',
      features: JSON.stringify(marketing.features),
      brand: rawDetails.brand,
      category: 'Refrigerator Water Filters',
      sku: `AMZ-${asin}`
    };

    return details;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// ========================================================
// Helper Functions for Data Optimization
// ========================================================

function optimizeTitle(rawTitle, brand) {
  if (!rawTitle) return '';
  
  // Clean HTML entities and multiple spaces
  let title = rawTitle.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  
  // Try to find the pack size
  let packSize = '';
  const packRegexes = [
    /(\d+[- ]?pack(?:s)?)/i,
    /(pack of \d+)/i,
    /(\d+\s*pcs)/i
  ];
  for (const regex of packRegexes) {
    const match = title.match(regex);
    if (match) {
      packSize = match[1];
      packSize = packSize.replace(/[- ]/g, '-');
      packSize = packSize.charAt(0).toUpperCase() + packSize.slice(1);
      break;
    }
  }
  
  // Find key model numbers/codes
  const words = title.split(/[\s,/\-|()]+/);
  const models = [];
  for (const word of words) {
    const isModelFormat = /^[A-Z0-9-]{5,15}$/.test(word) && 
                          /[A-Z]/.test(word) && 
                          /[0-9]/.test(word);
    const isKnownFilter = /^(MWF|MSWF|GSWF|UKF8001|LT1000P|LT800P|LT700P|ADQ[0-9]+)$/i.test(word);
    
    if ((isModelFormat || isKnownFilter) && !models.includes(word.toUpperCase())) {
      models.push(word.toUpperCase());
    }
  }
  
  // Determine product type
  let productType = 'Refrigerator Water Filter';
  const titleLower = title.toLowerCase();
  if (titleLower.includes('air filter')) {
    productType = 'Refrigerator Air Filter';
  } else if (titleLower.includes('ice maker') || titleLower.includes('ice-maker')) {
    productType = 'Ice Maker';
  }
  
  // Build clean title
  const cleanBrand = brand && brand !== 'Generic' && brand !== 'Visit the' ? brand.replace(/Brand:\s*/i, '').trim() : '';
  const primaryModel = models.length > 0 ? models[0] : '';
  
  let cleanTitle = '';
  if (cleanBrand) {
    cleanTitle += cleanBrand + ' ';
  }
  if (primaryModel) {
    cleanTitle += primaryModel + ' ';
  }
  cleanTitle += 'Replacement ' + productType;
  
  if (packSize) {
    const num = packSize.match(/\d+/);
    if (num) {
      cleanTitle += ` (${num[0]}-Pack)`;
    } else {
      cleanTitle += ` (${packSize})`;
    }
  }
  
  if (cleanTitle.trim().length < 15) {
    const cutOff = title.split(/[,;\-(]/)[0].trim();
    cleanTitle = cutOff.length > 10 ? cutOff : title.slice(0, 60);
  }
  
  return cleanTitle.trim();
}

function generateMarketingData(title, brand, rawFeatures) {
  const features = Array.isArray(rawFeatures) ? rawFeatures : [];
  
  let hasNSF42 = false;
  let hasNSF53 = false;
  let hasNSF372 = false;
  let isLeadFree = false;
  
  const allText = (title + ' ' + features.join(' ')).toLowerCase();
  
  if (allText.includes('42') && allText.includes('nsf')) hasNSF42 = true;
  if (allText.includes('53') && allText.includes('nsf')) hasNSF53 = true;
  if (allText.includes('372') && allText.includes('nsf')) hasNSF372 = true;
  if (allText.includes('lead free') || allText.includes('lead-free') || allText.includes('lead reduction')) isLeadFree = true;
  
  let material = 'premium coconut shell activated carbon';
  if (allText.includes('coconut') || allText.includes('shell')) {
    material = 'natural coconut shell carbon block';
  }
  
  let filterLife = '6 months or 300 gallons';
  if (allText.includes('300') && allText.includes('gal')) {
    filterLife = '6 months or 300 gallons';
  } else if (allText.includes('200') && allText.includes('gal')) {
    filterLife = '6 months or 200 gallons';
  }
  
  const bulletPoints = [];
  
  if (hasNSF53 || hasNSF42) {
    let certStr = 'NSF ' + [hasNSF42 ? '42' : '', hasNSF53 ? '53' : '', hasNSF372 ? '372' : ''].filter(Boolean).join(' & ');
    bulletPoints.push(`Certified Performance: Tested and verified under ${certStr} standards to reduce chlorine, lead, odor, and harmful contaminants while retaining beneficial minerals.`);
  } else {
    bulletPoints.push('Advanced Filtration Technology: Reduces chlorine, taste, odor, sediment, and common impurities for pure, crisp, and refreshing drinking water.');
  }
  
  bulletPoints.push(`Premium Carbon Block: Made from high-grade ${material} that features high porosity and absorption capacity to ensure superior water purity.`);
  bulletPoints.push('Seamless Fit & No Leaks: Precision-engineered to fit your refrigerator perfectly. Installs in seconds with a simple twist-and-lock design—no tools required.');
  bulletPoints.push(`Long-Lasting Capacity: Delivers clean and fresh water for up to ${filterLife}. Enjoy continuous filtration and peace of mind for your family.`);
  bulletPoints.push(`BPA-Free & Safe Materials: Constructed from 100% BPA-free and food-grade materials to guarantee safe and healthy drinking water from every pour.`);
  
  const cleanBrand = brand && brand !== 'Generic' && brand !== 'Visit the' ? brand : 'Our';
  const description = `Upgrade your drinking water with the ${cleanBrand} high-performance replacement filter. Engineered with premium activated carbon block technology, it efficiently targets chlorine, heavy metals, and odors while maintaining essential minerals. Easy to install and built to last, it guarantees pure, delicious, and safe water straight from your refrigerator dispenser.`;
  
  let contentHtml = `<div class="space-y-6">`;
  contentHtml += `<div><h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3">Key Features & Benefits</h3><ul class="list-disc pl-5 space-y-2 text-gray-600 dark:text-gray-400">`;
  bulletPoints.forEach(pt => {
    const splitIndex = pt.indexOf(':');
    if (splitIndex !== -1) {
      const title = pt.slice(0, splitIndex);
      const desc = pt.slice(splitIndex + 1);
      contentHtml += `<li><strong>${title}</strong>:${desc}</li>`;
    } else {
      contentHtml += `<li>${pt}</li>`;
    }
  });
  contentHtml += `</ul></div>`;
  
  contentHtml += `<div class="mt-8 border-t border-gray-100 dark:border-gray-900 pt-6">`;
  contentHtml += `<h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">Product Specifications</h4>`;
  contentHtml += `<div class="grid grid-cols-2 gap-4 text-xs text-gray-600 dark:text-gray-400">`;
  contentHtml += `<div><strong>Filter Life:</strong> ${filterLife}</div>`;
  contentHtml += `<div><strong>Flow Rate:</strong> 0.5 gpm (1.9 lpm)</div>`;
  contentHtml += `<div><strong>Operating Temp:</strong> 33-100°F (0.6-38°C)</div>`;
  contentHtml += `<div><strong>Operating Pressure:</strong> 30-120 psi (207-827 kPa)</div>`;
  contentHtml += `</div></div></div>`;
  
  return {
    description,
    features: bulletPoints.map(pt => pt.split(':')[0].trim()),
    content: contentHtml
  };
}

async function scrapeSearch(query, domain = 'amazon.com', language = 'en_US', limit = 100, headless = true) {
  let browser;
  try {
    const launchOptions = {
      headless: headless ? 'new' : false,
      defaultViewport: null,
      args: ['--start-maximized', '--no-sandbox', '--disable-setuid-sandbox']
    };

    if (chromePath) {
      launchOptions.executablePath = chromePath;
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');

    let acceptLang = 'en-US,en;q=0.9';
    if (language === 'zh_CN') acceptLang = 'zh-CN,zh;q=0.9,en;q=0.8';
    else if (language === 'ja_JP') acceptLang = 'ja-JP,ja;q=0.9,en;q=0.8';
    else if (language === 'de_DE') acceptLang = 'de-DE,de;q=0.9,en;q=0.8';
    else if (language === 'es_ES') acceptLang = 'es-ES,es;q=0.9,en;q=0.8';
    else if (language === 'fr_FR') acceptLang = 'fr-FR,fr;q=0.9,en;q=0.8';
    else if (language === 'it_IT') acceptLang = 'it-IT,it;q=0.9,en;q=0.8';

    await page.setExtraHTTPHeaders({
      'Accept-Language': acceptLang
    });

    try {
      await page.setCookie({ name: 'lc-main', value: language, domain: '.' + domain, path: '/' });
      await page.setCookie({ name: 'lc-main-amazon', value: language, domain: '.' + domain, path: '/' });
    } catch (_) {}

    const allResults = [];
    const seenAsins = new Set();
    let pageNum = 1;
    const maxPages = Math.ceil(limit / 16) + 3;

    while (allResults.length < limit && pageNum <= maxPages) {
      const searchUrl = `https://www.${domain}/s?k=${encodeURIComponent(query)}&page=${pageNum}&language=${language}`;
      console.log(`[搜索任务] 正在抓取第 ${pageNum} 页: ${searchUrl}`);

      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 35000 });

      // Scroll down to load lazy images
      await page.evaluate(() => window.scrollBy(0, 800));
      await new Promise(r => setTimeout(r, 800));
      await page.evaluate(() => window.scrollBy(0, 1200));

      const pageItems = await page.evaluate((domainName) => {
        const items = [];
        const cards = document.querySelectorAll('div[data-component-type="s-search-result"], div[data-asin]');
        cards.forEach(card => {
          const asin = card.getAttribute('data-asin');
          if (!asin || asin.length !== 10) return;

          const titleEl = card.querySelector('h2 a span, h2 span, h2 a, span.a-size-medium, span.a-size-base-plus');
          const title = titleEl ? titleEl.innerText.trim() : '';
          if (!title) return;

          const imgEl = card.querySelector('img.s-image');
          let image_url = imgEl ? (imgEl.src || imgEl.getAttribute('data-src') || '') : '';
          if (image_url.includes('data:image')) {
            image_url = imgEl.getAttribute('data-src') || image_url;
          }

          const priceEl = card.querySelector('.a-price .a-offscreen, .a-price-whole');
          let price = '';
          if (priceEl) price = priceEl.innerText.trim();

          const ratingEl = card.querySelector('i.a-icon-star-small span, i.a-icon-star span, span[aria-label*="out of 5 stars"], span[aria-label*="5 颗星"]');
          const rating = ratingEl ? ratingEl.innerText.trim() : '';

          const reviewsEl = card.querySelector('span[aria-label*="stars"] ~ span, span.a-size-base.s-underline-text');
          const reviews_count = reviewsEl ? reviewsEl.innerText.trim() : '';

          items.push({
            asin,
            title,
            image_url,
            price,
            rating,
            reviews_count,
            link: `https://www.${domainName}/dp/${asin}`
          });
        });
        return items;
      }, domain);

      if (pageItems.length === 0) {
        console.log(`[搜索任务] 第 ${pageNum} 页未找到更多商品，结束抓取。`);
        break;
      }

      let addedCount = 0;
      for (const item of pageItems) {
        if (!seenAsins.has(item.asin)) {
          seenAsins.add(item.asin);
          allResults.push(item);
          addedCount++;
          if (allResults.length >= limit) break;
        }
      }

      console.log(`[搜索任务] 第 ${pageNum} 页新增 ${addedCount} 个 ASIN，累计: ${allResults.length} / ${limit}`);
      if (allResults.length >= limit) break;

      pageNum++;
      await new Promise(r => setTimeout(r, 1200));
    }

    return {
      success: true,
      count: allResults.length,
      results: allResults
    };
  } finally {
    if (browser) await browser.close();
  }
}


server.listen(PORT, () => {
  console.log('\x1b[32m%s\x1b[0m', `--------------------------------------------------------------`);
  console.log('\x1b[32m%s\x1b[0m', `  亚马逊本地浏览器抓取助手启动成功！正在监听端口: ${PORT}`);
  console.log('\x1b[32m%s\x1b[0m', `  控制台的本地抓取将直接通过您本地的 Chrome 执行。`);
  console.log('\x1b[32m%s\x1b[0m', `  - 可视化模式：运行时本地会自动弹出浏览器页面。`);
  console.log('\x1b[32m%s\x1b[0m', `  - 无头模式：静默在后台运行。`);
  console.log('\x1b[32m%s\x1b[0m', `--------------------------------------------------------------`);
});

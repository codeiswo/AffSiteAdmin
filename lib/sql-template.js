// Seed SQL for FiltersPro child sites database initialization
export const childSiteSqlTemplate = `-- FiltersPro Database Schema
-- Cloudflare D1 (SQLite)

-- 产品表
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content TEXT,
  price REAL,
  compare_price REAL,
  category TEXT DEFAULT 'Refrigerator Water Filters',
  brand TEXT,
  sku TEXT,
  image_url TEXT,
  gallery TEXT DEFAULT '[]',
  compatible_models TEXT DEFAULT '[]',
  features TEXT DEFAULT '[]',
  meta_title TEXT,
  meta_description TEXT,
  is_featured INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- CMS 页面表
CREATE TABLE IF NOT EXISTS pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  meta_title TEXT,
  meta_description TEXT,
  template TEXT DEFAULT 'default',
  is_published INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- URL 转发规则表
CREATE TABLE IF NOT EXISTS redirects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_path TEXT NOT NULL,
  target_url TEXT NOT NULL,
  status_code INTEGER DEFAULT 301,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 网站设置表
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT UNIQUE,
  customer_name TEXT,
  customer_email TEXT,
  shipping_address TEXT,
  total_amount REAL,
  currency TEXT DEFAULT 'USD',
  payment_status TEXT,
  payment_method TEXT,
  items TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_is_featured ON products(is_featured);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_is_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_redirects_source ON redirects(source_path);
CREATE INDEX IF NOT EXISTS idx_redirects_is_active ON redirects(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);

-- ============================================
-- 初始设置
-- ============================================
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_name', 'FiltersPro');
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_tagline', 'Premium Refrigerator Water Filter Replacements');
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_email', 'info@filterspro.com');
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_url', 'https://www.filterspro.com');
INSERT OR IGNORE INTO settings (key, value) VALUES ('meta_title', 'FiltersPro - Premium Refrigerator Water Filter Replacements');
INSERT OR IGNORE INTO settings (key, value) VALUES ('meta_description', 'Shop premium refrigerator water filter replacements for all major brands. NSF certified, easy installation, pure clean water for your family.');
INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'dl0101');

-- ============================================
-- 示例产品数据
-- ============================================

INSERT OR IGNORE INTO products (title, slug, description, content, price, compare_price, category, brand, sku, image_url, gallery, compatible_models, features, meta_title, meta_description, is_featured, is_active, sort_order) VALUES
('Premium Refrigerator Water Filter for Samsung DA29-00020B', 'samsung-da29-00020b-replacement', 'High-performance replacement water filter compatible with Samsung DA29-00020B. NSF 42 & 53 certified for superior water filtration.', '<h2>Premium Water Filtration for Your Samsung Refrigerator</h2><p>Our premium replacement filter for Samsung DA29-00020B delivers crystal-clear, great-tasting water right from your refrigerator. Using advanced coconut carbon block technology, this filter effectively reduces chlorine taste and odor, lead, mercury, and other contaminants.</p><h3>Why Choose FiltersPro?</h3><ul><li>NSF 42 & 53 certified for peace of mind</li><li>6-month filter life (up to 300 gallons)</li><li>Easy twist-and-lock installation</li><li>Compatible with multiple Samsung models</li></ul>', 29.99, 49.99, 'Refrigerator Water Filters', 'Samsung', 'FP-SAM-020B', 'https://placehold.co/600x600/0F4C81/FFFFFF?text=Samsung+Filter', '["https://placehold.co/600x600/0F4C81/FFFFFF?text=Samsung+Side","https://placehold.co/600x600/0F4C81/FFFFFF?text=Samsung+Install"]', '["RF28HMEDBSR","RF263BEAESR","RF28HFEDBSR","RF23HCEDBSR","RF4287HARS","RF261BEAESR","RF28HDEDBSR"]', '["NSF 42 & 53 Certified","6-Month Filter Life","300 Gallon Capacity","Reduces 99% of Lead","Coconut Carbon Block","Easy Twist & Lock"]', 'Samsung DA29-00020B Water Filter Replacement | FiltersPro', 'Premium Samsung DA29-00020B refrigerator water filter replacement. NSF certified, 6-month life, easy installation. Free shipping available.', 1, 1, 1),
('GE MWF SmartWater Refrigerator Water Filter Replacement', 'ge-mwf-smartwater-replacement', 'Premium replacement for GE MWF SmartWater filters. Advanced filtration technology removes impurities while preserving essential minerals.', '<h2>Superior Filtration for GE Refrigerators</h2><p>Upgrade your water quality with our premium GE MWF SmartWater compatible filter. Engineered with precision carbon block technology to deliver exceptional water purification.</p><h3>Key Benefits</h3><ul><li>Removes chlorine, lead, mercury, and cysts</li><li>Retains beneficial minerals like calcium and magnesium</li><li>No-tools-needed installation</li><li>BPA-free materials</li></ul>', 24.99, 44.99, 'Refrigerator Water Filters', 'GE', 'FP-GE-MWF', 'https://placehold.co/600x600/0A3558/FFFFFF?text=GE+MWF+Filter', '["https://placehold.co/600x600/0A3558/FFFFFF?text=GE+Side","https://placehold.co/600x600/0A3558/FFFFFF?text=GE+Install"]', '["GFE28GSKSS","GNE27JSMSS","GFE26GSKSS","GNE25JMKES","PFE28KSKSS","GYE22HSKSS","GSS25GSHSS"]', '["NSF 42 & 53 Certified","6-Month Filter Life","Removes 99.6% of Lead","BPA-Free Materials","Easy Push-In Install","Preserves Minerals"]', 'GE MWF SmartWater Filter Replacement | FiltersPro', 'High-quality GE MWF SmartWater refrigerator water filter replacement. NSF certified, easy installation, pure water guaranteed.', 1, 1, 2),
('LG LT1000P Refrigerator Water Filter Replacement', 'lg-lt1000p-replacement', 'Advanced replacement water filter for LG LT1000P/LT1000PC/MDJ64844601. Delivers clean, fresh-tasting water.', '<h2>Clean Water for Your LG Refrigerator</h2><p>Our LG LT1000P compatible replacement filter uses advanced multi-stage filtration to provide your family with clean, healthy drinking water.</p>', 26.99, 45.99, 'Refrigerator Water Filters', 'LG', 'FP-LG-1000P', 'https://placehold.co/600x600/00B4D8/FFFFFF?text=LG+LT1000P', '["https://placehold.co/600x600/00B4D8/FFFFFF?text=LG+Side"]', '["LRMVS3006S","LRMVS2806S","LRFXS2503S","LRMXS2806S","LRFXC2406S"]', '["NSF 42 & 53 Certified","6-Month Filter Life","200 Gallon Capacity","Reduces Chlorine 97%","Quick-Connect Design","Leak-Proof Seal"]', 'LG LT1000P Water Filter Replacement | FiltersPro', 'Premium LG LT1000P refrigerator water filter replacement. NSF certified, quick-connect installation.', 1, 1, 3),
('Whirlpool W10295370A / EDR1RXD1 Water Filter Replacement', 'whirlpool-w10295370a-replacement', 'Premium compatible filter for Whirlpool W10295370A, EDR1RXD1, and Filter 1. Triple filtration technology.', '<h2>Pure Water for Whirlpool Refrigerators</h2><p>Experience the difference with our Whirlpool W10295370A compatible filter. Triple-stage filtration ensures every glass of water is fresh and clean.</p>', 22.99, 39.99, 'Refrigerator Water Filters', 'Whirlpool', 'FP-WP-295370A', 'https://placehold.co/600x600/0096B4/FFFFFF?text=Whirlpool+Filter', '["https://placehold.co/600x600/0096B4/FFFFFF?text=WP+Side"]', '["WRS325SDHZ","WRS571CIHZ","WRF555SDFZ","WRX735SDHZ","WRS588FIHZ"]', '["NSF 42 & 53 Certified","6-Month Filter Life","Triple Filtration","Reduces 28 Contaminants","Easy Quarter-Turn","Flow Rate 0.5 GPM"]', 'Whirlpool W10295370A Water Filter Replacement | FiltersPro', 'Quality Whirlpool W10295370A / EDR1RXD1 water filter replacement. Triple filtration, NSF certified.', 1, 1, 4),
('Maytag UKF8001 PUR Water Filter Replacement', 'maytag-ukf8001-replacement', 'High-capacity replacement for Maytag UKF8001 PUR. Compatible with Amana, KitchenAid, and Jenn-Air.', '<h2>Premium Filtration for Maytag & More</h2><p>Our UKF8001 compatible filter works with Maytag, Amana, KitchenAid, and Jenn-Air refrigerators. Premium carbon block technology delivers outstanding water quality.</p>', 23.99, 42.99, 'Refrigerator Water Filters', 'Maytag', 'FP-MY-8001', 'https://placehold.co/600x600/0D4373/FFFFFF?text=Maytag+Filter', '["https://placehold.co/600x600/0D4373/FFFFFF?text=Maytag+Side"]', '["MFI2570FEZ","MFI2269FRZ","MFX2676FRZ","MFI2269DRM","MSD2651HEZ"]', '["NSF 42 & 53 Certified","6-Month Filter Life","250 Gallon Capacity","Multi-Brand Compatible","Premium Carbon Block","Cyst Reduction"]', 'Maytag UKF8001 PUR Water Filter Replacement | FiltersPro', 'Premium Maytag UKF8001 PUR water filter replacement. Compatible with Amana, KitchenAid, Jenn-Air. NSF certified.', 1, 1, 5),
('Frigidaire ULTRAWF PureSource Ultra Water Filter', 'frigidaire-ultrawf-replacement', 'High-performance replacement for Frigidaire ULTRAWF PureSource Ultra. Advanced activated carbon filtration.', '<h2>Crystal Clear Water for Frigidaire</h2><p>Our ULTRAWF compatible filter provides outstanding water purification for your Frigidaire refrigerator. Advanced activated carbon technology removes contaminants while keeping beneficial minerals.</p>', 21.99, 38.99, 'Refrigerator Water Filters', 'Frigidaire', 'FP-FG-ULTRAWF', 'https://placehold.co/600x600/005B6B/FFFFFF?text=Frigidaire+Filter', '[]', '["FGHB2868TF","FGHS2655PF","FGHN2868TF","FGHS2631PF","DGHX2655TF"]', '["NSF 42 & 53 Certified","6-Month Filter Life","200 Gallon Capacity","Activated Carbon","Easy Push-In Install","Reduces Pharmaceuticals"]', 'Frigidaire ULTRAWF PureSource Ultra Filter Replacement | FiltersPro', 'Premium Frigidaire ULTRAWF PureSource Ultra water filter replacement. Advanced filtration, NSF certified.', 1, 1, 6),
('Samsung DA97-17376B HAF-QIN Water Filter', 'samsung-da97-17376b-replacement', 'Internal water filter replacement for Samsung DA97-17376B / HAF-QIN/EXP. For Samsung French Door models.', '<h2>Advanced Filtration for Samsung French Door</h2><p>Designed specifically for Samsung French Door refrigerators with internal water filter. Premium multi-stage filtration technology.</p>', 32.99, 54.99, 'Refrigerator Water Filters', 'Samsung', 'FP-SAM-17376B', 'https://placehold.co/600x600/0F4C81/FFFFFF?text=Samsung+HAF', '[]', '["RF23M8570SG","RF23M8590SG","RF23R6201SR","RF28R7351SG","RF23M8070SR"]', '["NSF 42 & 53 & 401 Certified","6-Month Filter Life","Removes 99% Contaminants","Samsung Genuine Fit","Auto-Shutoff Feature","Premium Multi-Stage"]', 'Samsung DA97-17376B HAF-QIN Water Filter | FiltersPro', 'Samsung DA97-17376B HAF-QIN water filter replacement for French Door models. NSF 42/53/401 certified.', 0, 1, 7),
('LG LT700P / ADQ36006101 Replacement Water Filter', 'lg-lt700p-replacement', 'Compatible replacement for LG LT700P / ADQ36006101. Reliable filtration for LG top-freezer and side-by-side models.', '<h2>Reliable Filtration for LG Refrigerators</h2><p>Our LT700P compatible filter delivers consistent, high-quality water filtration for your LG refrigerator. Easy to install and long-lasting.</p>', 19.99, 34.99, 'Refrigerator Water Filters', 'LG', 'FP-LG-700P', 'https://placehold.co/600x600/00B4D8/FFFFFF?text=LG+LT700P', '[]', '["LSXS26326S","LFXS26973S","LFXS24623S","LSXS26366S","LFXC24726S"]', '["NSF 42 & 53 Certified","6-Month Filter Life","Reduces Chlorine 96%","Easy Twist Install","Value Pack Available","Premium Carbon"]', 'LG LT700P / ADQ36006101 Water Filter Replacement | FiltersPro', 'LG LT700P / ADQ36006101 water filter replacement. Affordable, NSF certified, easy installation.', 0, 1, 8),
('GE RPWFE Refrigerator Water Filter with RFID Chip', 'ge-rpwfe-replacement', 'Compatible replacement for GE RPWFE with built-in RFID chip. No bypass plug needed.', '<h2>Smart Filtration with RFID Technology</h2><p>Our RPWFE compatible filter comes with a built-in RFID chip, so your GE refrigerator recognizes it instantly. No bypass plug needed — just install and enjoy clean water.</p>', 34.99, 59.99, 'Refrigerator Water Filters', 'GE', 'FP-GE-RPWFE', 'https://placehold.co/600x600/0A3558/FFFFFF?text=GE+RPWFE', '[]', '["GFE28GYNFS","GNE27JYMFS","GFE26JYMFS","PYE22KYNFS","GYE22GYNFS"]', '["RFID Chip Included","NSF 42 & 53 Certified","6-Month Filter Life","Reduces Lead 99.3%","Smart Recognition","No Bypass Needed"]', 'GE RPWFE Water Filter Replacement with RFID | FiltersPro', 'GE RPWFE water filter replacement with built-in RFID chip. NSF certified, smart recognition, no bypass plug.', 0, 1, 9),
('Whirlpool EDR3RXD1 / 4396841 Water Filter Replacement', 'whirlpool-edr3rxd1-replacement', 'Premium replacement for Whirlpool EDR3RXD1, 4396841, and Filter 3. Fits side-by-side and bottom-freezer models.', '<h2>Clean Water for More Whirlpool Models</h2><p>Our EDR3RXD1 compatible filter provides excellent water purification for a wide range of Whirlpool side-by-side and bottom-freezer refrigerators.</p>', 20.99, 36.99, 'Refrigerator Water Filters', 'Whirlpool', 'FP-WP-EDR3', 'https://placehold.co/600x600/0096B4/FFFFFF?text=WP+EDR3', '[]', '["WRS321SDHZ","WRS315SNHM","WRB322DMBM","WRS325FDAM","WRT318FZDM"]', '["NSF 42 & 53 Certified","6-Month Filter Life","Reduces Mercury 96%","Easy Cap-and-Twist","Leak Prevention","Value Pricing"]', 'Whirlpool EDR3RXD1 / 4396841 Water Filter | FiltersPro', 'Whirlpool EDR3RXD1 / 4396841 water filter replacement. NSF certified, easy installation, great value.', 0, 1, 10),
('Refrigerator Air Filter - Frigidaire PAULTRA', 'frigidaire-paultra-air-filter', 'Premium replacement air filter for Frigidaire PAULTRA / EAFCBF. Keeps your refrigerator smelling fresh.', '<h2>Keep Your Fridge Fresh</h2><p>Our PAULTRA compatible air filter uses activated carbon to absorb and neutralize odors inside your Frigidaire refrigerator, keeping food tasting fresher longer.</p>', 9.99, 16.99, 'Refrigerator Air Filters', 'Frigidaire', 'FP-FG-PAULTRA', 'https://placehold.co/600x600/D4A84B/FFFFFF?text=Air+Filter', '[]', '["Most Frigidaire French Door Models","Gallery Series","Professional Series"]', '["Activated Carbon","6-Month Life","Odor Elimination","Easy Snap-In","Food-Grade Materials","BPA Free"]', 'Frigidaire PAULTRA Air Filter Replacement | FiltersPro', 'Frigidaire PAULTRA refrigerator air filter replacement. Eliminates odors, keeps food fresh.', 0, 1, 11),
('Countertop Ice Maker - Portable Nugget Ice Machine', 'portable-nugget-ice-maker', 'Premium portable nugget ice maker with self-cleaning function. Makes 26 lbs of chewable nugget ice per day.', '<h2>Restaurant-Quality Nugget Ice at Home</h2><p>Enjoy the same soft, chewable nugget ice you love from restaurants right in your own kitchen. Our portable ice maker produces up to 26 lbs of ice daily.</p>', 189.99, 299.99, 'Ice Maker', 'FiltersPro', 'FP-IM-NUGGET', 'https://placehold.co/600x600/003D47/FFFFFF?text=Ice+Maker', '[]', '[]', '["26 lbs/Day Capacity","Nugget Ice","Self-Cleaning","Portable Design","Quick 10-Min Cycle","Low Noise Operation"]', 'Portable Nugget Ice Maker | FiltersPro', 'Premium portable nugget ice maker. Makes 26 lbs of chewable nugget ice daily. Self-cleaning, low noise.', 1, 1, 12);

-- ============================================
-- 示例页面
-- ============================================

INSERT OR IGNORE INTO pages (title, slug, content, meta_title, meta_description, template, is_published, sort_order) VALUES
('Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>Last updated: 2024-01-01</p><h2>Information We Collect</h2><p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.</p><h2>How We Use Your Information</h2><p>We use the information we collect to provide, maintain, and improve our services.</p><h2>Contact Us</h2><p>If you have any questions about this Privacy Policy, please contact us at info@filterspro.com.</p>', 'Privacy Policy | FiltersPro', 'Read our privacy policy to understand how FiltersPro collects, uses, and protects your personal information.', 'default', 1, 1),
('Terms of Service', 'terms-of-service', '<h1>Terms of Service</h1><p>Last updated: 2024-01-01</p><h2>Acceptance of Terms</h2><p>By accessing and using FiltersPro, you accept and agree to be bound by these Terms of Service.</p><h2>Products and Services</h2><p>FiltersPro sells premium water filter replacement products for various refrigerator brands.</p><h2>Returns & Refunds</h2><p>We offer a 30-day satisfaction guarantee on all products.</p>', 'Terms of Service | FiltersPro', 'Terms of Service for FiltersPro. Learn about our policies, returns, and guarantees.', 'default', 1, 2),
('Shipping Policy', 'shipping-policy', '<h1>Shipping Policy</h1><h2>Free Shipping</h2><p>We offer free standard shipping on all orders over $35 within the continental United States.</p><h2>Processing Time</h2><p>Orders are processed within 1-2 business days.</p><h2>Delivery Time</h2><p>Standard shipping: 5-7 business days. Express shipping: 2-3 business days.</p>', 'Shipping Policy | FiltersPro', 'FiltersPro shipping policy. Free shipping on orders over $35. Fast processing and delivery.', 'default', 1, 3);

-- ============================================
-- 示例转发规则
-- ============================================

INSERT OR IGNORE INTO redirects (source_path, target_url, status_code, is_active) VALUES
('/old-products', '/products', 301, 1),
('/samsung-filters', '/products?brand=Samsung', 301, 1),
('/ge-filters', '/products?brand=GE', 301, 1);
`;

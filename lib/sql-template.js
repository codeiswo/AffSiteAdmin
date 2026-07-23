// Seed SQL for AffSite child sites database initialization
export const childSiteSqlTemplate = `-- AffSite Database Schema
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
  category TEXT DEFAULT 'apparel',
  brand TEXT,
  sku TEXT,
  image_url TEXT,
  gallery TEXT DEFAULT '[]',
  compatible_models TEXT DEFAULT '[]',
  features TEXT DEFAULT '[]',
  affiliate_link TEXT,
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
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_name', 'AffSite Deals');
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_tagline', 'Curated Cashback Deals & Exclusive Coupons');
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_category', 'apparel');
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_email', 'info@affsite.com');
INSERT OR IGNORE INTO settings (key, value) VALUES ('site_url', 'https://www.affsite.com');
INSERT OR IGNORE INTO settings (key, value) VALUES ('meta_title', 'AffSite Deals - Curated Fashion & Multi-Category Cashback Coupons');
INSERT OR IGNORE INTO settings (key, value) VALUES ('meta_description', 'Discover top cashback deals, coupons, and discounts across Apparel, Electronics, Home, and more. Shop partner brands and save.');
INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'dl0101');

-- ============================================
-- 示例产品数据 (多品类/导购跳转)
-- ============================================

INSERT OR IGNORE INTO products (title, slug, description, content, price, compare_price, category, brand, sku, image_url, gallery, compatible_models, features, affiliate_link, meta_title, meta_description, is_featured, is_active, sort_order) VALUES
('Classic Cashmere Blend Trench Coat', 'classic-cashmere-blend-trench-coat', 'Elegant wool & cashmere blend trench coat featuring double-breasted closure and water-resistant finish.', '<h2>Timeless Fashion & Premium Quality</h2><p>Stay warm and stylish with our handcrafted cashmere blend trench coat. Partnered with top luxury apparel merchants.</p>', 189.99, 299.99, 'apparel', 'Burberry', 'AFF-APP-001', 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80', '[]', '[]', '["Double-breasted closure","70% Wool 30% Cashmere","Water-resistant finish","Dry clean only"]', 'https://www.burberry.com/?aff=affsite_coat', 'Classic Cashmere Trench Coat | AffSite Deals', 'Get exclusive cashback on classic cashmere trench coats. Free shipping on partner merchant orders.', 1, 1, 1),
('Designer Distressed Denim Jacket', 'designer-distressed-denim-jacket', '100% organic cotton vintage wash denim jacket with custom brass buttons.', '<h2>Iconic Streetwear Fashion</h2><p>Unmatched durability and relaxed fit. Perfect layering item for all seasons.</p>', 79.99, 129.99, 'apparel', 'Levi''s', 'AFF-APP-002', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80', '[]', '[]', '["100% Organic Cotton","Vintage Wash Finish","Reinforced Stitching","Chest Pockets"]', 'https://www.levis.com/?aff=affsite_jacket', 'Designer Distressed Denim Jacket | AffSite Deals', 'Shop premium denim jackets with cashback. Verified brand coupons included.', 1, 1, 2),
('Vintage Floral Summer Midi Dress', 'vintage-floral-summer-midi-dress', 'Breathable linen blend midi dress with romantic puff sleeves and floral print.', '<h2>Chic Summer Wardrobe</h2><p>Designed for comfort and effortless elegance during warm sunny days.</p>', 59.99, 89.99, 'apparel', 'ZARA', 'AFF-APP-003', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80', '[]', '[]', '["Breathable Linen Fabric","Elasticated Waistband","Puff Sleeves","Side Slit"]', 'https://www.zara.com/?aff=affsite_dress', 'Vintage Floral Summer Midi Dress | AffSite Deals', 'Save big on trendy summer midi dresses with instant cashback offers.', 1, 1, 3),
('Premium Heavyweight Fleece Hoodie', 'premium-heavyweight-fleece-hoodie', 'Ultra-soft 450GSM cotton fleece hoodie with minimalist embroidered branding.', '<h2>Everyday Comfort Essentials</h2><p>Crafted for maximum comfort and durability with thick ribbed cuffs.</p>', 64.99, 99.99, 'apparel', 'Nike', 'AFF-APP-004', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80', '[]', '[]', '["450GSM Heavyweight Fleece","Double-Layer Hood","Kangaroo Pocket","Pre-shrunk Fabric"]', 'https://www.nike.com/?aff=affsite_hoodie', 'Premium Heavyweight Fleece Hoodie | AffSite Deals', 'Exclusive rebate link for Nike fleece hoodies. Claim your cashback deal now.', 1, 1, 4),
('Wireless Active Noise Canceling Headphones', 'wireless-active-noise-canceling-headphones', 'Industry-leading noise cancellation headphone with 30-hour battery life.', '<h2>Immersive High-Fidelity Audio</h2><p>Experience crystal clear sound and effortless Bluetooth 5.3 connectivity.</p>', 249.99, 349.99, 'digital', 'Sony', 'AFF-DIG-001', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', '[]', '[]', '["ANC Noise Cancellation","30-Hour Playtime","Multipoint Connection","Touch Controls"]', 'https://www.sony.com/?aff=affsite_anc', 'Wireless Noise Canceling Headphones | AffSite Deals', 'Get top tech deals on Sony wireless headphones with instant affiliate rebate.', 1, 1, 5),
('Smart Robotic Vacuum Cleaner & Mop', 'smart-robotic-vacuum-cleaner-mop', 'LiDAR navigation robot vacuum with 5000Pa suction power and self-emptying base.', '<h2>Automated Home Cleaning</h2><p>Effortlessly clean carpets and hard floors with smart app mapping.</p>', 399.99, 599.99, 'home', 'Roborock', 'AFF-HOM-001', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80', '[]', '[]', '["LiDAR Precision Mapping","5000Pa Suction","Self-Emptying Dustbin","App & Voice Control"]', 'https://www.roborock.com/?aff=affsite_vacuum', 'Smart Robotic Vacuum Cleaner | AffSite Deals', 'Best discount on smart robot vacuums. Click to purchase at partner store.', 1, 1, 6);

-- ============================================
-- 示例页面
-- ============================================

INSERT OR IGNORE INTO pages (title, slug, content, meta_title, meta_description, template, is_published, sort_order) VALUES
('Privacy Policy', 'privacy-policy', '<h1>Privacy Policy</h1><p>Last updated: 2026-01-01</p><h2>Information We Collect</h2><p>We collect information when you browse our curated deals or click outbound affiliate links to merchant partners.</p><h2>Affiliate Disclosure</h2><p>AffSite participates in brand partnership programs. When you click merchant links and make purchases, we may earn a commission.</p>', 'Privacy Policy | AffSite Deals', 'Read our privacy policy and affiliate disclosure statement.', 'default', 1, 1),
('Terms of Service', 'terms-of-service', '<h1>Terms of Service</h1><p>By using AffSite, you agree to our terms of service and cashback redirect protocols.</p>', 'Terms of Service | AffSite Deals', 'Terms of Service for AffSite coupon and rebate directory.', 'default', 1, 2),
('About Us', 'about', '<h2>About AffSite Deals</h2><p>We aggregate the best cashback offers, brand promo codes, and shopping discounts across top categories like Fashion, Tech, Home, and Services.</p>', 'About Us | AffSite Deals', 'Learn more about AffSite deals and brand partnerships.', 'default', 1, 3);

-- ============================================
-- 示例转发规则
-- ============================================

INSERT OR IGNORE INTO redirects (source_path, target_url, status_code, is_active) VALUES
('/old-deals', '/products', 301, 1);
`;

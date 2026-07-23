-- SitesPro Platform Schema Migration

CREATE TABLE IF NOT EXISTS cf_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  api_token TEXT NOT NULL,
  account_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  cf_account_id INTEGER REFERENCES cf_accounts(id),
  primary_color TEXT DEFAULT '#0f4c81',
  accent_color TEXT DEFAULT '#00b4d8',
  seo_title TEXT NOT NULL,
  seo_description TEXT NOT NULL,
  d1_database_id TEXT,
  pages_project_name TEXT,
  deploy_status TEXT DEFAULT 'pending',
  last_deployed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS deploy_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site_id INTEGER REFERENCES sites(id),
  action_type TEXT NOT NULL,
  status TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mgr_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Insert a default admin password setting (default: dl0101)
INSERT OR IGNORE INTO mgr_settings (key, value) VALUES ('admin_password', 'dl0101');

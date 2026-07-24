import { getRequestContext } from '@cloudflare/next-on-pages';

function getDB() {
  try {
    const { env } = getRequestContext();
    return env.MGR_DB;
  } catch {
    return null;
  }
}

// ============================================
// Cloudflare Accounts Management
// ============================================

export async function getCFAccounts() {
  const db = getDB();
  if (!db) return [];
  const res = await db.prepare('SELECT * FROM cf_accounts ORDER BY name ASC').all();
  return res.results || [];
}

export async function getCFAccountById(id) {
  const db = getDB();
  if (!db) return null;
  return await db.prepare('SELECT * FROM cf_accounts WHERE id = ?').bind(id).first();
}

export async function addCFAccount({ name, api_token, account_id }) {
  const db = getDB();
  if (!db) throw new Error('Database not available');
  return await db.prepare(
    'INSERT INTO cf_accounts (name, api_token, account_id) VALUES (?, ?, ?)'
  ).bind(name, api_token, account_id).run();
}

export async function updateCFAccount(id, { name, api_token, account_id }) {
  const db = getDB();
  if (!db) throw new Error('Database not available');
  return await db.prepare(
    'UPDATE cf_accounts SET name = ?, api_token = ?, account_id = ? WHERE id = ?'
  ).bind(name, api_token, account_id, id).run();
}

export async function deleteCFAccount(id) {
  const db = getDB();
  if (!db) throw new Error('Database not available');
  return await db.prepare('DELETE FROM cf_accounts WHERE id = ?').bind(id).run();
}

// ============================================
// Sites Management
// ============================================

async function ensureSiteColumns(db) {
  if (!db) return;
  try { await db.prepare("ALTER TABLE sites ADD COLUMN template TEXT DEFAULT 'affsite'").run(); } catch (_) {}
  try { await db.prepare("ALTER TABLE sites ADD COLUMN email_forwarding INTEGER DEFAULT 0").run(); } catch (_) {}
  try { await db.prepare("ALTER TABLE sites ADD COLUMN paypal_client_id TEXT").run(); } catch (_) {}
  try { await db.prepare("ALTER TABLE sites ADD COLUMN paypal_client_secret TEXT").run(); } catch (_) {}
  try { await db.prepare("ALTER TABLE sites ADD COLUMN paypal_mode TEXT DEFAULT 'sandbox'").run(); } catch (_) {}
  try { await db.prepare("ALTER TABLE sites ADD COLUMN custom_html_tags TEXT").run(); } catch (_) {}
}

export async function getSites() {
  const db = getDB();
  if (!db) return [];
  
  await ensureSiteColumns(db);

  const res = await db.prepare(`
    SELECT s.*, a.name as cf_account_name 
    FROM sites s 
    LEFT JOIN cf_accounts a ON s.cf_account_id = a.id 
    ORDER BY s.created_at DESC
  `).all();
  return res.results || [];
}

export async function getSiteById(id) {
  const db = getDB();
  if (!db) return null;
  await ensureSiteColumns(db);
  return await db.prepare('SELECT * FROM sites WHERE id = ?').bind(id).first();
}

export async function addSite({
  name,
  domain,
  cf_account_id,
  primary_color,
  accent_color,
  seo_title,
  seo_description,
  d1_database_id,
  pages_project_name,
  template,
  email_forwarding,
  paypal_client_id,
  paypal_client_secret,
  paypal_mode,
  custom_html_tags,
}) {
  const db = getDB();
  if (!db) throw new Error('Database not available');
  await ensureSiteColumns(db);
  return await db.prepare(`
    INSERT INTO sites (
      name, domain, cf_account_id, primary_color, accent_color, 
      seo_title, seo_description, d1_database_id, pages_project_name, template, deploy_status, email_forwarding,
      paypal_client_id, paypal_client_secret, paypal_mode, custom_html_tags
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?)
  `).bind(
    name, domain, cf_account_id, primary_color || '#0f4c81', accent_color || '#00b4d8',
    seo_title, seo_description, d1_database_id || null, pages_project_name || null, template || 'affsite', email_forwarding || 0,
    paypal_client_id || '', paypal_client_secret || '', paypal_mode || 'sandbox', custom_html_tags || ''
  ).run();
}

export async function updateSite(id, data) {
  const db = getDB();
  if (!db) throw new Error('Database not available');

  await ensureSiteColumns(db);

  const fields = [];
  const values = [];

  const allowedFields = [
    'name', 'domain', 'cf_account_id', 'primary_color', 'accent_color',
    'seo_title', 'seo_description', 'd1_database_id', 'pages_project_name',
    'deploy_status', 'last_deployed_at', 'template', 'email_forwarding',
    'paypal_client_id', 'paypal_client_secret', 'paypal_mode', 'custom_html_tags'
  ];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(data[field]);
    }
  }

  if (fields.length === 0) return null;

  values.push(id);
  return await db.prepare(
    `UPDATE sites SET ${fields.join(', ')} WHERE id = ?`
  ).bind(...values).run();
}

export async function deleteSite(id) {
  const db = getDB();
  if (!db) throw new Error('Database not available');
  
  // Start transactional delete if supported, otherwise sequential queries
  await db.prepare('DELETE FROM deploy_logs WHERE site_id = ?').bind(id).run();
  return await db.prepare('DELETE FROM sites WHERE id = ?').bind(id).run();
}

// ============================================
// Deploy Logs
// ============================================

export async function getDeployLogs(siteId) {
  const db = getDB();
  if (!db) return [];
  const res = await db.prepare(
    'SELECT * FROM deploy_logs WHERE site_id = ? ORDER BY created_at DESC LIMIT 100'
  ).bind(siteId).all();
  return res.results || [];
}

export async function addDeployLog(siteId, actionType, status, message) {
  const db = getDB();
  if (!db) return null;
  return await db.prepare(
    'INSERT INTO deploy_logs (site_id, action_type, status, message) VALUES (?, ?, ?, ?)'
  ).bind(siteId, actionType, status, message).run();
}

// ============================================
// Settings
// ============================================

export async function getMgrSetting(key) {
  const db = getDB();
  if (!db) return null;
  const result = await db.prepare('SELECT value FROM mgr_settings WHERE key = ?').bind(key).first();
  return result?.value || null;
}

export async function setMgrSetting(key, value) {
  const db = getDB();
  if (!db) throw new Error('Database not available');
  return await db.prepare(
    'INSERT OR REPLACE INTO mgr_settings (key, value) VALUES (?, ?)'
  ).bind(key, value).run();
}

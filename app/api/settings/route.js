import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getMgrSetting, setMgrSetting } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const github_token = (await getMgrSetting('github_token')) || process.env.GITHUB_TOKEN || '';
    const github_owner = (await getMgrSetting('github_owner')) || 'codeiswo';
    const github_repo = (await getMgrSetting('github_repo')) || 'AffSite';
    const default_forward_email = (await getMgrSetting('default_forward_email')) || 'codeiswo@outlook.com';
    const bing_api_key = (await getMgrSetting('bing_api_key')) || '8330dfb8806a461b9ab31748c630df44';
    const amazon_scraper_type = (await getMgrSetting('amazon_scraper_type')) || 'direct';
    const amazon_scraper_key = (await getMgrSetting('amazon_scraper_key')) || '';

    return NextResponse.json({
      github_token,
      github_owner,
      github_repo,
      default_forward_email,
      bing_api_key,
      amazon_scraper_type,
      amazon_scraper_key,
    });
  } catch (error) {
    console.error('Fetch settings error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const {
      github_token,
      github_owner,
      github_repo,
      default_forward_email,
      admin_password,
      bing_api_key,
      amazon_scraper_type,
      amazon_scraper_key,
    } = await request.json();

    if (github_token) await setMgrSetting('github_token', github_token.trim());
    if (github_owner) await setMgrSetting('github_owner', github_owner.trim());
    if (github_repo) await setMgrSetting('github_repo', github_repo.trim());
    if (default_forward_email) await setMgrSetting('default_forward_email', default_forward_email.trim());
    if (admin_password) await setMgrSetting('admin_password', admin_password.trim());
    if (bing_api_key !== undefined) await setMgrSetting('bing_api_key', bing_api_key.trim());
    if (amazon_scraper_type !== undefined) await setMgrSetting('amazon_scraper_type', amazon_scraper_type.trim());
    if (amazon_scraper_key !== undefined) await setMgrSetting('amazon_scraper_key', amazon_scraper_key.trim());

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

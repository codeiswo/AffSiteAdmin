import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSites, addSite } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const sites = await getSites();
    return NextResponse.json({ sites });
  } catch (error) {
    console.error('Fetch sites error:', error);
    return NextResponse.json({ error: 'Failed to fetch sites' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { name, domain, cf_account_id, seo_title, seo_description, template, email_forwarding, paypal_client_id, paypal_client_secret, paypal_mode, custom_html_tags } = data;
    if (!name || !cf_account_id || !seo_title || !seo_description) {
      return NextResponse.json({ error: 'Missing required configuration fields' }, { status: 400 });
    }

    // Clean name and set Pages project default name
    const cleanedName = name.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const pagesProjectName = data.pages_project_name || cleanedName;

    const result = await addSite({
      name: cleanedName,
      domain: domain ? domain.trim().toLowerCase() : '',
      cf_account_id: parseInt(cf_account_id),
      primary_color: data.primary_color || '#0f4c81',
      accent_color: data.accent_color || '#00b4d8',
      seo_title: seo_title.trim(),
      seo_description: seo_description.trim(),
      d1_database_id: data.d1_database_id || null,
      pages_project_name: pagesProjectName,
      template: template || 'affsite',
      email_forwarding: email_forwarding ? 1 : 0,
      paypal_client_id: paypal_client_id || '',
      paypal_client_secret: paypal_client_secret || '',
      paypal_mode: paypal_mode || 'sandbox',
      custom_html_tags: custom_html_tags || '',
    });

    return NextResponse.json({ success: true, siteId: result.meta?.last_row_id }, { status: 201 });
  } catch (error) {
    console.error('Create site config error:', error);
    return NextResponse.json({ error: 'Failed to save site configuration' }, { status: 500 });
  }
}

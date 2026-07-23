import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getSiteById, getCFAccountById } from '@/lib/db';
import { executeSQLOnD1 } from '@/lib/cf-api';

export const runtime = 'edge';

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id: siteId, productId } = params;

  try {
    const site = await getSiteById(siteId);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 444 });
    if (!site.d1_database_id) return NextResponse.json({ error: 'Database not bound' }, { status: 400 });

    const cfAccount = await getCFAccountById(site.cf_account_id);
    if (!cfAccount) {
      return NextResponse.json({ error: 'Cloudflare account not found for site' }, { status: 400 });
    }
    const { api_token: apiToken, account_id: accountId } = cfAccount;

    await executeSQLOnD1(
      apiToken,
      accountId,
      site.d1_database_id,
      'DELETE FROM products WHERE id = ?',
      [productId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const { id: siteId, productId } = params;

  try {
    const site = await getSiteById(siteId);
    if (!site) return NextResponse.json({ error: 'Site not found' }, { status: 444 });
    if (!site.d1_database_id) return NextResponse.json({ error: 'Database not bound' }, { status: 400 });

    const cfAccount = await getCFAccountById(site.cf_account_id);
    if (!cfAccount) {
      return NextResponse.json({ error: 'Cloudflare account not found for site' }, { status: 400 });
    }
    const { api_token: apiToken, account_id: accountId } = cfAccount;

    const body = await request.json();
    const { is_active, is_featured, price } = body;

    const updates = [];
    const updateParams = [];

    if (is_active !== undefined) {
      updates.push('is_active = ?');
      updateParams.push(is_active ? 1 : 0);
    }
    if (is_featured !== undefined) {
      updates.push('is_featured = ?');
      updateParams.push(is_featured ? 1 : 0);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      updateParams.push(Number(price));
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No properties to update' }, { status: 400 });
    }

    updateParams.push(productId);

    await executeSQLOnD1(
      apiToken,
      accountId,
      site.d1_database_id,
      `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
      updateParams
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { updateCFAccount, deleteCFAccount } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { name, api_token, account_id } = await request.json();

    if (!name || !api_token || !account_id) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await updateCFAccount(id, { name, api_token, account_id });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteCFAccount(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}

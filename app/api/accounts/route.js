import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getCFAccounts, addCFAccount } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const accounts = await getCFAccounts();
    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Fetch accounts error:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { name, api_token, account_id } = await request.json();

    if (!name || !api_token || !account_id) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    await addCFAccount({ name, api_token, account_id });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Create account error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

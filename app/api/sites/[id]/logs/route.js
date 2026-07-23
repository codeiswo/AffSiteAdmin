import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getDeployLogs } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request, { params }) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { id } = await params;
    const logs = await getDeployLogs(parseInt(id));
    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Fetch deploy logs error:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { validatePassword, signToken, requireAuth } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(request) {
  const auth = await requireAuth(request);
  return NextResponse.json({ authenticated: auth.authenticated });
}

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const isValid = await validatePassword(password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = await signToken({ role: 'admin' });

    const response = NextResponse.json({ success: true });
    response.headers.set(
      'Set-Cookie',
      `sitespro_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.headers.set(
    'Set-Cookie',
    'sitespro_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'
  );
  return response;
}

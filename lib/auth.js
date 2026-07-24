import { SignJWT, jwtVerify } from 'jose';
import { getMgrSetting } from './db';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'affsite-manager-secret-key-change-in-production'
);

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch {
    return null;
  }
}

export async function validatePassword(password) {
  const storedPassword = await getMgrSetting('admin_password');
  return password === (storedPassword || 'dl0101');
}

export function getTokenFromCookies(cookieHeader) {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...val] = c.trim().split('=');
      return [key, val.join('=')];
    })
  );
  return cookies['affsite_token'] || null;
}

export async function requireAuth(request) {
  const cookieHeader = request.headers.get('cookie');
  const token = getTokenFromCookies(cookieHeader);

  if (!token) {
    return { authenticated: false, error: 'No token provided' };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { authenticated: false, error: 'Invalid or expired token' };
  }

  return { authenticated: true, user: payload };
}

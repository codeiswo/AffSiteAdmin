import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET(request) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { env } = getRequestContext();
    const db = env.MGR_DB;
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Query all keywords, joining with sites to compute usage count and domain association
    const res = await db.prepare(`
      SELECT k.*, GROUP_CONCAT(s.domain, ', ') AS site_domains, COUNT(s.id) AS usage_count
      FROM keywords k
      LEFT JOIN sites s ON k.keyword = s.name
      GROUP BY k.id
      ORDER BY k.created_at DESC
    `).all();

    return NextResponse.json(res.results || []);
  } catch (error) {
    console.error('Fetch saved keywords error:', error);
    return NextResponse.json({ error: 'Failed to fetch saved keywords' }, { status: 500 });
  }
}

export async function POST(request) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const { keywords } = await request.json(); // Expecting [{ keyword: 'xxx', impressions: 123 }]
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'Keywords list must be a non-empty array' }, { status: 400 });
    }

    const { env } = getRequestContext();
    const db = env.MGR_DB;
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    // Prepare statements for D1 batch operation
    const statements = keywords.map(k => {
      return db.prepare(`
        INSERT INTO keywords (keyword, impressions)
        VALUES (?, ?)
        ON CONFLICT(keyword) DO UPDATE SET impressions = excluded.impressions
      `).bind(k.keyword, k.impressions);
    });

    await db.batch(statements);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Batch save keywords error:', error);
    return NextResponse.json({ error: 'Failed to save keywords' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { env } = getRequestContext();
    const db = env.MGR_DB;
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 });
    }

    await db.prepare('DELETE FROM keywords WHERE id = ?').bind(id).run();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete keyword error:', error);
    return NextResponse.json({ error: 'Failed to delete keyword' }, { status: 500 });
  }
}

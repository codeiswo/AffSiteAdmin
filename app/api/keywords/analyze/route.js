import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getMgrSetting } from '@/lib/db';

export const runtime = 'edge';

function parseBingDate(dateStr) {
  if (!dateStr) return 0;
  const match = dateStr.match(/\/Date\((\d+)\)\//);
  return match ? parseInt(match[1]) : 0;
}

export async function GET(request) {
  const auth = await requireAuth(request);
  if (!auth.authenticated) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  const url = new URL(request.url);
  const keyword = url.searchParams.get('keyword');
  const country = url.searchParams.has('country') ? url.searchParams.get('country') : 'us';
  const language = url.searchParams.has('language') ? url.searchParams.get('language') : 'en-US';
  const threshold = parseInt(url.searchParams.get('threshold') || '300', 10);
  const period = url.searchParams.get('period') || '3m';
  const device = url.searchParams.get('device') || 'all';

  const customStartDate = url.searchParams.get('startDate');
  const customEndDate = url.searchParams.get('endDate');

  if (!keyword) {
    return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
  }

  try {
    const apiKey = (await getMgrSetting('bing_api_key')) || '8330dfb8806a461b9ab31748c630df44';

    const now = new Date();
    let limitTimestamp = now.getTime() - 90 * 24 * 60 * 60 * 1000; // default 3M

    if (period === '30d') {
      limitTimestamp = now.getTime() - 30 * 24 * 60 * 60 * 1000;
    } else if (period === '3m') {
      limitTimestamp = now.getTime() - 90 * 24 * 60 * 60 * 1000;
    } else if (period === '6m') {
      limitTimestamp = now.getTime() - 180 * 24 * 60 * 60 * 1000;
    } else if (period === '12m') {
      limitTimestamp = now.getTime() - 365 * 24 * 60 * 60 * 1000;
    } else if (period === '18m') {
      limitTimestamp = now.getTime() - 548 * 24 * 60 * 60 * 1000;
    } else if (period === '24m') {
      limitTimestamp = now.getTime() - 730 * 24 * 60 * 60 * 1000;
    } else if (period === 'custom' && customStartDate) {
      limitTimestamp = new Date(customStartDate + 'T00:00:00Z').getTime();
    }

    const formatDate = (d) => d.toISOString().split('T')[0];
    let queryStartDate = formatDate(new Date(limitTimestamp));
    let queryEndDate = formatDate(now);

    if (period === 'custom' && customStartDate && customEndDate) {
      queryStartDate = customStartDate;
      queryEndDate = customEndDate;
    }

    const minTS = new Date(queryStartDate + 'T00:00:00Z').getTime();
    const maxTS = new Date(queryEndDate + 'T23:59:59Z').getTime();

    const q = encodeURIComponent(keyword);

    // 1. Fetch Keyword Stats to compute specified keyword's impressions in selected period
    const statsUrl = `https://ssl.bing.com/webmaster/api.svc/json/GetKeywordStats?q=${q}&country=${country}&language=${language}&apikey=${apiKey}`;
    const statsRes = await fetch(statsUrl);
    if (!statsRes.ok) {
      throw new Error(`Bing GetKeywordStats returned status ${statsRes.status}`);
    }
    const statsData = await statsRes.json();
    const statsList = statsData.d || (Array.isArray(statsData) ? statsData : []);

    let sumImpressions = 0;
    for (const item of statsList) {
      const ts = parseBingDate(item.Date);
      if (ts >= minTS && ts <= maxTS) {
        sumImpressions += item.Impressions || 0;
      }
    }

    // 2. Fetch Related Keywords
    const relatedUrl = `https://ssl.bing.com/webmaster/api.svc/json/GetRelatedKeywords?q=${q}&country=${country}&language=${language}&startDate=${queryStartDate}&endDate=${queryEndDate}&apikey=${apiKey}`;
    const relatedRes = await fetch(relatedUrl);
    if (!relatedRes.ok) {
      throw new Error(`Bing GetRelatedKeywords returned status ${relatedRes.status}`);
    }
    const relatedData = await relatedRes.json();
    const relatedList = relatedData.d || (Array.isArray(relatedData) ? relatedData : []);

    let deviceFactor = 1.0;
    if (device === 'web') deviceFactor = 0.7;
    else if (device === 'mobile') deviceFactor = 0.3;

    const finalKeywordImpressions = Math.round(sumImpressions * deviceFactor);

    const processedRelated = relatedList.map(item => {
      const rawImp = item.Impressions || 0;
      const finalImp = Math.round(rawImp * deviceFactor);
      return {
        keyword: item.Query,
        impressions: finalImp,
        broadImpressions: Math.round((item.BroadImpressions || 0) * deviceFactor),
        passed: finalImp > threshold
      };
    });

    return NextResponse.json({
      keyword,
      impressions: finalKeywordImpressions,
      passed: finalKeywordImpressions > threshold,
      related: processedRelated,
      device,
      period,
      threshold,
      queryStartDate,
      queryEndDate
    });

  } catch (error) {
    console.error('Keyword analyze error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze keyword' }, { status: 500 });
  }
}

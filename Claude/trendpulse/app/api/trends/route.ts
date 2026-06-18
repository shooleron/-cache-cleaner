import { NextResponse } from 'next/server';
import { fetchHackerNews } from '@/lib/sources/hackernews';
import { fetchReddit } from '@/lib/sources/reddit';
import { fetchYouTube } from '@/lib/sources/youtube';
import { fetchRSS } from '@/lib/sources/rss';
import { fetchProductHunt } from '@/lib/sources/producthunt';
import { Trend, TrendSource, TrendsResponse } from '@/lib/types';

export const revalidate = 900; // 15 min cache

export async function GET() {
  const fetchers: { source: TrendSource; fn: () => Promise<Trend[]> }[] = [
    { source: 'hackernews', fn: fetchHackerNews },
    { source: 'reddit', fn: fetchReddit },
    { source: 'youtube', fn: fetchYouTube },
    { source: 'rss', fn: fetchRSS },
    { source: 'producthunt', fn: fetchProductHunt },
  ];

  const results = await Promise.allSettled(fetchers.map((f) => f.fn()));

  const allTrends: Trend[] = [];
  const sources: TrendsResponse['sources'] = [];

  fetchers.forEach(({ source }, i) => {
    const result = results[i];
    if (result.status === 'fulfilled') {
      allTrends.push(...result.value);
      sources.push({ source, count: result.value.length, ok: true });
    } else {
      console.error(`[${source}] failed:`, result.reason);
      sources.push({ source, count: 0, ok: false });
    }
  });

  // Deduplicate by similar titles
  const seen = new Set<string>();
  const deduped = allTrends.filter((t) => {
    const key = t.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort by heat score descending
  deduped.sort((a, b) => b.score - a.score);

  const response: TrendsResponse = {
    trends: deduped.slice(0, 60),
    fetchedAt: new Date().toISOString(),
    sources,
  };

  return NextResponse.json(response, {
    headers: { 'Cache-Control': 's-maxage=900, stale-while-revalidate=1800' },
  });
}

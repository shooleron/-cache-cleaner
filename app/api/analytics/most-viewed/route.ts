import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const { data: events, error } = await supabase.from('analytics_events')
    .select('article_id')
    .eq('event_name', 'article_view')
    .gte('created_at', since)
    .not('article_id', 'is', null)
    .limit(10_000);
  if (error) return NextResponse.json({ items: [] }, { status: 500 });

  const counts = new Map<string, number>();
  for (const event of events ?? []) {
    if (event.article_id) counts.set(event.article_id, (counts.get(event.article_id) ?? 0) + 1);
  }

  const ids = [...counts.keys()];
  if (!ids.length) return NextResponse.json({ items: [] }, { headers: { 'Cache-Control': 'no-store' } });
  const { data: articles } = await supabase.from('articles').select('id,slug').in('id', ids).eq('status', 'published');
  const items = (articles ?? [])
    .map((article) => ({ slug: article.slug, views: counts.get(article.id) ?? 0 }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 6);

  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } });
}

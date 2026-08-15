import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const input = await request.json() as { slug?: string; anonymousId?: string; referrer?: string; utm?: Record<string, string> };
    const slug = String(input.slug ?? '').trim().slice(0, 180);
    if (!slug) return NextResponse.json({ error: 'Missing article slug' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: article } = await supabase.from('articles').select('id').eq('slug', slug).eq('status', 'published').maybeSingle();
    if (!article) return NextResponse.json({ tracked: false });

    const { error } = await supabase.from('analytics_events').insert({
      article_id: article.id,
      event_name: 'article_view',
      anonymous_id: String(input.anonymousId ?? '').slice(0, 100) || null,
      referrer: String(input.referrer ?? '').slice(0, 500) || null,
      utm_source: String(input.utm?.source ?? '').slice(0, 100) || null,
      utm_medium: String(input.utm?.medium ?? '').slice(0, 100) || null,
      utm_campaign: String(input.utm?.campaign ?? '').slice(0, 150) || null,
      metadata: { slug },
    });
    if (error) throw error;
    return NextResponse.json({ tracked: true });
  } catch {
    return NextResponse.json({ error: 'Unable to track view' }, { status: 500 });
  }
}

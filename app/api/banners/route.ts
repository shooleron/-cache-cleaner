import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const placements = new Set(['home_top', 'article_top', 'article_bottom', 'footer']);

export async function GET(request: NextRequest) {
  const placement = request.nextUrl.searchParams.get('placement') ?? 'home_top';
  if (!placements.has(placement)) return NextResponse.json({ banner: null }, { status: 400 });
  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('banners')
    .select('id,placement,image_url,target_url,alt_text,category,weight,campaign_id,campaigns!inner(name,status,starts_at,ends_at)')
    .eq('placement', placement)
    .eq('active', true)
    .eq('campaigns.status', 'active')
    .order('weight', { ascending: false });
  if (error) return NextResponse.json({ banner: null }, { status: 500 });
  const banner = (data ?? []).find((item) => {
    const campaign = Array.isArray(item.campaigns) ? item.campaigns[0] : item.campaigns;
    return (!campaign.starts_at || campaign.starts_at <= now) && (!campaign.ends_at || campaign.ends_at >= now);
  }) ?? null;
  return NextResponse.json({ banner }, { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { bannerId?: string; event?: string; placement?: string } | null;
  if (!body?.bannerId || !['banner_impression', 'banner_click'].includes(body.event ?? '')) return NextResponse.json({ ok: false }, { status: 400 });
  const supabase = createAdminClient();
  const { error } = await supabase.from('analytics_events').insert({ event_name: body.event!, metadata: { banner_id: body.bannerId, placement: body.placement ?? null } });
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 });
}

import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const root = new URL('../', import.meta.url);
const raw = await readFile(new URL('.env.local', root), 'utf8');
const env = Object.fromEntries(raw.split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => {
  const separator = line.indexOf('=');
  return [line.slice(0, separator), line.slice(separator + 1).replace(/^["']|["']$/g, '')];
}));
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const name = 'כתבת השער — ניטור מטבולי ו-Zone 2';
let { data: campaign, error } = await supabase.from('campaigns').select('id,status').eq('name', name).maybeSingle();
if (error) throw error;
if (!campaign) {
  const created = await supabase.from('campaigns').insert({ name, status: 'active' }).select('id,status').single();
  if (created.error) throw created.error;
  campaign = created.data;
}
const { data: existingBanner, error: bannerLookupError } = await supabase.from('banners').select('id').eq('campaign_id', campaign.id).eq('placement', 'home_top').maybeSingle();
if (bannerLookupError) throw bannerLookupError;
if (!existingBanner) {
  const { error: insertError } = await supabase.from('banners').insert({ campaign_id: campaign.id, placement: 'home_top', image_url: '/images/articles/ig-wellworthy-1-cover.jpg', target_url: '/articles/ig-wellworthy-1', alt_text: 'איך ניטור סוכר ואימוני Zone 2 יכולים לשנות את הבריאות המטבולית', active: true, weight: 10 });
  if (insertError) throw insertError;
}
const { data: verified, error: verificationError } = await supabase.from('banners').select('id,active,campaign_id').eq('campaign_id', campaign.id).eq('placement', 'home_top').single();
if (verificationError) throw verificationError;
console.log(JSON.stringify({ campaign: campaign.status, bannerActive: verified.active }));

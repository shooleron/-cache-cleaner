'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';

const value = (formData: FormData, key: string) => String(formData.get(key) ?? '').trim();
const nullableDate = (input: string) => input ? new Date(input).toISOString() : null;

export async function createCampaign(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = value(formData, 'name');
  const altText = value(formData, 'alt_text');
  const imageUrl = value(formData, 'image_url');
  const targetUrl = value(formData, 'target_url');
  if (!name || !altText || !imageUrl || !targetUrl) redirect('/admin/campaigns/new?error=missing_fields');

  const { data: campaign, error } = await supabase.from('campaigns').insert({
    name,
    status: value(formData, 'status') || 'draft',
    starts_at: nullableDate(value(formData, 'starts_at')),
    ends_at: nullableDate(value(formData, 'ends_at')),
  }).select('id').single();
  if (error) redirect(`/admin/campaigns/new?error=${encodeURIComponent(error.message)}`);

  const { error: bannerError } = await supabase.from('banners').insert({
    campaign_id: campaign.id,
    placement: value(formData, 'placement') || 'home_top',
    image_url: imageUrl,
    target_url: targetUrl,
    alt_text: altText,
    category: value(formData, 'category') || null,
    weight: Number(value(formData, 'weight')) || 1,
    active: value(formData, 'status') === 'active',
  });
  if (bannerError) {
    await supabase.from('campaigns').delete().eq('id', campaign.id);
    redirect(`/admin/campaigns/new?error=${encodeURIComponent(bannerError.message)}`);
  }
  revalidatePath('/');
  redirect(`/admin/campaigns/${campaign.id}?created=1`);
}

export async function saveCampaign(campaignId: string, bannerId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const status = value(formData, 'status') || 'draft';
  const { error } = await supabase.from('campaigns').update({
    name: value(formData, 'name'),
    status,
    starts_at: nullableDate(value(formData, 'starts_at')),
    ends_at: nullableDate(value(formData, 'ends_at')),
  }).eq('id', campaignId);
  if (error) redirect(`/admin/campaigns/${campaignId}?error=${encodeURIComponent(error.message)}`);

  const { error: bannerError } = await supabase.from('banners').update({
    placement: value(formData, 'placement'),
    image_url: value(formData, 'image_url'),
    target_url: value(formData, 'target_url'),
    alt_text: value(formData, 'alt_text'),
    category: value(formData, 'category') || null,
    weight: Number(value(formData, 'weight')) || 1,
    active: status === 'active',
  }).eq('id', bannerId).eq('campaign_id', campaignId);
  if (bannerError) redirect(`/admin/campaigns/${campaignId}?error=${encodeURIComponent(bannerError.message)}`);
  revalidatePath('/');
  revalidatePath('/admin/campaigns');
  redirect(`/admin/campaigns/${campaignId}?saved=1`);
}

export async function setCampaignStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = value(formData, 'id');
  const status = value(formData, 'status');
  if (!id || !['active', 'paused', 'draft'].includes(status)) return;
  const { error } = await supabase.from('campaigns').update({ status }).eq('id', id);
  if (error) redirect(`/admin/campaigns?error=${encodeURIComponent(error.message)}`);
  await supabase.from('banners').update({ active: status === 'active' }).eq('campaign_id', id);
  revalidatePath('/');
  revalidatePath('/admin/campaigns');
}

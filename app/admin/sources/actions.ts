'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';

function safeUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function createSource(formData: FormData) {
  const { supabase } = await requireAdmin();
  const name = String(formData.get('name') ?? '').trim();
  const url = safeUrl(String(formData.get('url') ?? '').trim());
  const feedUrl = safeUrl(String(formData.get('feed_url') ?? '').trim());
  const sourceType = String(formData.get('source_type') ?? 'publication').trim();
  const trustScore = Number(formData.get('trust_score') ?? 5);
  const language = String(formData.get('language') ?? 'en').trim().slice(0, 10);
  const scanIntervalHours = Number(formData.get('scan_interval_hours') ?? 24);
  const topics = String(formData.get('topics') ?? '').split(',').map((topic) => topic.trim()).filter(Boolean).slice(0, 12);

  if (!name || !url || !feedUrl || !language || !Number.isFinite(trustScore) || trustScore < 1 || trustScore > 10 || !Number.isInteger(scanIntervalHours) || scanIntervalHours < 1 || scanIntervalHours > 168) {
    redirect('/admin/sources/new?error=invalid_fields');
  }

  const { error } = await supabase.from('sources').insert({
    name,
    url,
    feed_url: feedUrl,
    source_type: sourceType,
    trust_score: trustScore,
    language,
    scan_interval_hours: scanIntervalHours,
    topics,
    active: true,
  });

  if (error) redirect(`/admin/sources/new?error=${encodeURIComponent(error.code)}`);
  revalidatePath('/admin');
  revalidatePath('/admin/sources');
  redirect('/admin/sources?created=1');
}

export async function toggleSource(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const active = String(formData.get('active')) === 'true';
  if (!id) return;
  await supabase.from('sources').update({ active }).eq('id', id);
  revalidatePath('/admin/sources');
}

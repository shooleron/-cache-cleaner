'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import type { Database } from '@/lib/database.types';

type ContentStatus = Database['public']['Enums']['content_status'];
const allowedStatuses = new Set<ContentStatus>(['collected', 'reviewing', 'draft', 'scheduled', 'published', 'rejected']);

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function createArticle(formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = String(formData.get('title') ?? '').trim();
  const summary = String(formData.get('summary') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const statusInput = String(formData.get('status') ?? 'draft') as ContentStatus;
  const status = allowedStatuses.has(statusInput) ? statusInput : 'draft';

  if (!title || !summary || !body || !category) redirect('/admin/articles/new?error=missing_fields');

  const slug = `${slugify(title) || 'article'}-${Date.now().toString(36)}`;
  const { error } = await supabase.from('articles').insert({
    title,
    slug,
    summary,
    body,
    category,
    status,
    original_language: 'he',
    published_at: status === 'published' ? new Date().toISOString() : null,
  });

  if (error) redirect(`/admin/articles/new?error=${encodeURIComponent(error.code)}`);
  revalidatePath('/admin');
  revalidatePath('/admin/articles');
  redirect('/admin/articles?created=1');
}

export async function updateArticleStatus(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '') as ContentStatus;
  if (!id || !allowedStatuses.has(status)) return;

  if (status === 'published') {
    const { count } = await supabase.from('article_sources').select('*', { count: 'exact', head: true }).eq('article_id', id);
    if (!count) redirect(`/admin/articles/${id}?error=source_required_before_publish`);
  }

  await supabase.from('articles').update({
    status,
    updated_at: new Date().toISOString(),
    published_at: status === 'published' ? new Date().toISOString() : null,
  }).eq('id', id);

  revalidatePath('/admin');
  revalidatePath('/admin/articles');
}

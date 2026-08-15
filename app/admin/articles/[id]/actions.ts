'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';

const editableStatuses = new Set(['draft', 'reviewing']);

export async function saveArticle(articleId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const title = String(formData.get('title') ?? '').trim();
  const summary = String(formData.get('summary') ?? '').trim();
  const body = String(formData.get('body') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const seoTitle = String(formData.get('seo_title') ?? '').trim();
  const seoDescription = String(formData.get('seo_description') ?? '').trim();
  const evidenceLevel = String(formData.get('evidence_level') ?? '').trim() || null;
  const coverImageUrl = String(formData.get('cover_image_url') ?? '').trim() || null;
  const statusInput = String(formData.get('status') ?? 'draft');
  const status = editableStatuses.has(statusInput) ? statusInput as 'draft' | 'reviewing' : 'draft';

  if (!articleId || !title || !summary || !body || !category) {
    redirect(`/admin/articles/${articleId}?error=missing_fields`);
  }

  const { error } = await supabase.from('articles').update({
    title,
    summary,
    body,
    category,
    seo_title: seoTitle || null,
    seo_description: seoDescription || null,
    evidence_level: evidenceLevel,
    cover_image_url: coverImageUrl,
    status,
    updated_at: new Date().toISOString(),
  }).eq('id', articleId);

  if (error) redirect(`/admin/articles/${articleId}?error=${encodeURIComponent(error.code)}`);
  revalidatePath('/admin');
  revalidatePath('/admin/articles');
  revalidatePath(`/admin/articles/${articleId}`);
  redirect(`/admin/articles/${articleId}?saved=1`);
}

export async function attachSource(articleId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const sourceId = String(formData.get('source_id') ?? '');
  const sourceUrlInput = String(formData.get('source_url') ?? '').trim();
  const citationLabel = String(formData.get('citation_label') ?? '').trim() || null;
  const isPrimary = formData.get('is_primary') === 'on';
  if (!articleId || !sourceId) redirect(`/admin/articles/${articleId}?error=missing_source`);

  const { data: source } = await supabase.from('sources').select('url').eq('id', sourceId).single();
  const sourceUrl = sourceUrlInput || source?.url;
  if (!sourceUrl) redirect(`/admin/articles/${articleId}?error=missing_url`);

  const { error } = await supabase.from('article_sources').upsert({
    article_id: articleId,
    source_id: sourceId,
    source_url: sourceUrl,
    citation_label: citationLabel,
    is_primary: isPrimary,
  });
  if (error) redirect(`/admin/articles/${articleId}?error=${encodeURIComponent(error.code)}`);
  revalidatePath(`/admin/articles/${articleId}`);
  redirect(`/admin/articles/${articleId}?credit=1`);
}

export async function detachSource(articleId: string, formData: FormData) {
  const { supabase } = await requireAdmin();
  const sourceId = String(formData.get('source_id') ?? '');
  if (!articleId || !sourceId) return;
  await supabase.from('article_sources').delete().eq('article_id', articleId).eq('source_id', sourceId);
  revalidatePath(`/admin/articles/${articleId}`);
  redirect(`/admin/articles/${articleId}?credit_removed=1`);
}

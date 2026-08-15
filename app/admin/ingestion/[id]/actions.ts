'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import { generateArticleDraft } from '@/lib/ai/generate-article-draft';

const allowedDecisions = new Set(['reviewing', 'draft', 'rejected']);

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9\u0590-\u05ff]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function generateDraft(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const { data: existing } = await supabase.from('articles').select('id').eq('ingestion_item_id', id).maybeSingle();
  if (existing) redirect(`/admin/articles/${existing.id}`);

  const { data: item, error: itemError } = await supabase.from('ingestion_items')
    .select('id,source_id,source_url,raw_title,raw_content,language,published_at,agent_score,image_url,sources(name)')
    .eq('id', id).maybeSingle();
  if (itemError || !item) redirect(`/admin/ingestion/${id}?error=item_not_found`);

  const source = Array.isArray(item.sources) ? item.sources[0] : item.sources;
  let draft;
  try {
    draft = await generateArticleDraft({
      sourceName: source?.name ?? 'מקור חיצוני',
      sourceUrl: item.source_url,
      originalTitle: item.raw_title ?? 'ללא כותרת',
      originalContent: item.raw_content ?? '',
      publishedAt: item.published_at,
      qualityScore: item.agent_score,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 180) : 'generation_failed';
    redirect(`/admin/ingestion/${id}?error=${encodeURIComponent(message)}`);
  }

  const { data: article, error: articleError } = await supabase.from('articles').insert({
    ingestion_item_id: item.id,
    slug: `${slugify(draft.title) || 'article'}-${Date.now().toString(36)}`,
    title: draft.title,
    summary: draft.summary,
    body: draft.body,
    category: draft.category,
    status: 'draft',
    evidence_level: draft.evidence_level,
    scientific_confidence: Number(((item.agent_score ?? 0.5) * 10).toFixed(1)),
    cover_image_url: item.image_url,
    original_language: item.language,
    original_published_at: item.published_at,
    seo_title: draft.seo_title,
    seo_description: draft.seo_description,
  }).select('id').single();
  if (articleError || !article) redirect(`/admin/ingestion/${id}?error=${encodeURIComponent(articleError?.code ?? 'article_save_failed')}`);

  if (item.source_id) {
    const { error: creditError } = await supabase.from('article_sources').insert({
      article_id: article.id,
      source_id: item.source_id,
      source_url: item.source_url,
      citation_label: `מקור ראשי: ${source?.name ?? 'מקור חיצוני'}`,
      is_primary: true,
    });
    if (creditError) {
      await supabase.from('articles').delete().eq('id', article.id);
      redirect(`/admin/ingestion/${id}?error=${encodeURIComponent(creditError.code)}`);
    }
  }

  await supabase.from('ingestion_items').update({ status: 'draft', rejection_reason: null }).eq('id', id);
  revalidatePath('/admin');
  revalidatePath('/admin/articles');
  revalidatePath('/admin/ingestion');
  revalidatePath(`/admin/ingestion/${id}`);
  redirect(`/admin/articles/${article.id}?generated=1`);
}

export async function updateIngestionDecision(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  const rejectionReason = String(formData.get('rejection_reason') ?? '').trim();

  if (!id || !allowedDecisions.has(status)) return;

  const { error } = await supabase.from('ingestion_items').update({
    status: status as 'reviewing' | 'draft' | 'rejected',
    rejection_reason: status === 'rejected' ? (rejectionReason || 'נדחה בבדיקת העורך') : null,
  }).eq('id', id);

  if (error) redirect(`/admin/ingestion/${id}?error=${encodeURIComponent(error.code)}`);
  revalidatePath('/admin');
  revalidatePath('/admin/ingestion');
  revalidatePath(`/admin/ingestion/${id}`);
  redirect(`/admin/ingestion/${id}?saved=1`);
}

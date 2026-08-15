import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const projectRoot = new URL('../', import.meta.url);

async function readEnv() {
  const raw = await readFile(new URL('.env.local', projectRoot), 'utf8');
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const separator = line.indexOf('=');
        const value = line.slice(separator + 1).replace(/^["']|["']$/g, '');
        return [line.slice(0, separator), value];
      }),
  );
}

const env = await readEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const secretKey = env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !secretKey) {
  throw new Error('Missing Supabase server environment variables');
}

const stored = JSON.parse(await readFile(new URL('data/articles.json', projectRoot), 'utf8'));
const sourceArticles = Array.isArray(stored.articles) ? stored.articles : [];
const supabase = createClient(supabaseUrl, secretKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: existing, error: existingError } = await supabase.from('articles').select('slug');
if (existingError) throw existingError;

const existingSlugs = new Set((existing ?? []).map((article) => article.slug));
const missing = sourceArticles.filter((article) => article.id && !existingSlugs.has(article.id));

const rows = missing.map((article) => ({
  slug: article.id,
  title: article.title,
  summary: article.summary,
  body: article.content,
  category: article.category,
  status: 'published',
  evidence_level:
    Number(article.scientificConfidence) >= 8.5
      ? 'high'
      : Number(article.scientificConfidence) >= 7
        ? 'medium'
        : 'limited',
  scientific_confidence: article.scientificConfidence ?? null,
  cover_image_url: article.imageUrl ?? null,
  original_language: 'he',
  original_published_at: article.publishedAt ?? null,
  published_at: article.publishedAt ?? new Date().toISOString(),
  seo_title: String(article.title ?? '').slice(0, 60) || null,
  seo_description: String(article.summary ?? '').slice(0, 155) || null,
  created_at: article.publishedAt ?? new Date().toISOString(),
  updated_at: article.lastUpdated ?? article.publishedAt ?? new Date().toISOString(),
}));

if (rows.length) {
  const { error: insertError } = await supabase.from('articles').insert(rows);
  if (insertError) throw insertError;
}

const { count, error: countError } = await supabase
  .from('articles')
  .select('*', { count: 'exact', head: true });
if (countError) throw countError;

console.log(JSON.stringify({ found: sourceArticles.length, imported: rows.length, skipped: sourceArticles.length - rows.length, cmsTotal: count }));

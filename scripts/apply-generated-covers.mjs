import { readFile, writeFile } from 'node:fs/promises';
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
        return [
          line.slice(0, separator),
          line.slice(separator + 1).replace(/^["']|["']$/g, ''),
        ];
      }),
  );
}

const articlesFile = new URL('data/articles.json', projectRoot);
const stored = JSON.parse(await readFile(articlesFile, 'utf8'));
const articles = Array.isArray(stored.articles) ? stored.articles : [];

for (const article of articles) {
  article.imageUrl = `/images/articles/${article.id}-cover.jpg`;
}

stored.lastSaved = new Date().toISOString();
stored.version = 'v4_generated_covers';
await writeFile(articlesFile, `${JSON.stringify(stored, null, 2)}\n`, 'utf8');

const env = await readEnv();
if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SECRET_KEY) {
  throw new Error('Missing Supabase server environment variables');
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let updated = 0;
for (const article of articles) {
  const coverImageUrl = `/images/articles/${article.id}-cover.jpg`;
  const { data, error } = await supabase
    .from('articles')
    .update({ cover_image_url: coverImageUrl })
    .eq('slug', article.id)
    .select('slug, cover_image_url');

  if (error) throw error;
  if (data?.length === 1 && data[0].cover_image_url === coverImageUrl) updated += 1;
}

const { data: verified, error: verificationError } = await supabase
  .from('articles')
  .select('slug, cover_image_url')
  .in(
    'slug',
    articles.map((article) => article.id),
  );

if (verificationError) throw verificationError;
const verifiedCount = (verified ?? []).filter(
  (article) => article.cover_image_url === `/images/articles/${article.slug}-cover.jpg`,
).length;

console.log(JSON.stringify({ localArticles: articles.length, updated, verified: verifiedCount }));

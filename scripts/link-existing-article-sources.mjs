import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const projectRoot = new URL('../', import.meta.url);
const rawEnv = await readFile(new URL('.env.local', projectRoot), 'utf8');
const env = Object.fromEntries(rawEnv.split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => {
  const separator = line.indexOf('=');
  return [line.slice(0, separator), line.slice(separator + 1).replace(/^["']|["']$/g, '')];
}));

const sourceUrlByLabel = {
  'Longevity Tech': 'https://longevity.technology/',
  'Lifespan.io': 'https://www.lifespan.io/',
  'Athletech News': 'https://athletechnews.com/',
  ScienceDaily: 'https://www.sciencedaily.com/news/health_medicine/',
  MobiHealthNews: 'https://www.mobihealthnews.com/',
  'Fitt Insider': 'https://insider.fitt.co/',
  'הידען': 'https://www.hayadan.org.il/category/medicine',
  'Medical News Today': 'https://www.medicalnewstoday.com/',
  'Instagram (@wellworthymedia)': 'https://www.instagram.com/wellworthymedia/',
  'Instagram (@itsvicchang)': 'https://www.instagram.com/itsvicchang/',
  'Instagram (@athletechnews)': 'https://www.instagram.com/athletechnews/',
  'Instagram (@shai_elancry)': 'https://www.instagram.com/shai_elancry/',
  'Instagram (@artshooler)': 'https://www.instagram.com/artshooler/',
  'Instagram (DbculY1pG-G)': 'https://www.instagram.com/p/DbculY1pG-G/',
};

const stored = JSON.parse(await readFile(new URL('data/articles.json', projectRoot), 'utf8'));
const legacyArticles = Array.isArray(stored.articles) ? stored.articles : [];
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const [{ data: cmsArticles, error: articleError }, { data: cmsSources, error: sourceError }, { data: existingCredits, error: creditError }] = await Promise.all([
  supabase.from('articles').select('id,slug'),
  supabase.from('sources').select('id,url'),
  supabase.from('article_sources').select('article_id,source_url'),
]);
if (articleError) throw articleError;
if (sourceError) throw sourceError;
if (creditError) throw creditError;

const articleIdBySlug = new Map(cmsArticles.map((article) => [article.slug, article.id]));
const sourceIdByUrl = new Map(cmsSources.map((source) => [source.url, source.id]));
const existingKeys = new Set(existingCredits.map((credit) => `${credit.article_id}|${credit.source_url}`));

const credits = legacyArticles.flatMap((article) => {
  const sourceUrl = sourceUrlByLabel[article.source];
  const articleId = articleIdBySlug.get(article.id);
  const sourceId = sourceIdByUrl.get(sourceUrl);
  if (!sourceUrl || !articleId || !sourceId || existingKeys.has(`${articleId}|${sourceUrl}`)) return [];
  const isExactLink = sourceUrl.includes('instagram.com/p/');
  return [{
    article_id: articleId,
    source_id: sourceId,
    source_url: sourceUrl,
    citation_label: isExactLink ? `מקור: ${article.source}` : `מקור שהוגדר בכתבה: ${article.source} — נדרש אימות קישור מדויק`,
    is_primary: true,
  }];
});

if (credits.length) {
  const { error } = await supabase.from('article_sources').insert(credits);
  if (error) throw error;
}

const { count, error: countError } = await supabase.from('article_sources').select('*', { count: 'exact', head: true });
if (countError) throw countError;
console.log(JSON.stringify({ linked: credits.length, totalCredits: count }));

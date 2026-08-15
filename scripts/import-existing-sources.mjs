import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const projectRoot = new URL('../', import.meta.url);

async function readEnv() {
  const raw = await readFile(new URL('.env.local', projectRoot), 'utf8');
  return Object.fromEntries(raw.split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => {
    const separator = line.indexOf('=');
    return [line.slice(0, separator), line.slice(separator + 1).replace(/^["']|["']$/g, '')];
  }));
}

const publicationTopics = ['wellness', 'fitness', 'nutrition', 'longevity', 'health-tech'];
const sources = [
  { name: 'ScienceDaily Health', url: 'https://www.sciencedaily.com/news/health_medicine/', feed_url: 'https://www.sciencedaily.com/rss/top/health.xml', language: 'en', trust_score: 8.5, topics: ['research', 'health', 'nutrition'] },
  { name: 'Fierce Medtech', url: 'https://www.fiercebiotech.com/medtech', feed_url: 'https://www.fiercebiotech.com/rss/medtech', language: 'en', trust_score: 8, topics: ['medtech', 'digital-health', 'medical-devices'] },
  { name: 'כושר ישראל', url: 'https://fitnessisrael.co.il/', feed_url: 'https://fitnessisrael.co.il/feed/', language: 'he', trust_score: 7.5, topics: ['fitness', 'nutrition', 'wellness'] },
  { name: 'Athletech News', url: 'https://athletechnews.com/', feed_url: 'https://athletechnews.com/feed/', language: 'en', trust_score: 7.5, topics: ['fitness-tech', 'wellness-business', 'wearables'] },
  { name: 'Fitt Insider', url: 'https://insider.fitt.co/', feed_url: 'https://insider.fitt.co/feed/', language: 'en', trust_score: 7.5, topics: ['wellness-business', 'fitness-tech', 'startups'] },
  { name: 'Longevity Technology', url: 'https://longevity.technology/', feed_url: 'https://longevity.technology/feed/', language: 'en', trust_score: 7.5, topics: ['longevity', 'biotech', 'healthspan'] },
  { name: 'Lifespan.io', url: 'https://www.lifespan.io/', feed_url: 'https://www.lifespan.io/feed/', language: 'en', trust_score: 8, topics: ['longevity', 'aging-research', 'biotech'] },
  { name: 'MobiHealthNews', url: 'https://www.mobihealthnews.com/', feed_url: 'https://www.mobihealthnews.com/feed', language: 'en', trust_score: 8, topics: ['digital-health', 'medtech', 'healthcare'] },
  { name: 'הידען — רפואה וביולוגיה', url: 'https://www.hayadan.org.il/category/medicine', feed_url: 'https://www.hayadan.org.il/category/medicine/feed', language: 'he', trust_score: 7.5, topics: ['research', 'medicine', 'biology'] },
  { name: 'Medical News Today', url: 'https://www.medicalnewstoday.com/', feed_url: 'https://www.medicalnewstoday.com/rss/featurednews.xml', language: 'en', trust_score: 8.5, topics: ['health', 'nutrition', 'medical-research'] },
  { name: 'Well Worthy Media — Instagram', url: 'https://www.instagram.com/wellworthymedia/', feed_url: null, language: 'en', trust_score: 6.5, source_type: 'social', topics: ['wellness', 'longevity', 'nutrition'] },
  { name: 'Vic Chang — Instagram', url: 'https://www.instagram.com/itsvicchang/', feed_url: null, language: 'en', trust_score: 6.5, source_type: 'social', topics: ['strength-training', 'fitness-tech', 'coaching'] },
  { name: 'Athletech News — Instagram', url: 'https://www.instagram.com/athletechnews/', feed_url: null, language: 'en', trust_score: 7, source_type: 'social', topics: ['fitness-tech', 'wellness-business'] },
  { name: 'שי אלנקרי — Instagram', url: 'https://www.instagram.com/shai_elancry/', feed_url: null, language: 'he', trust_score: 6, source_type: 'social', topics: ['fitness', 'nutrition', 'coaching'] },
  { name: 'Art Shooler — Instagram', url: 'https://www.instagram.com/artshooler/', feed_url: null, language: 'he', trust_score: 6, source_type: 'social', topics: ['fitness-tech', 'wearables', 'hrv'] },
  { name: 'Instagram Post DbculY1pG-G', url: 'https://www.instagram.com/p/DbculY1pG-G/', feed_url: null, language: 'en', trust_score: 5, source_type: 'social', topics: ['biohacking', 'recovery', 'hrv'] },
].map((source) => ({
  source_type: 'publication',
  scan_interval_hours: source.feed_url ? 12 : 24,
  auto_publish: false,
  active: true,
  topics: publicationTopics,
  ...source,
}));

const env = await readEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: existing, error: existingError } = await supabase.from('sources').select('url');
if (existingError) throw existingError;

const existingUrls = new Set((existing ?? []).map((source) => source.url));
const missing = sources.filter((source) => !existingUrls.has(source.url));

if (missing.length) {
  const { error: insertError } = await supabase.from('sources').insert(missing);
  if (insertError) throw insertError;
}

const { count, error: countError } = await supabase.from('sources').select('*', { count: 'exact', head: true });
if (countError) throw countError;

console.log(JSON.stringify({ catalogued: sources.length, imported: missing.length, skipped: sources.length - missing.length, cmsTotal: count }));

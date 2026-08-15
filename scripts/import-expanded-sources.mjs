import { readFile } from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';

const projectRoot = new URL('../', import.meta.url);
const envText = await readFile(new URL('.env.local', projectRoot), 'utf8');
const env = Object.fromEntries(envText.split(/\r?\n/).filter((line) => line && !line.startsWith('#')).map((line) => {
  const separator = line.indexOf('=');
  return [line.slice(0, separator), line.slice(separator + 1).replace(/^["']|["']$/g, '')];
}));

const sources = [
  { name: 'Nature Medicine', url: 'https://www.nature.com/nm/', feed_url: 'https://www.nature.com/nm.rss', source_type: 'journal', trust_score: 10, topics: ['medicine', 'clinical-research', 'health-tech'] },
  { name: 'Nature Biomedical Engineering', url: 'https://www.nature.com/natbiomedeng/', feed_url: 'https://www.nature.com/natbiomedeng.rss', source_type: 'journal', trust_score: 10, topics: ['biomedical-engineering', 'wearables', 'medical-devices'] },
  { name: 'British Journal of Sports Medicine', url: 'https://bjsm.bmj.com/', feed_url: 'https://bjsm.bmj.com/rss/current.xml', source_type: 'journal', trust_score: 9.5, topics: ['sports-medicine', 'exercise', 'injury-prevention'] },
  { name: 'Journal of Applied Physiology', url: 'https://journals.physiology.org/journal/jappl', feed_url: 'https://journals.physiology.org/action/showFeed?type=etoc&feed=rss&jc=jappl', source_type: 'journal', trust_score: 9.5, topics: ['physiology', 'exercise', 'metabolism'] },
  { name: 'PLOS Medicine', url: 'https://journals.plos.org/plosmedicine/', feed_url: 'https://journals.plos.org/plosmedicine/feed/atom', source_type: 'journal', trust_score: 9.5, topics: ['medicine', 'public-health', 'clinical-research'] },
  { name: 'PLOS Digital Health', url: 'https://journals.plos.org/digitalhealth/', feed_url: 'https://journals.plos.org/digitalhealth/feed/atom', source_type: 'journal', trust_score: 9.5, topics: ['digital-health', 'ai', 'health-data'] },
  { name: 'Frontiers in Digital Health', url: 'https://www.frontiersin.org/journals/digital-health', feed_url: 'https://www.frontiersin.org/journals/digital-health/rss', source_type: 'journal', trust_score: 8.5, topics: ['digital-health', 'ai', 'telemedicine'] },
  { name: 'Frontiers in Physiology', url: 'https://www.frontiersin.org/journals/physiology', feed_url: 'https://www.frontiersin.org/journals/physiology/rss', source_type: 'journal', trust_score: 8.5, topics: ['physiology', 'exercise', 'recovery'] },
  { name: 'World Health Organization', url: 'https://www.who.int/', feed_url: 'https://www.who.int/rss-feeds/news-english.xml', source_type: 'institution', trust_score: 9.5, topics: ['public-health', 'health-policy', 'prevention'] },
  { name: 'Mayo Clinic News Network', url: 'https://newsnetwork.mayoclinic.org/', feed_url: 'https://newsnetwork.mayoclinic.org/feed/', source_type: 'institution', trust_score: 9, topics: ['medicine', 'nutrition', 'wellness'] },
  { name: 'Neuroscience News', url: 'https://neurosciencenews.com/', feed_url: 'https://neurosciencenews.com/feed/', source_type: 'publication', trust_score: 8, topics: ['neuroscience', 'mental-health', 'brain-tech'] },
  { name: 'Medical Device Network', url: 'https://www.medicaldevice-network.com/', feed_url: 'https://www.medicaldevice-network.com/feed/', source_type: 'publication', trust_score: 7.5, topics: ['medical-devices', 'medtech', 'regulation'] },
  { name: 'Stronger by Science', url: 'https://www.strongerbyscience.com/', feed_url: 'https://www.strongerbyscience.com/feed/', source_type: 'publication', trust_score: 8, topics: ['strength-training', 'nutrition', 'exercise-science'] },
  { name: 'Sleep Foundation', url: 'https://www.sleepfoundation.org/', feed_url: 'https://www.sleepfoundation.org/feed', source_type: 'institution', trust_score: 8, topics: ['sleep', 'recovery', 'mental-health'] },
].map((source) => ({
  ...source,
  language: 'en',
  scan_interval_hours: source.source_type === 'journal' ? 24 : 12,
  auto_publish: false,
  active: true,
}));

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
console.log(JSON.stringify({ candidates: sources.length, imported: missing.length, skipped: sources.length - missing.length, cmsTotal: count }));

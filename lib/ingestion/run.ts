import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseFeed } from './rss';
import { scoreItem } from './scoring';

const MAX_ITEMS_PER_SOURCE = 40;
const MAX_AGE_MS = 90 * 86_400_000;

function normalizedUrl(value: string) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported URL protocol');
  if (/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/i.test(url.hostname)) throw new Error('Private feed URL is not allowed');
  url.hash = '';
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].forEach((key) => url.searchParams.delete(key));
  return url.toString();
}

async function fetchXml(feedUrl: string) {
  const url = normalizedUrl(feedUrl);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { 'User-Agent': 'PulseTechContentBot/1.0 (+https://pulsetech.co.il)' },
    });
    if (!response.ok) throw new Error(`Feed returned HTTP ${response.status}`);
    const length = Number(response.headers.get('content-length') ?? 0);
    if (length > 12_000_000) throw new Error('Feed is larger than 12MB');
    const xml = await response.text();
    if (xml.length > 12_000_000) throw new Error('Feed is larger than 12MB');
    return xml;
  } finally {
    clearTimeout(timeout);
  }
}

export async function runIngestion(options: { force?: boolean } = {}) {
  const supabase = createAdminClient();
  const startedAt = new Date().toISOString();
  const { data: run, error: runError } = await supabase.from('agent_runs').insert({
    agent_name: 'rss-ingestion-v1', job_type: 'source_scan', status: 'running', input: options,
  }).select('id').single();
  if (runError) throw runError;

  const { data: sources, error: sourceError } = await supabase.from('sources')
    .select('id,name,feed_url,language,trust_score,last_scanned_at,scan_interval_hours')
    .eq('active', true).not('feed_url', 'is', null);
  if (sourceError) throw sourceError;

  const totals = { sources: 0, discovered: 0, queued: 0, rejected: 0, errors: 0 };
  const sourceResults: Array<{ source: string; found?: number; queued?: number; error?: string }> = [];

  for (const source of sources ?? []) {
    const dueAt = source.last_scanned_at
      ? Date.parse(source.last_scanned_at) + source.scan_interval_hours * 3_600_000
      : 0;
    if (!options.force && Date.now() < dueAt) continue;
    totals.sources += 1;

    try {
      const items = parseFeed(await fetchXml(source.feed_url!))
        .filter((item) => !item.publishedAt || Date.now() - Date.parse(item.publishedAt) <= MAX_AGE_MS)
        .slice(0, MAX_ITEMS_PER_SOURCE);
      totals.discovered += items.length;

      const rows = items.flatMap((item) => {
        try {
          const quality = scoreItem({ ...item, trustScore: Number(source.trust_score) });
          if (quality.status === 'rejected') totals.rejected += 1;
          return [{
            source_id: source.id,
            source_url: normalizedUrl(item.url),
            raw_title: item.title,
            raw_content: item.content.slice(0, 20_000),
            language: source.language,
            published_at: item.publishedAt,
            image_url: item.imageUrl,
            status: quality.status,
            agent_score: quality.score,
            rejection_reason: quality.rejectionReason,
            quality_details: quality.details,
          }];
        } catch { return []; }
      });

      const { data: inserted, error } = rows.length
        ? await supabase.from('ingestion_items').upsert(rows, { onConflict: 'source_url', ignoreDuplicates: true }).select('id')
        : { data: [], error: null };
      if (error) throw error;
      const queued = inserted?.length ?? 0;
      totals.queued += queued;
      await supabase.from('sources').update({ last_scanned_at: new Date().toISOString(), last_scan_status: 'success', last_scan_error: null, items_last_scan: queued }).eq('id', source.id);
      sourceResults.push({ source: source.name, found: items.length, queued });
    } catch (error) {
      totals.errors += 1;
      const message = error instanceof Error ? error.message.slice(0, 500) : 'Unknown scan error';
      await supabase.from('sources').update({ last_scanned_at: new Date().toISOString(), last_scan_status: 'error', last_scan_error: message, items_last_scan: 0 }).eq('id', source.id);
      sourceResults.push({ source: source.name, error: message });
    }
  }

  await supabase.from('agent_runs').update({ status: totals.errors ? 'completed_with_errors' : 'completed', output: { totals, sources: sourceResults }, started_at: startedAt, finished_at: new Date().toISOString() }).eq('id', run.id);
  return { runId: run.id, totals, sources: sourceResults };
}

import { XMLParser } from 'fast-xml-parser';

export type FeedItem = {
  title: string;
  url: string;
  content: string;
  publishedAt: string | null;
  imageUrl: string | null;
};

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', trimValues: true });

function list<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return text(record['#text'] ?? record['__cdata'] ?? '');
  }
  return '';
}

function clean(value: unknown): string {
  return text(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function linkOf(item: Record<string, unknown>): string {
  const links = list(item.link);
  for (const link of links) {
    if (typeof link === 'string') return link;
    if (link && typeof link === 'object') {
      const record = link as Record<string, unknown>;
      if (!record['@_rel'] || record['@_rel'] === 'alternate') return text(record['@_href']);
    }
  }
  return text(item.guid ?? item.id);
}

function imageOf(item: Record<string, unknown>): string | null {
  const candidates = [item.enclosure, item['media:content'], item['media:thumbnail']];
  for (const candidate of candidates) {
    const first = list(candidate)[0];
    if (first && typeof first === 'object') {
      const url = text((first as Record<string, unknown>)['@_url']);
      if (url) return url;
    }
  }
  return null;
}

export function parseFeed(xml: string): FeedItem[] {
  const parsed = parser.parse(xml) as Record<string, any>;
  const rssItems = list(parsed?.rss?.channel?.item);
  const atomItems = list(parsed?.feed?.entry);
  const rdfItems = list(parsed?.['rdf:RDF']?.item);

  return [...rssItems, ...atomItems, ...rdfItems].flatMap((raw) => {
    const item = raw as Record<string, unknown>;
    const title = clean(item.title);
    const url = linkOf(item).trim();
    if (!title || !url) return [];

    const dateValue = text(item.pubDate ?? item.published ?? item.updated ?? item['dc:date']);
    const timestamp = Date.parse(dateValue);
    return [{
      title,
      url,
      content: clean(item['content:encoded'] ?? item.content ?? item.description ?? item.summary),
      publishedAt: Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString(),
      imageUrl: imageOf(item),
    }];
  });
}

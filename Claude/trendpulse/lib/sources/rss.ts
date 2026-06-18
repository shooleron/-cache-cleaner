import Parser from 'rss-parser';
import { Trend, TrendCategory } from '../types';

const parser = new Parser({
  customFields: { item: ['media:thumbnail', 'media:content', 'content:encoded'] },
});

const RSS_FEEDS: { url: string; category: TrendCategory; label: string }[] = [
  { url: 'https://hnrss.org/frontpage', category: 'tech', label: 'HN' },
  {
    url: 'https://feeds.feedburner.com/TechCrunch',
    category: 'tech',
    label: 'TechCrunch',
  },
  {
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'tech',
    label: 'The Verge',
  },
  {
    url: 'https://venturebeat.com/feed/',
    category: 'ai',
    label: 'VentureBeat',
  },
  {
    url: 'https://marketingland.com/feed',
    category: 'marketing',
    label: 'Marketing Land',
  },
  {
    url: 'https://producthunt.com/feed',
    category: 'business',
    label: 'Product Hunt',
  },
];

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function extractThumbnail(item: Record<string, unknown>): string | undefined {
  const mt = item['media:thumbnail'];
  if (mt && typeof mt === 'object') {
    const obj = mt as Record<string, unknown>;
    if (obj.$ && typeof obj.$ === 'object') {
      return (obj.$ as Record<string, string>).url;
    }
  }
  const mc = item['media:content'];
  if (mc && typeof mc === 'object') {
    const obj = mc as Record<string, unknown>;
    if (obj.$ && typeof obj.$ === 'object') {
      return (obj.$ as Record<string, string>).url;
    }
  }
  return undefined;
}

export async function fetchRSS(): Promise<Trend[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async ({ url, category, label }) => {
      const feed = await parser.parseURL(url);
      return feed.items.slice(0, 6).map((item, i): Trend => {
        const anyItem = item as unknown as Record<string, unknown>;
        const raw = anyItem['content:encoded'] as string | undefined ?? item.content as string | undefined;
        const fullContent = raw ? stripHtml(raw).slice(0, 4000) : undefined;
        const link = item.link || '#';
        return {
          id: `rss-${label}-${i}-${Date.now()}`,
          title: item.title || 'Untitled',
          url: link,
          source: 'rss',
          category,
          score: Math.max(10, 80 - i * 10),
          rawScore: 0,
          commentCount: 0,
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          author: (item.creator as string | undefined) ?? (anyItem['author'] as string | undefined),
          thumbnail: extractThumbnail(anyItem),
          description: item.contentSnippet?.slice(0, 280),
          fullContent,
          publication: label === 'HN' ? undefined : label,
          domain: extractDomain(link),
          tags: [label],
        };
      });
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<Trend[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);
}

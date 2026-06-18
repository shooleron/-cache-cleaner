import { Trend, TrendCategory } from '../types';

interface HNHit {
  objectID: string;
  title: string;
  url: string;
  points: number;
  num_comments: number;
  created_at: string;
  author: string;
  _tags: string[];
}

function guessCategory(title: string, tags: string[]): TrendCategory {
  const t = title.toLowerCase();
  if (/\b(ai|llm|gpt|machine learning|neural|openai|anthropic|gemini|claude)\b/.test(t)) return 'ai';
  if (/\b(crypto|bitcoin|ethereum|blockchain|web3|nft|defi)\b/.test(t)) return 'crypto';
  if (/\b(design|ux|ui|figma|typography|css)\b/.test(t)) return 'design';
  if (/\b(marketing|seo|ads|growth|brand|funnel|conversion)\b/.test(t)) return 'marketing';
  if (/\b(science|research|study|physics|biology|climate)\b/.test(t)) return 'science';
  if (/\b(startup|vc|funding|revenue|saas|b2b)\b/.test(t)) return 'business';
  if (/\b(rust|python|javascript|typescript|go|swift|react|next)\b/.test(t)) return 'tech';
  return 'tech';
}

export async function fetchHackerNews(): Promise<Trend[]> {
  const res = await fetch(
    'https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30',
    { next: { revalidate: 900 } }
  );
  if (!res.ok) throw new Error(`HN fetch failed: ${res.status}`);
  const data: { hits: HNHit[] } = await res.json();

  const maxPoints = Math.max(...data.hits.map((h) => h.points || 0));

  return data.hits
    .filter((h) => h.title && (h.url || h.objectID))
    .map((h): Trend => {
      const url = h.url || `https://news.ycombinator.com/item?id=${h.objectID}`;
      const category = guessCategory(h.title, h._tags);
      const score = maxPoints > 0 ? Math.round((h.points / maxPoints) * 100) : 50;
      let domain = '';
      try { domain = new URL(url).hostname.replace(/^www\./, ''); } catch { /* ignore */ }
      return {
        id: `hn-${h.objectID}`,
        title: h.title,
        url,
        source: 'hackernews',
        category,
        score,
        rawScore: h.points,
        commentCount: h.num_comments,
        publishedAt: h.created_at,
        author: h.author,
        publication: domain || 'Hacker News',
        domain,
        hnId: h.objectID,
        tags: h._tags?.filter((t) => !['story', 'front_page', 'author_'].some((p) => t.startsWith(p))) ?? [],
      };
    });
}

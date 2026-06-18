import { Trend, TrendCategory } from '../types';

interface RedditPost {
  data: {
    id: string;
    title: string;
    url: string;
    permalink: string;
    score: number;
    num_comments: number;
    created_utc: number;
    author: string;
    subreddit: string;
    thumbnail: string;
    selftext: string;
    is_video: boolean;
  };
}

const SUBREDDIT_CATEGORIES: Record<string, TrendCategory> = {
  technology: 'tech',
  programming: 'tech',
  webdev: 'tech',
  artificial: 'ai',
  MachineLearning: 'ai',
  ChatGPT: 'ai',
  marketing: 'marketing',
  entrepreneur: 'business',
  startups: 'business',
  business: 'business',
  CryptoCurrency: 'crypto',
  Bitcoin: 'crypto',
  science: 'science',
  Futurology: 'science',
  design: 'design',
  graphic_design: 'design',
  worldnews: 'culture',
  news: 'culture',
  todayilearned: 'culture',
};

function subredditToCategory(subreddit: string): TrendCategory {
  return SUBREDDIT_CATEGORIES[subreddit] || 'culture';
}

export async function fetchReddit(): Promise<Trend[]> {
  // Use multiple curated subreddits for marketing-relevant content
  const subreddits = [
    'technology',
    'artificial',
    'marketing',
    'entrepreneur',
    'startups',
    'ChatGPT',
    'Futurology',
    'worldnews',
  ];

  const results = await Promise.allSettled(
    subreddits.map((sub) =>
      fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=8`, {
        headers: { 'User-Agent': 'TrendPulse/1.0' },
        next: { revalidate: 900 },
      }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
    )
  );

  const posts: RedditPost['data'][] = [];
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      const children: RedditPost[] = r.value?.data?.children ?? [];
      children.forEach((c) => posts.push(c.data));
    }
  });

  const maxScore = Math.max(...posts.map((p) => p.score || 0));

  return posts
    .filter((p) => p.title && p.score > 100)
    .map((p): Trend => {
      const thumbnail =
        p.thumbnail && !['self', 'default', 'nsfw', 'spoiler', ''].includes(p.thumbnail)
          ? p.thumbnail
          : undefined;
      return {
        id: `reddit-${p.id}`,
        title: p.title,
        url: p.url.startsWith('/r/') ? `https://reddit.com${p.url}` : p.url,
        source: 'reddit',
        category: subredditToCategory(p.subreddit),
        score: maxScore > 0 ? Math.round((p.score / maxScore) * 100) : 50,
        rawScore: p.score,
        commentCount: p.num_comments,
        publishedAt: new Date(p.created_utc * 1000).toISOString(),
        author: p.author,
        thumbnail,
        subreddit: p.subreddit,
        tags: [p.subreddit],
        description: p.selftext?.slice(0, 200) || undefined,
      };
    });
}

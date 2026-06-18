import { Trend, TrendCategory } from '../types';

interface YTVideo {
  id: string;
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    description: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
    categoryId: string;
    tags?: string[];
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    commentCount: string;
  };
}

const YT_CATEGORY_MAP: Record<string, TrendCategory> = {
  '1': 'culture',   // Film & Animation
  '2': 'culture',   // Autos
  '10': 'culture',  // Music
  '15': 'culture',  // Pets
  '17': 'culture',  // Sports
  '19': 'culture',  // Travel
  '20': 'culture',  // Gaming
  '22': 'culture',  // People & Blogs
  '23': 'culture',  // Comedy
  '24': 'culture',  // Entertainment
  '25': 'culture',  // News
  '26': 'culture',  // Howto
  '27': 'science',  // Education
  '28': 'tech',     // Science & Tech
};

export async function fetchYouTube(): Promise<Trend[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return [];

  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&maxResults=20&regionCode=US&key=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) {
    console.warn('YouTube fetch failed:', res.status);
    return [];
  }

  const data: { items: YTVideo[] } = await res.json();
  const maxViews = Math.max(...data.items.map((v) => parseInt(v.statistics.viewCount || '0')));

  return data.items.map((v): Trend => {
    const views = parseInt(v.statistics.viewCount || '0');
    const category: TrendCategory = YT_CATEGORY_MAP[v.snippet.categoryId] || 'culture';
    return {
      id: `yt-${v.id}`,
      title: v.snippet.title,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      source: 'youtube',
      category,
      score: maxViews > 0 ? Math.round((views / maxViews) * 100) : 50,
      rawScore: views,
      commentCount: parseInt(v.statistics.commentCount || '0'),
      publishedAt: v.snippet.publishedAt,
      author: v.snippet.channelTitle,
      channelName: v.snippet.channelTitle,
      thumbnail: v.snippet.thumbnails.medium?.url || v.snippet.thumbnails.default?.url,
      description: v.snippet.description?.slice(0, 200),
      tags: v.snippet.tags?.slice(0, 5) ?? [],
    };
  });
}

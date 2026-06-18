export type TrendSource = 'hackernews' | 'reddit' | 'youtube' | 'rss' | 'producthunt';

export type TrendCategory =
  | 'tech'
  | 'ai'
  | 'marketing'
  | 'culture'
  | 'business'
  | 'science'
  | 'design'
  | 'crypto'
  | 'other';

export interface Trend {
  id: string;
  title: string;
  url: string;
  source: TrendSource;
  category: TrendCategory;
  score: number;          // normalized 0-100 heat score
  rawScore: number;       // original platform score (upvotes, views, etc.)
  commentCount: number;
  publishedAt: string;    // ISO date string
  author?: string;
  thumbnail?: string;
  description?: string;
  fullContent?: string;   // full article body (plain text, from RSS)
  publication?: string;   // publication/outlet name (e.g. "TechCrunch", "The Verge")
  tags: string[];
  subreddit?: string;     // for Reddit
  channelName?: string;   // for YouTube
  hnId?: string;          // for HN discussion link
  domain?: string;        // original article domain
}

export interface AIAnalysis {
  summary: string;
  topTrends: TrendInsight[];
  marketingOpportunities: MarketingOpportunity[];
  weeklyPrediction: string;
  generatedAt: string;
}

export interface TrendInsight {
  trendId: string;
  title: string;
  whyItRising: string;
  longevityScore: number;  // 1-10
  longevityLabel: 'flash' | 'short' | 'medium' | 'long';
  audienceMatch: string;
  contentIdeas: string[];
}

export interface MarketingOpportunity {
  title: string;
  description: string;
  urgency: 'now' | 'this-week' | 'this-month';
  channels: string[];
}

export interface TrendsResponse {
  trends: Trend[];
  fetchedAt: string;
  sources: { source: TrendSource; count: number; ok: boolean }[];
}

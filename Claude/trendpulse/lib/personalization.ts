import { Trend, TrendCategory } from './types';

export type UserRole =
  | 'marketer'
  | 'founder'
  | 'brand-manager'
  | 'designer'
  | 'developer'
  | 'investor'
  | 'content-creator';

export interface UserPreferences {
  role: UserRole;
  categories: TrendCategory[];
  keywords: string[];
  sources: string[];
}

export const ROLE_CONFIG: Record<UserRole, { label: string; emoji: string; defaultCategories: TrendCategory[]; defaultKeywords: string[] }> = {
  marketer: {
    label: 'Marketer',
    emoji: '📣',
    defaultCategories: ['marketing', 'culture', 'ai', 'business'],
    defaultKeywords: ['brand', 'campaign', 'ads', 'social', 'viral', 'growth', 'seo', 'content'],
  },
  founder: {
    label: 'Founder',
    emoji: '🚀',
    defaultCategories: ['business', 'tech', 'ai'],
    defaultKeywords: ['startup', 'funding', 'saas', 'product', 'vc', 'launch', 'revenue'],
  },
  'brand-manager': {
    label: 'Brand Manager',
    emoji: '💼',
    defaultCategories: ['marketing', 'culture', 'design'],
    defaultKeywords: ['brand', 'identity', 'trend', 'consumer', 'campaign', 'influencer'],
  },
  designer: {
    label: 'Designer',
    emoji: '🎨',
    defaultCategories: ['design', 'tech', 'culture'],
    defaultKeywords: ['ux', 'ui', 'figma', 'typography', 'visual', 'aesthetic', 'creative'],
  },
  developer: {
    label: 'Developer',
    emoji: '💻',
    defaultCategories: ['tech', 'ai'],
    defaultKeywords: ['open source', 'api', 'framework', 'code', 'deploy', 'performance', 'rust', 'typescript'],
  },
  investor: {
    label: 'Investor',
    emoji: '📈',
    defaultCategories: ['business', 'tech', 'ai', 'crypto'],
    defaultKeywords: ['funding', 'ipo', 'valuation', 'market', 'revenue', 'series', 'acquisition'],
  },
  'content-creator': {
    label: 'Content Creator',
    emoji: '🎬',
    defaultCategories: ['culture', 'marketing', 'ai'],
    defaultKeywords: ['viral', 'tiktok', 'youtube', 'short-form', 'creator', 'audience', 'engagement'],
  },
};

export const STORAGE_KEY = 'trendpulse_prefs_v1';

export function loadPreferences(): UserPreferences | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function clearPreferences(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Returns a relevance score 0-100 for a trend given user preferences */
export function scoreTrend(trend: Trend, prefs: UserPreferences): number {
  let score = 0;

  // Category match — highest weight
  if (prefs.categories.includes(trend.category)) score += 50;

  // Keyword match in title
  const titleLower = trend.title.toLowerCase();
  const keywordMatches = prefs.keywords.filter((kw) =>
    titleLower.includes(kw.toLowerCase())
  ).length;
  score += Math.min(keywordMatches * 15, 30);

  // Source preference
  if (prefs.sources.includes(trend.source)) score += 10;

  // Add base heat score influence (10%)
  score += trend.score * 0.1;

  return Math.min(Math.round(score), 100);
}

export const RELEVANCE_THRESHOLD = 40;

export function splitByRelevance(
  trends: Trend[],
  prefs: UserPreferences | null
): { forYou: Trend[]; more: Trend[] } {
  if (!prefs) return { forYou: [], more: trends };

  const scored = trends.map((t) => ({ trend: t, rel: scoreTrend(t, prefs) }));
  scored.sort((a, b) => b.rel - a.rel || b.trend.score - a.trend.score);

  const forYou = scored.filter((s) => s.rel >= RELEVANCE_THRESHOLD).map((s) => s.trend);
  const more = scored.filter((s) => s.rel < RELEVANCE_THRESHOLD).map((s) => s.trend);

  return { forYou, more };
}

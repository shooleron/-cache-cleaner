export type ArticleCategory = 'health' | 'sports' | 'nutrition' | 'body' | string;

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string; // ISO date string
  isNew?: boolean;
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: ArticleCategory;
  impactScore: number; // 1-10
  readTime: string; // e.g., "5 דק' קריאה"
  author: string;
  source: string;
  publishedAt: string; // ISO date string
  lastUpdated: string; // ISO date string (for sorting in feed)
  physiologicalImpact: string[]; // systems affected, e.g., ["מערכת העצבים", "מערכת השריר-שלד"]
  timeline: TimelineEvent[];
  isBookmarked?: boolean;
  scientificConfidence: number; // 1-10
  clinicalStage: 'מחקר תיאורטי' | 'ניסויים בבעלי חיים' | 'ניסויים קליניים (בני אדם)' | 'אישור FDA / זמין בשוק';
  imageUrl?: string;
  status?: 'published' | 'pending' | 'rejected';
}

export interface SectionCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  articleCount?: number;
}

export interface AdminUser {
  username: string;
  role: 'admin' | 'editor';
  isAuthenticated: boolean;
}

export interface UserProfile {
  name: string;
  interests: string[];
  frequency: 'daily' | 'weekly';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'en' | 'he';

const translations = {
  en: {
    feed: 'Feed',
    markets: 'Markets',
    refresh: 'Refresh',
    loading: 'Loading...',
    aiAnalyze: 'AI Analyze',
    analyzing: 'Analyzing...',
    personalize: '✨ Personalize',
    updated: 'Updated',
    allSources: 'All Sources',
    allTrends: 'All Trends',
    topTrends: 'Top Trends',
    moreTrends: 'More Trends',
    forYou: 'For You',
    lessRelevant: 'Less Relevant to You',
    noTrends: 'No trends match this filter',
    clearFilters: 'Clear filters',
    rising: '↑ Rising',
    cooling: '↓ Cooling',
    stable: '→ Stable',
    categories: {
      all: 'All Trends',
      tech: 'Tech',
      ai: 'AI',
      marketing: 'Marketing',
      business: 'Business',
      science: 'Science',
      design: 'Design',
      crypto: 'Crypto',
      culture: 'Culture',
    },
    catLabels: {
      all: 'All',
      tech: '💻 Tech',
      ai: '🤖 AI',
      marketing: '📣 Marketing',
      business: '💼 Business',
      culture: '🌍 Culture',
      science: '🔬 Science',
      design: '🎨 Design',
      crypto: '₿ Crypto',
    },
  },
  he: {
    feed: 'פיד',
    markets: 'שווקים',
    refresh: 'רענן',
    loading: 'טוען...',
    aiAnalyze: 'ניתוח AI',
    analyzing: 'מנתח...',
    personalize: '✨ התאמה אישית',
    updated: 'עודכן',
    allSources: 'כל המקורות',
    allTrends: 'כל הטרנדים',
    topTrends: 'טרנדים מובילים',
    moreTrends: 'עוד טרנדים',
    forYou: 'בשבילך',
    lessRelevant: 'פחות רלוונטי עבורך',
    noTrends: 'אין טרנדים לפי הסינון',
    clearFilters: 'נקה סינון',
    rising: '↑ עולה',
    cooling: '↓ יורד',
    stable: '→ יציב',
    categories: {
      all: 'כל הטרנדים',
      tech: 'טק',
      ai: 'בינה מלאכותית',
      marketing: 'שיווק',
      business: 'עסקים',
      science: 'מדע',
      design: 'עיצוב',
      crypto: 'קריפטו',
      culture: 'תרבות',
    },
    catLabels: {
      all: 'הכל',
      tech: '💻 טק',
      ai: '🤖 AI',
      marketing: '📣 שיווק',
      business: '💼 עסקים',
      culture: '🌍 תרבות',
      science: '🔬 מדע',
      design: '🎨 עיצוב',
      crypto: '₿ קריפטו',
    },
  },
} as const;

type T = typeof translations.en;

interface LangCtx {
  lang: Lang;
  t: T;
  toggle: () => void;
}

const LangContext = createContext<LangCtx>({
  lang: 'en',
  t: translations.en,
  toggle: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('tp-lang') as Lang | null;
    if (saved === 'he' || saved === 'en') setLang(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    localStorage.setItem('tp-lang', lang);
  }, [lang]);

  const toggle = () => setLang((l) => (l === 'en' ? 'he' : 'en'));

  return (
    <LangContext.Provider value={{ lang, t: translations[lang], toggle }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}

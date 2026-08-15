import type { ArticleCategory } from '@/app/types';

export const CATEGORY_META: Record<ArticleCategory, {
  label: string;
  shortLabel: string;
  badge: string;
  dot: string;
  border: string;
  surface: string;
}> = {
  body: {
    label: 'גוף האדם ואריכות ימים',
    shortLabel: 'גוף האדם',
    badge: 'bg-indigo-600 text-white',
    dot: 'bg-indigo-500',
    border: 'border-r-indigo-500',
    surface: 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  },
  health: {
    label: 'בריאות, נפש וטכנולוגיה',
    shortLabel: 'בריאות וטכנולוגיה',
    badge: 'bg-teal-600 text-white',
    dot: 'bg-teal-500',
    border: 'border-r-teal-500',
    surface: 'bg-teal-50 text-teal-800 ring-teal-200',
  },
  sports: {
    label: 'כושר וביצועים',
    shortLabel: 'כושר וספורט',
    badge: 'bg-emerald-600 text-white',
    dot: 'bg-emerald-500',
    border: 'border-r-emerald-500',
    surface: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  },
  nutrition: {
    label: 'תזונה ומטבוליזם',
    shortLabel: 'תזונה',
    badge: 'bg-amber-500 text-slate-950',
    dot: 'bg-amber-500',
    border: 'border-r-amber-500',
    surface: 'bg-amber-50 text-amber-900 ring-amber-200',
  },
};

export function getCategoryMeta(category: string) {
  return CATEGORY_META[category as ArticleCategory] ?? {
    label: category,
    shortLabel: category,
    badge: 'bg-slate-600 text-white',
    dot: 'bg-slate-400',
    border: 'border-r-slate-400',
    surface: 'bg-slate-100 text-slate-700 ring-slate-200',
  };
}

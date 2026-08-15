'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Eye, Flame } from 'lucide-react';
import type { Article } from '../types';

type RankedItem = { article: Article; views: number };

export default function MostViewedSidebar({ articles, onSelectArticle }: { articles: Article[]; onSelectArticle: (id: string) => void }) {
  const [ranked, setRanked] = useState<RankedItem[]>([]);

  useEffect(() => {
    let active = true;
    fetch('/api/analytics/most-viewed', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : { items: [] })
      .then((data: { items?: Array<{ slug: string; views: number }> }) => {
        if (!active) return;
        const byId = new Map(articles.map((article) => [article.id, article]));
        setRanked((data.items ?? []).flatMap((item) => {
          const article = byId.get(item.slug);
          return article ? [{ article, views: item.views }] : [];
        }));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [articles]);

  const visible = ranked.length ? ranked : articles.slice(0, 6).map((article) => ({ article, views: 0 }));

  return <aside className="h-fit border-t-4 border-slate-950 bg-white lg:sticky lg:top-36" aria-label="הכתבות הנצפות ביותר">
    <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5">
      <div><div className="flex items-center gap-2 text-[10px] font-black tracking-[.16em] text-rose-600"><Flame size={14} fill="currentColor" />TRENDING</div><h2 className="mt-1 text-xl font-black">הכי נצפות</h2></div>
      <span className="text-[10px] font-bold text-slate-400">30 ימים</span>
    </div>
    <div className="divide-y divide-slate-100">
      {visible.map(({ article, views }, index) => <button key={article.id} onClick={() => onSelectArticle(article.id)} className="group grid w-full grid-cols-[38px_1fr] gap-3 px-4 py-5 text-right transition hover:bg-slate-50">
        <span className={`text-3xl font-black leading-none ${index < 3 ? 'text-rose-500' : 'text-slate-200'}`}>{index + 1}</span>
        <span>
          <strong className="block text-[14px] leading-5 text-slate-900 transition group-hover:text-teal-700">{article.title}</strong>
          <span className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">{views > 0 ? <><Eye size={12} />{views.toLocaleString('he-IL')} צפיות</> : <>חדש במדור</>}</span>
        </span>
      </button>)}
    </div>
    <div className="flex items-center justify-center gap-2 border-t border-slate-200 p-4 text-xs font-black text-slate-600">הדירוג מתעדכן אוטומטית <ArrowLeft size={14} /></div>
  </aside>;
}

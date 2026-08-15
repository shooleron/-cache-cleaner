'use client';

import { ArrowLeft, Clock } from 'lucide-react';
import type { Article, ArticleCategory } from '../types';

const sections: Array<{ id: ArticleCategory; title: string; eyebrow: string; description: string; accent: string; soft: string }> = [
  { id: 'body', title: 'גוף האדם ואריכות ימים', eyebrow: 'BODY', description: 'מחקרים, התאוששות, שינה והמדע של חיים ארוכים ובריאים יותר.', accent: 'bg-indigo-600', soft: 'bg-indigo-50 text-indigo-700' },
  { id: 'health', title: 'בריאות, נפש וטכנולוגיה', eyebrow: 'MIND × TECH', description: 'בריאות דיגיטלית, מוח, מדדים חכמים ורפואה מונעת.', accent: 'bg-teal-600', soft: 'bg-teal-50 text-teal-700' },
  { id: 'sports', title: 'כושר וביצועים', eyebrow: 'PERFORMANCE', description: 'אימון, פיזיולוגיה וטכנולוגיות שמקדמות ביצועים והתאוששות.', accent: 'bg-emerald-600', soft: 'bg-emerald-50 text-emerald-700' },
  { id: 'nutrition', title: 'תזונה ומטבוליזם', eyebrow: 'NUTRITION', description: 'תזונה מבוססת ראיות, גלוקוז, תוספים ובריאות מטבולית.', accent: 'bg-amber-500', soft: 'bg-amber-50 text-amber-700' },
];

export default function HomeCategorySections({ articles, onSelectArticle, onSelectCategory }: {
  articles: Article[];
  onSelectArticle: (id: string) => void;
  onSelectCategory: (category: ArticleCategory) => void;
}) {
  return <div className="space-y-16">
    {sections.map((section) => {
      const categoryArticles = articles.filter((article) => article.category === section.id).slice(0, 4);
      if (!categoryArticles.length) return null;
      const [lead, ...secondary] = categoryArticles;

      return <section key={section.id} aria-labelledby={`section-${section.id}`}>
        <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 ${section.accent}`} /><span className="text-[10px] font-black tracking-[.2em] text-slate-400">{section.eyebrow}</span></div>
            <h2 id={`section-${section.id}`} className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">{section.title}</h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">{section.description}</p>
          </div>
          <button onClick={() => onSelectCategory(section.id)} className="flex items-center gap-2 text-sm font-black text-slate-700 transition hover:text-slate-950">כל הכתבות במדור <ArrowLeft size={16} /></button>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1.35fr_.85fr]">
          <button onClick={() => onSelectArticle(lead.id)} className="group relative min-h-[390px] overflow-hidden bg-slate-900 text-right text-white">
            {lead.imageUrl && <img src={lead.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-700 group-hover:scale-105 group-hover:opacity-65" />}
            <span className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/35 to-transparent" />
            <span className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <span className={`inline-block px-3 py-1 text-[10px] font-black text-white ${section.accent}`}>כתבה מובילה</span>
              <strong className="mt-4 block text-2xl leading-tight sm:text-3xl">{lead.title}</strong>
              <span className="mt-3 block max-w-2xl text-sm leading-6 text-white/75 line-clamp-2">{lead.summary}</span>
              <span className="mt-5 flex items-center gap-2 text-xs font-bold text-white/70"><Clock size={13} />{lead.readTime} · {lead.source}</span>
            </span>
          </button>

          <div className="grid gap-3">
            {secondary.map((article) => <button key={article.id} onClick={() => onSelectArticle(article.id)} className="group grid grid-cols-[112px_1fr] overflow-hidden border border-slate-200 bg-white text-right transition hover:border-slate-300 hover:shadow-md sm:grid-cols-[150px_1fr]">
              <div className="h-full min-h-[118px] overflow-hidden bg-slate-100">{article.imageUrl && <img src={article.imageUrl} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}</div>
              <div className="flex flex-col justify-between p-4">
                <div><span className={`inline-block px-2 py-1 text-[9px] font-black ${section.soft}`}>{section.title}</span><h3 className="mt-2 text-[15px] font-black leading-5 text-slate-900 group-hover:text-teal-700">{article.title}</h3></div>
                <span className="mt-3 text-[10px] font-bold text-slate-400">{article.source} · {article.readTime}</span>
              </div>
            </button>)}
          </div>
        </div>
      </section>;
    })}
  </div>;
}

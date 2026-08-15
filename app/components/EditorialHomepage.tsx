'use client';

import { ArrowLeft, ArrowUpLeft, CalendarDays, CheckCircle2, Clock3, Eye, TrendingUp } from 'lucide-react';
import type { Article } from '../types';
import { getCategoryMeta } from '@/lib/categories';

function compactTitle(title: string, length = 74) {
  return title.length > length ? `${title.slice(0, length).trim()}…` : title;
}

export default function EditorialHomepage({
  hero,
  articles,
  onSelectArticle,
}: {
  hero: Article;
  articles: Article[];
  onSelectArticle: (id: string) => void;
}) {
  const ranked = [hero, ...articles.filter((article) => article.id !== hero.id)].slice(0, 5);
  const feature = articles.find((article) => article.category === 'nutrition') ?? articles[0];
  const related = articles.filter((article) => article.id !== feature?.id && article.id !== hero.id).slice(0, 3);
  const heroMeta = getCategoryMeta(hero.category);
  const heroImage = hero.id === 'zone-2-cardio-longevity'
    ? '/images/articles/zone-2-cardio-longevity-cover.jpg'
    : hero.imageUrl;
  const heroTitle = hero.id === 'zone-2-cardio-longevity'
    ? 'איך ניטור סוכר ואימוני Zone 2 יכולים לשנות את הבריאות המטבולית'
    : hero.title;

  return (
    <div className="mx-auto w-full max-w-[1380px] px-5 pb-20 pt-8 md:px-10 lg:pt-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_270px] lg:items-start">
        <div className="min-w-0">
          <button
            onClick={() => onSelectArticle(hero.id)}
            className="group grid w-full overflow-hidden bg-[#081924] text-right text-white lg:min-h-[550px] lg:grid-cols-[.92fr_1.08fr]"
          >
            <div className="relative min-h-[320px] overflow-hidden bg-slate-900 lg:order-2 lg:min-h-full">
              <img src={heroImage} alt={hero.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
              <span className="absolute inset-0 bg-gradient-to-t from-[#081924]/70 via-transparent to-transparent lg:bg-gradient-to-l lg:from-[#081924]/15 lg:to-transparent" />
              <span className="absolute bottom-5 right-5 bg-white px-3 py-1.5 text-[10px] font-black text-slate-950">כתבת השער</span>
            </div>

            <span className="flex flex-col justify-between p-7 sm:p-9 lg:order-1 lg:p-10">
              <span>
                <span className="flex items-center gap-2 text-[11px] font-black tracking-[.12em] text-[#b9f227]">
                  PULSETECH PICKS <span className="h-px w-8 bg-[#b9f227]/60" />
                </span>
                <span className="mt-5 flex items-center gap-3 text-xs text-white/50">
                  <span>{heroMeta.label}</span><span>·</span><span>{new Date(hero.publishedAt).toLocaleDateString('he-IL')}</span>
                </span>
                <h1 className="mt-5 text-[30px] font-black leading-[1.1] tracking-[-.035em] sm:text-[37px] lg:text-[40px] xl:text-[44px]">
                  {heroTitle}
                </h1>
                <span className="mt-5 block max-w-xl text-[14px] leading-7 text-white/67 line-clamp-2">{hero.summary}</span>
              </span>

              <span className="mt-7 border-t border-white/18 pt-5">
                <span className="flex items-center justify-between gap-5">
                  <span className="flex items-center gap-3 text-right">
                    <span className="grid h-11 w-11 place-items-center border border-[#b9f227]/45 text-[#b9f227]"><CheckCircle2 size={22} /></span>
                    <span><strong className="block text-sm text-[#b9f227]">מבוסס מחקר</strong><small className="mt-1 block text-[11px] text-white/45">{hero.scientificConfidence}/10 רמת ביסוס מדעי</small></span>
                  </span>
                  <span className="inline-flex items-center gap-2 bg-[#b9f227] px-5 py-3.5 text-sm font-black text-[#081924] transition group-hover:bg-white">קראו את הכתבה <ArrowLeft size={17} /></span>
                </span>
              </span>
            </span>
          </button>

          {feature && (
            <section className="mt-10 border-y border-slate-200 py-8">
              <button onClick={() => onSelectArticle(feature.id)} className="group grid w-full gap-6 text-right sm:grid-cols-[minmax(0,1.3fr)_minmax(270px,.7fr)] sm:items-stretch">
                <div className="min-h-[230px] overflow-hidden bg-slate-100">
                  <img src={feature.imageUrl} alt={feature.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
                </div>
                <div className="flex flex-col justify-center border-r-2 border-[#b9f227] pr-6">
                  <span className="text-xs font-black text-cyan-600">{getCategoryMeta(feature.category).label}</span>
                  <h2 className="mt-3 text-3xl font-black leading-tight text-[#081924]">{compactTitle(feature.title, 86)}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-500 line-clamp-3">{feature.summary}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-cyan-700">קראו עוד <ArrowLeft size={16} /></span>
                </div>
              </button>
            </section>
          )}

          <section className="mt-10" aria-labelledby="more-topic-heading">
            <div className="flex items-end justify-between gap-5 border-b border-slate-200 pb-4">
              <div><span className="text-[10px] font-black tracking-[.16em] text-slate-400">LATEST STORIES</span><h2 id="more-topic-heading" className="mt-1 text-2xl font-black text-[#081924]">עוד כתבות שכדאי להכיר</h2></div>
              <ArrowUpLeft size={21} className="text-slate-400" />
            </div>
            <div className="divide-y divide-slate-200">
              {related.map((article) => (
                <button key={article.id} onClick={() => onSelectArticle(article.id)} className="group grid w-full grid-cols-[92px_1fr] gap-5 py-5 text-right sm:grid-cols-[120px_1fr]">
                  <img src={article.imageUrl} alt="" className="aspect-square w-full object-cover" />
                  <span className="self-center"><small className="font-black text-cyan-600">{getCategoryMeta(article.category).shortLabel}</small><strong className="mt-1 block text-lg leading-6 text-[#081924] group-hover:text-cyan-700">{article.title}</strong><span className="mt-2 flex items-center gap-4 text-[11px] text-slate-400"><span className="flex items-center gap-1"><Clock3 size={12} />{article.readTime}</span><span className="flex items-center gap-1"><CalendarDays size={12} />{new Date(article.publishedAt).toLocaleDateString('he-IL')}</span></span></span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="border-t-4 border-[#081924] lg:sticky lg:top-36" aria-label="הכי נקראים">
          <div className="flex items-center justify-between border-b border-slate-200 py-5">
            <div><span className="flex items-center gap-2 text-[10px] font-black tracking-[.16em] text-cyan-600"><TrendingUp size={14} />TRENDING</span><h2 className="mt-1 text-2xl font-black text-[#081924]">הכי נקראים</h2></div>
            <span className="text-[10px] font-bold text-slate-400">30 ימים</span>
          </div>
          <div className="divide-y divide-slate-200">
            {ranked.map((article, index) => (
              <button key={article.id} onClick={() => onSelectArticle(article.id)} className="group grid w-full grid-cols-[32px_1fr] gap-4 py-6 text-right">
                <span className="text-3xl font-light leading-none text-[#b9f227]">{index + 1}</span>
                <span><strong className="block text-[14px] leading-6 text-[#081924] group-hover:text-cyan-700">{compactTitle(article.title, 84)}</strong><small className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-slate-400"><Eye size={12} />הכתבות המובילות השבוע</small></span>
              </button>
            ))}
          </div>
          <button className="mt-3 flex items-center gap-2 py-4 text-sm font-black text-[#081924]">כל הכתבות הנקראות <ArrowLeft size={16} /></button>
        </aside>
      </div>
    </div>
  );
}

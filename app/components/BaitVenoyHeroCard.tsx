'use client';
import { Article, ArticleCategory } from '../types';
import { Calendar, User, Clock, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  article: Article;
  onSelect: () => void;
}

const CATEGORY_NAMES: Record<ArticleCategory, string> = {
  health: 'בריאות דיגיטלית',
  sports: 'טכנולוגיית ספורט',
  nutrition: 'תזונה ומטבוליזם',
  body: 'גוף האדם ואריכות ימים',
};

const CATEGORY_COLORS: Record<ArticleCategory, string> = {
  health: 'bg-teal-600',
  sports: 'bg-emerald-600',
  nutrition: 'bg-amber-600',
  body: 'bg-indigo-600',
};

export default function BaitVenoyHeroCard({ article, onSelect }: Props) {
  const catBg = CATEGORY_COLORS[article.category];
  const hasUpdates = article.timeline.length > 1;

  return (
    <div
      onClick={onSelect}
      className="group cursor-pointer animate-fade-up"
    >
      {/* Main Hero Container */}
      <div className="relative bg-white overflow-hidden card-hover-lift border border-slate-100 shadow-sm">
        <div className="flex flex-col items-center text-center">
          
          {/* Image Section — Centered full width */}
          <div className="w-full shrink-0 relative overflow-hidden bg-slate-100 h-[300px] lg:h-[420px]">
            <img
              src={article.imageUrl || 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80'}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[800ms] ease-out"
            />
            <div className="absolute inset-0 hero-image-overlay" />
            
            {/* Featured badge */}
            <div className="absolute top-5 right-5 flex items-center gap-2">
              <span className="bg-white/95 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-3.5 py-1.5 uppercase tracking-[0.08em] shadow-md">
                כתבת השער
              </span>
            </div>

            {/* Mobile overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
          </div>

          {/* Content Section — Centered text & elements */}
          <div className="w-full p-8 lg:p-12 flex flex-col items-center justify-between space-y-6 text-center">
            <div className="space-y-5 w-full flex flex-col items-center">
              {/* Category Tag — Centered */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <span className={`px-3.5 py-1.5 text-[10px] font-bold text-white uppercase tracking-[0.06em] ${catBg}`}>
                  {CATEGORY_NAMES[article.category]}
                </span>
                
                {hasUpdates && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                    <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '6s' }} />
                    <span>עודכן בזמן אמת</span>
                  </span>
                )}
              </div>

              {/* Title — Centered */}
              <h2 className="text-[26px] lg:text-[32px] font-extrabold text-slate-900 leading-[1.25] group-hover:text-blue-700 transition-colors duration-300 text-center max-w-3xl">
                {article.title}
              </h2>

              {/* Excerpt — Centered */}
              <p className="text-slate-500 text-[14px] lg:text-[15px] leading-[1.8] line-clamp-4 text-center max-w-2xl mx-auto">
                {article.summary}
              </p>
            </div>

            {/* Footer: Author, Date, CTA — Centered */}
            <div className="pt-6 border-t border-slate-100 w-full flex flex-wrap items-center justify-center gap-5">
              <div className="flex flex-wrap items-center justify-center gap-5 text-[12px] text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <User size={13} className="text-slate-400" />
                  {article.author}
                </span>
                <span className="w-px h-3.5 bg-slate-200" />
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} />
                  {new Date(article.publishedAt).toLocaleDateString('he-IL')}
                </span>
                <span className="w-px h-3.5 bg-slate-200" />
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  {article.readTime}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-blue-600 text-[12px] font-bold group-hover:gap-3 transition-all duration-300">
                <span>המשך לקרוא</span>
                <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-1" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

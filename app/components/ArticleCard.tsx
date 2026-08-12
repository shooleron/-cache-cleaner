'use client';
import { Article, ArticleCategory } from '../types';
import { Bookmark, Calendar, User, Clock, RefreshCw, Star, Activity, Trash2, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  article: Article;
  onSelect: () => void;
  onToggleBookmark: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  highlightedId: string | null;
  matchScore?: number;
}

const CATEGORY_NAMES: Record<ArticleCategory, string> = {
  health: 'בריאות דיגיטלית',
  sports: 'טכנולוגיית ספורט',
  nutrition: 'תזונה ומטבוליזם',
  body: 'גוף האדם ואריכות ימים',
};

const CATEGORY_COLORS: Record<ArticleCategory, { bg: string; text: string; accent: string; tag: string }> = {
  health: {
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    accent: 'feed-card-accent-health',
    tag: 'bg-teal-600 text-white',
  },
  sports: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    accent: 'feed-card-accent-sports',
    tag: 'bg-emerald-600 text-white',
  },
  nutrition: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    accent: 'feed-card-accent-nutrition',
    tag: 'bg-amber-600 text-white',
  },
  body: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    accent: 'feed-card-accent-body',
    tag: 'bg-indigo-600 text-white',
  },
};

export default function ArticleCard({
  article,
  onSelect,
  onToggleBookmark,
  onDelete,
  highlightedId,
  matchScore,
}: Props) {
  const catStyle = CATEGORY_COLORS[article.category];
  const isHighlighted = highlightedId === article.id;
  const [relativeTime, setRelativeTime] = useState<string>('');

  useEffect(() => {
    const getRelativeTimeString = () => {
      const now = new Date();
      const updated = new Date(article.lastUpdated);
      const diffMs = now.getTime() - updated.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'עכשיו';
      if (diffMins < 60) return `לפני ${diffMins} דק'`;
      if (diffHours < 24) return `לפני ${diffHours} שעות`;
      return `לפני ${diffDays} ימים`;
    };

    setRelativeTime(getRelativeTimeString());
    const interval = setInterval(() => {
      setRelativeTime(getRelativeTimeString());
    }, 30000);

    return () => clearInterval(interval);
  }, [article.lastUpdated]);

  const hasUpdates = article.timeline.length > 1;
  const latestEvent = article.timeline[article.timeline.length - 1];

  return (
    <article
      onClick={onSelect}
      className={`group bg-white rounded-none transition-all duration-300 cursor-pointer flex flex-col md:flex-row items-stretch overflow-hidden card-hover-lift feed-card-enter ${
        catStyle.accent
      } ${
        isHighlighted 
          ? 'animate-highlight ring-2 ring-blue-400/50 shadow-lg' 
          : 'border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]'
      }`}
      dir="rtl"
    >
      {/* Image Column — 300x250 locked */}
      {article.imageUrl && (
        <div className="w-full md:w-[300px] md:min-w-[300px] h-[250px] shrink-0 relative overflow-hidden bg-slate-50 border-b md:border-b-0 md:border-l border-slate-100">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-600 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent md:hidden" />
        </div>
      )}

      {/* Content Column */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
        <div>
          {/* Meta Bar — Category + Badges + Actions */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em] rounded-none ${catStyle.tag}`}>
                {CATEGORY_NAMES[article.category]}
              </span>
              
              {hasUpdates && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 rounded-none">
                  <RefreshCw size={10} className="animate-spin" style={{ animationDuration: '6s' }} />
                  <span>עודכן</span>
                </span>
              )}

              {matchScore !== undefined && matchScore > 50 && (
                <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold bg-rose-50 text-rose-600 border border-rose-100 rounded-none">
                  <Star size={10} className="fill-current" />
                  <span>{matchScore}%</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={onToggleBookmark}
                title={article.isBookmarked ? 'הסר מסימניות' : 'שמור'}
                className={`w-8 h-8 rounded-none flex items-center justify-center transition-all ${
                  article.isBookmarked
                    ? 'bg-amber-50 text-amber-600'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
              >
                <Bookmark size={14} className={article.isBookmarked ? 'fill-current' : ''} />
              </button>

              {onDelete && (
                <button
                  onClick={onDelete}
                  title="מחק"
                  className="w-8 h-8 rounded-none flex items-center justify-center transition-all bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-[18px] md:text-[20px] font-bold text-slate-900 leading-[1.35] group-hover:text-blue-700 transition-colors duration-300 mb-3">
            {article.title}
          </h3>

          {/* Summary */}
          <p className="text-slate-500 text-[13px] leading-[1.8] mb-5 line-clamp-3">
            {article.summary}
          </p>

          {/* Live Update Indicator */}
          {hasUpdates && (
            <div className="bg-slate-50 border-r-[3px] border-r-blue-500 border border-slate-100 rounded-none p-3.5 mb-5 flex items-start gap-3">
              <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-none flex items-center justify-center shrink-0 mt-0.5">
                <Activity size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-bold text-blue-700">עדכון אחרון</span>
                  <span className="text-[10px] text-slate-400">({relativeTime})</span>
                </div>
                <h4 className="text-slate-700 text-[12px] font-semibold truncate">
                  {latestEvent.title}
                </h4>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <User size={12} className="text-slate-300" />
              <span>{article.source}</span>
            </span>
            <span className="w-px h-3 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <Clock size={12} className="text-slate-300" />
              <span>{article.readTime}</span>
            </span>
            <span className="w-px h-3 bg-slate-200" />
            <span className="flex items-center gap-1.5">
              <Calendar size={12} className="text-slate-300" />
              <span>{relativeTime}</span>
            </span>
          </div>

          {/* Impact Score */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-medium">השפעה</span>
            <span className={`w-6 h-6 rounded-none flex items-center justify-center text-[11px] font-bold text-white ${
              article.impactScore >= 9
                ? 'bg-rose-500'
                : article.impactScore >= 8
                ? 'bg-amber-500'
                : 'bg-blue-500'
            }`}>
              {article.impactScore}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

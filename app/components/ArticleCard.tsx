'use client';
import { Article, ArticleCategory } from '../types';
import { Bookmark, Trash2, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  article: Article;
  onSelect: () => void;
  onToggleBookmark: (e: React.MouseEvent) => void;
  onDelete?: (e: React.MouseEvent) => void;
  highlightedId?: string | null;
  matchScore?: number;
}

const CATEGORY_NAMES: Record<ArticleCategory, string> = {
  health: 'בריאות דיגיטלית',
  sports: 'כושר וספורט',
  nutrition: 'תזונה',
  body: 'אריכות ימים',
};

const CATEGORY_TAG_STYLES: Record<ArticleCategory, string> = {
  health: 'bg-[#1F5C52] text-[#FAFAF7]',
  sports: 'bg-[#14171C] text-[#FAFAF7]',
  nutrition: 'bg-[#EF4423] text-[#FAFAF7]',
  body: 'bg-[#14171C] text-[#7FD8A4]',
};

export default function ArticleCard({
  article,
  onSelect,
  onToggleBookmark,
  onDelete,
  highlightedId,
  matchScore,
}: Props) {
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

  return (
    <article
      onClick={onSelect}
      className={`group bg-[#FAFAF7] transition-all duration-200 cursor-pointer border border-[#DEDAD1] hover:bg-[#F0EEE9] flex flex-col md:flex-row items-stretch overflow-hidden select-none ${
        isHighlighted ? 'ring-2 ring-[#EF4423]' : ''
      }`}
      dir="rtl"
    >
      {/* Article Side Image — 300x250 locked */}
      {article.imageUrl && (
        <div className="w-full md:w-[300px] md:min-w-[300px] h-[220px] md:h-[250px] shrink-0 relative overflow-hidden bg-[#F0EEE9] border-b md:border-b-0 md:border-l border-[#DEDAD1]">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          />
        </div>
      )}

      {/* Article Content Column */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between text-right">
        <div>
          {/* Tag & Actions Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className={`inline-block font-mono text-[11px] px-2.5 py-1 uppercase tracking-wider ${CATEGORY_TAG_STYLES[article.category]}`}>
                {CATEGORY_NAMES[article.category]}
              </span>

              {hasUpdates && (
                <span className="font-mono text-[10px] bg-[#14171C] text-[#7FD8A4] px-2 py-0.5 border border-[#333]">
                  עודכן
                </span>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(e);
                }}
                title={article.isBookmarked ? 'הסר מסימניות' : 'שמור'}
                className={`w-7 h-7 flex items-center justify-center transition-colors border border-[#DEDAD1] ${
                  article.isBookmarked
                    ? 'bg-[#EF4423] text-white border-[#EF4423]'
                    : 'bg-[#FAFAF7] text-[#14171C] hover:bg-[#14171C] hover:text-[#FAFAF7]'
                }`}
              >
                <Bookmark size={13} className={article.isBookmarked ? 'fill-current' : ''} />
              </button>

              {onDelete && (
                <button
                  onClick={onDelete}
                  title="מחק"
                  className="w-7 h-7 flex items-center justify-center bg-[#FAFAF7] text-[#84807A] hover:bg-[#EF4423] hover:text-white border border-[#DEDAD1] transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-[#14171C] leading-[1.35] mb-3 group-hover:text-[#EF4423] transition-colors">
            {article.title}
          </h3>

          {/* Excerpt */}
          <p className="text-[#555] text-sm leading-[1.6] mb-4 line-clamp-3">
            {article.summary}
          </p>
        </div>

        {/* Card Footer (IBM Plex Mono style from vital-index.html) */}
        <div className="pt-4 border-t border-[#DEDAD1] flex items-center justify-between text-xs text-[#84807A] font-mono">
          <div className="flex items-center gap-3">
            <span>{article.author}</span>
            <span>·</span>
            <span>{article.readTime}</span>
            <span>·</span>
            <span>{relativeTime}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px]">השפעה</span>
            <span className="font-bold text-[#14171C] bg-[#F0EEE9] px-2 py-0.5 border border-[#DEDAD1]">
              {article.impactScore}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

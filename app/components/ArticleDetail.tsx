'use client';
import { Article } from '../types';
import {
  X,
  TrendingUp,
  Activity,
  Layers,
  Calendar,
  Globe,
  Beaker,
  Bookmark,
  User,
} from 'lucide-react';
import PulseAIChat from './PulseAIChat';

interface Props {
  article: Article;
  onClose: () => void;
  onToggleBookmark: () => void;
}

export default function ArticleDetail({ article, onClose, onToggleBookmark }: Props) {
  const sortedTimeline = [...article.timeline].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#14171C]/75 backdrop-blur-sm flex items-center justify-center p-3 md:p-8 animate-fade-up" dir="rtl">
      <div className="max-w-[1200px] w-full h-[90vh] bg-[#FAFAF7] border border-[#DEDAD1] shadow-2xl flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* Article Reader Main Column */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:border-l border-[#DEDAD1] flex flex-col justify-between bg-[#FAFAF7]">
          <div className="max-w-[760px] w-full mx-auto">
            
            {/* Top Modal Header */}
            <div className="flex items-center justify-between mb-8 border-b border-[#DEDAD1] pb-4">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#EF4423] text-white text-xs font-mono font-bold hover:bg-[#14171C] transition-colors border border-[#EF4423]"
              >
                <X size={16} />
                <span>סגור כתבה</span>
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleBookmark}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-semibold transition-colors border ${
                    article.isBookmarked
                      ? 'bg-[#EF4423] text-white border-[#EF4423]'
                      : 'bg-[#14171C] text-[#FAFAF7] border-[#14171C] hover:bg-[#EF4423]'
                  }`}
                >
                  <Bookmark size={14} className={article.isBookmarked ? 'fill-current' : ''} />
                  <span>{article.isBookmarked ? 'שמור במועדפים' : 'שמור לקריאה'}</span>
                </button>
              </div>
            </div>

            {/* Banner Image */}
            {article.imageUrl && (
              <div className="w-full h-64 md:h-80 overflow-hidden mb-8 border border-[#DEDAD1] bg-[#F0EEE9]">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Category & Stage */}
            <div className="flex flex-wrap items-center gap-3 mb-4 font-mono text-xs">
              <span className="px-3 py-1 bg-[#14171C] text-[#FAFAF7] font-bold">
                {article.category === 'health'
                  ? 'בריאות דיגיטלית'
                  : article.category === 'sports'
                  ? 'כושר וספורט'
                  : article.category === 'nutrition'
                  ? 'תזונה ומטבוליזם'
                  : 'אריכות ימים'}
              </span>
              <span className="px-3 py-1 bg-[#F0EEE9] text-[#14171C] border border-[#DEDAD1]">
                שלב קליני: {article.clinicalStage}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black text-[#14171C] leading-[1.15] mb-6">
              {article.title}
            </h1>

            {/* Meta Bar */}
            <div className="flex flex-wrap items-center gap-5 text-xs text-[#84807A] font-mono mb-8 pb-4 border-b border-[#DEDAD1]">
              <span className="flex items-center gap-1.5 font-medium text-[#14171C]">
                <User size={14} />
                <span>מאת {article.author}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Globe size={14} />
                <span>מקור: {article.source}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span>פורסם ב: {new Date(article.publishedAt).toLocaleDateString('he-IL')}</span>
              </span>
            </div>

            {/* Summary Callout (TL;DR) */}
            <div className="bg-[#F0EEE9] border-r-4 border-r-[#EF4423] border border-[#DEDAD1] p-6 mb-8">
              <h4 className="text-xs font-mono font-bold text-[#EF4423] uppercase tracking-wider mb-2">
                תקציר מנהלים (TL;DR)
              </h4>
              <p className="text-[#14171C] text-base leading-relaxed font-medium">
                {article.summary}
              </p>
            </div>

            {/* Full Content */}
            <div className="text-[#14171C] text-base leading-[1.85] mb-10 space-y-5">
              {article.content.split(/\n\n+/).map((block, index) => {
                const trimmed = block.trim();
                if (!trimmed) return null;
                if (trimmed.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-xl font-bold text-[#14171C] mt-8 mb-3 border-b border-[#DEDAD1] pb-2">
                      {trimmed.replace('### ', '')}
                    </h3>
                  );
                }
                if (trimmed.startsWith('- ')) {
                  return (
                    <ul key={index} className="list-disc pr-6 space-y-2 text-[#3a3a3a] my-4 font-mono text-sm">
                      {trimmed.split('\n').map((item, i) => (
                        <li key={i}>{item.replace(/^- /, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return (
                  <p key={index} className="text-[#3a3a3a] text-base leading-[1.85]">
                    {trimmed}
                  </p>
                );
              })}
            </div>

            {/* Scientific and Impact Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8 font-mono">
              <div className="bg-[#F0EEE9] p-5 border border-[#DEDAD1] flex items-center gap-4">
                <div className="w-10 h-10 bg-[#EF4423] text-white flex items-center justify-center shrink-0">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <span className="block text-[10px] text-[#84807A] uppercase">מדד השפעה (Impact)</span>
                  <span className="text-2xl font-bold text-[#14171C]">{article.impactScore}/10</span>
                </div>
              </div>
              
              <div className="bg-[#F0EEE9] p-5 border border-[#DEDAD1] flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1F5C52] text-white flex items-center justify-center shrink-0">
                  <Beaker size={20} />
                </div>
                <div>
                  <span className="block text-[10px] text-[#84807A] uppercase">ביסוס מדעי (Confidence)</span>
                  <span className="text-2xl font-bold text-[#14171C]">{article.scientificConfidence}/10</span>
                </div>
              </div>
            </div>

            {/* Physiological impact section */}
            <div className="mb-8">
              <h3 className="font-bold text-sm text-[#14171C] mb-3 flex items-center gap-2 font-mono">
                <Activity size={16} className="text-[#EF4423]" />
                <span>השפעה פיזיולוגית ואיברים מושפעים בגוף</span>
              </h3>
              <div className="flex flex-wrap gap-2 font-mono">
                {article.physiologicalImpact.map((system, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#14171C] text-[#FAFAF7]"
                  >
                    {system}
                  </span>
                ))}
              </div>
            </div>

            {/* Timeline of Developments Section — At bottom of content */}
            <div className="pt-8 border-t border-[#DEDAD1] mt-8 mb-6">
              <h3 className="font-bold text-base text-[#14171C] mb-5 flex items-center gap-2 font-mono">
                <Layers size={18} className="text-[#EF4423]" />
                <span>ציר זמן התפתחויות (מעקב פעיל)</span>
              </h3>
              
              <div className="bg-[#F0EEE9] border border-[#DEDAD1] p-6">
                <div className="relative pr-5 border-r-2 border-[#EF4423] space-y-6">
                  {sortedTimeline.map((event, idx) => (
                    <div key={event.id} className="relative">
                      <div className={`absolute -right-[27px] top-1 w-3.5 h-3.5 border-2 border-[#FAFAF7] ${
                        idx === 0 ? 'bg-[#EF4423]' : 'bg-[#84807A]'
                      }`} />
                      
                      <div className="flex items-center gap-2 mb-1 font-mono">
                        <span className="text-[11px] text-[#84807A]">
                          {new Date(event.timestamp).toLocaleDateString('he-IL')}
                        </span>
                        {idx === 0 && (
                          <span className="text-[10px] text-[#EF4423] font-bold bg-white px-2 py-0.5 border border-[#DEDAD1]">
                            עדכון אחרון
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-sm text-[#14171C] leading-tight">
                        {event.title}
                      </h4>
                      <p className="text-xs text-[#555] leading-relaxed mt-1">
                        {event.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* AI Assistant Sidebar (Left Column) */}
        <div className="w-full lg:w-[420px] bg-[#F0EEE9] flex flex-col h-full border-t lg:border-t-0 border-[#DEDAD1]">
          <div className="flex-1 flex flex-col overflow-hidden">
            <PulseAIChat article={article} />
          </div>
        </div>

      </div>
    </div>
  );
}

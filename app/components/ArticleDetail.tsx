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
  Share2,
} from 'lucide-react';
import PulseAIChat from './PulseAIChat';
import GlossaryLinkedText from './GlossaryLinkedText';
import RelatedArticles from './RelatedArticles';
import ArticleReaction from './ArticleReaction';
import ArticleComments from './ArticleComments';
import { getCategoryMeta } from '@/lib/categories';
import InlineCampaignBanner from './InlineCampaignBanner';

interface Props {
  article: Article;
  onClose: () => void;
  onToggleBookmark: () => void;
  relatedArticles?: Article[];
}

export default function ArticleDetail({ article, onClose, onToggleBookmark, relatedArticles = [] }: Props) {
  const categoryMeta = getCategoryMeta(article.category);
  const shareArticle = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: article.title, text: article.summary, url }).catch(() => undefined);
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  const sortedTimeline = [...article.timeline].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white rounded-none border border-slate-200 shadow-sm" dir="rtl">
      {/* Centered article content */}
      <div className="mx-auto w-full max-w-4xl px-5 py-6 md:px-8 lg:py-10">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 rounded-none text-slate-700 hover:bg-slate-200 transition-colors text-xs font-bold border border-slate-200"
            >
              <X size={14} />
              <span>סגור</span>
            </button>
            
            <div className="flex items-center gap-2">
              <button
                onClick={shareArticle}
                className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                title="שיתוף הכתבה"
              >
                <Share2 size={13} />
                <span>שיתוף</span>
              </button>
              <button
                onClick={onToggleBookmark}
                className={`flex items-center gap-2 px-4 py-2 rounded-none text-xs font-bold transition-all border ${
                  article.isBookmarked
                    ? 'bg-amber-50 text-amber-700 border-amber-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <Bookmark size={13} className={article.isBookmarked ? 'fill-current' : ''} />
                <span>{article.isBookmarked ? 'שמור במועדפים' : 'שמור לקריאה מאוחרת'}</span>
              </button>
            </div>
          </div>

          {/* Banner Image */}
          <InlineCampaignBanner placement="article_top" />
          {article.imageUrl && (
            <div className="relative w-full h-64 md:h-80 overflow-hidden mb-6 rounded-none border border-slate-200 bg-slate-100">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover rounded-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            </div>
          )}

          {/* Category & Stage */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-bold ring-1 ring-inset ${categoryMeta.surface}`}>
              <span className={`h-2 w-2 rounded-full ${categoryMeta.dot}`} />
              {categoryMeta.label}
            </span>
            <span className="px-3 py-1 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 rounded-none">
              שלב קליני: {article.clinicalStage}
            </span>
          </div>

          {/* Title */}
          <h2 className="mx-auto mb-4 max-w-3xl text-center text-2xl font-bold leading-tight text-slate-900 lg:text-3xl">
            {article.title}
          </h2>

          {/* Source and Authors */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-6 pb-4 border-b border-slate-200">
            <span className="flex items-center gap-1.5">
              <User size={14} />
              <span>נכתב על ידי: {article.author}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Globe size={14} />
              <span>מקור: {article.source}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>פורסם ב: {new Date(article.publishedAt).toLocaleDateString('he-IL')}</span>
            </span>
          </div>

          {/* Summary Callout */}
          <div className="bg-slate-50 border-r-4 border-r-blue-600 border border-slate-200 rounded-none p-5 mb-6">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">תקציר AI מהיר (TL;DR)</h4>
            <p className="text-slate-700 text-sm md:text-base leading-relaxed font-medium">
              {article.summary}
            </p>
          </div>

          {/* Full content */}
          <div className="text-slate-800 text-sm md:text-base leading-relaxed mb-8 space-y-4 font-normal">
            <GlossaryLinkedText text={article.content} />
          </div>

          {/* Scientific and Impact Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 rounded-none p-5 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <TrendingUp size={20} />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase">מדד השפעה (Impact)</span>
                <span className="text-xl font-bold text-slate-900">{article.impactScore}/10</span>
              </div>
            </div>
            
            <div className="bg-slate-50 rounded-none p-5 border border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-none bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Beaker size={20} />
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-bold uppercase">ביסוס מדעי (Confidence)</span>
                <span className="text-xl font-bold text-slate-900">{article.scientificConfidence}/10</span>
              </div>
            </div>
          </div>

          {/* Physiological impact section */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <Activity size={16} className="text-rose-600" />
              <span>השפעה פיזיולוגית ואיברים מושפעים בגוף</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {article.physiologicalImpact.map((system, idx) => (
                <span
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200"
                >
                  <span className="w-1.5 h-1.5 rounded-none bg-rose-500" />
                  {system}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-5 md:px-8">
        <InlineCampaignBanner placement="article_bottom" />
      </div>

      <ArticleReaction articleId={article.id} />

      {/* Timeline at the bottom of the article */}
      <section className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto w-full max-w-4xl px-5 py-8 md:px-8 lg:py-10">
          <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
            <Layers size={16} className="text-blue-600" />
            <span>ציר זמן התפתחויות (מעקב פעיל)</span>
          </h3>
          
          <div className="relative pr-4 border-r-2 border-slate-200 space-y-5 mr-2">
            {sortedTimeline.map((event, idx) => (
              <div key={event.id} className="relative">
                {/* Timeline dot (square) */}
                <div className={`absolute -right-[21px] top-1.5 w-3 h-3 rounded-none border-2 border-white ${
                  idx === 0 
                    ? 'bg-blue-600 ring-2 ring-blue-200 animate-signal' 
                    : 'bg-slate-400'
                }`} />
                
                {/* Date */}
                <span className="block text-[10px] font-bold text-slate-500 mb-0.5">
                  {new Date(event.timestamp).toLocaleDateString('he-IL')} 
                  {idx === 0 && <span className="mr-1.5 text-blue-700 font-bold bg-blue-50 px-1 border border-blue-200 rounded-none">חדש!</span>}
                </span>
                
                {/* Event details */}
                <h4 className="font-bold text-xs text-slate-900 leading-tight">
                  {event.title}
                </h4>
                <p className="text-[11px] text-slate-600 leading-normal mt-1">
                  {event.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <RelatedArticles articles={relatedArticles} />

      <ArticleComments articleId={article.id} />

      {/* PulseAIChat Component */}
      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex h-[520px] w-full max-w-4xl flex-col px-5 py-8 md:px-8">
          <PulseAIChat article={article} />
        </div>
      </section>
    </div>
  );
}

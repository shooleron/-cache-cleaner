'use client';
import { useState } from 'react';
import { Article } from '../types';
import { FolderArchive, CheckCircle2, XCircle, Filter, Eye, CheckCheck, RefreshCw } from 'lucide-react';

interface Props {
  articles: Article[];
  onUpdateArticleStatus: (articleId: string, status: 'published' | 'pending' | 'rejected') => void;
  onBatchApproveSource: (source: string) => void;
  onSelectArticle: (articleId: string) => void;
  showToast: (message: string, type: 'success' | 'info') => void;
}

export default function ArchiveManager({
  articles,
  onUpdateArticleStatus,
  onBatchApproveSource,
  onSelectArticle,
  showToast,
}: Props) {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'pending' | 'rejected'>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique sources
  const sources = Array.from(new Set(articles.map(a => a.source)));

  // Filter articles
  const filteredArticles = articles.filter(art => {
    const matchesStatus = selectedStatus === 'all' 
      ? true 
      : (art.status || 'published') === selectedStatus;
      
    const matchesSource = selectedSource === 'all' 
      ? true 
      : art.source === selectedSource;

    const matchesSearch = searchQuery === '' 
      ? true 
      : (art.title + ' ' + art.summary + ' ' + art.source).toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSource && matchesSearch;
  });

  const pendingCount = articles.filter(a => (a.status || 'published') === 'pending').length;
  const publishedCount = articles.filter(a => (a.status || 'published') === 'published').length;
  const rejectedCount = articles.filter(a => (a.status || 'published') === 'rejected').length;

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 dir-rtl space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-none p-6 md:p-8 border border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center rounded-none shrink-0">
            <FolderArchive size={24} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
              <span>ארכיון וסינון ידיעות מכל המקורות</span>
              <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-none font-bold">
                CMS Moderation
              </span>
            </h2>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              כאן נרכזים כל המאמרים והפוסטים שנחשפו ברשת. בחר אילו כתבות לאשר לפרסום בפיד הראשי ואילו לסמן כלא רלוונטיות.
            </p>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-none text-center">
            <div className="text-xs text-slate-400">מאושרים בפיד</div>
            <div className="text-lg font-bold text-emerald-400">{publishedCount}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-none text-center">
            <div className="text-xs text-slate-400">ממתינים לסקירה</div>
            <div className="text-lg font-bold text-amber-400">{pendingCount}</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-none text-center">
            <div className="text-xs text-slate-400">לא רלוונטיים</div>
            <div className="text-lg font-bold text-rose-400">{rejectedCount}</div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white border border-slate-200 p-6 rounded-none shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 text-xs font-bold rounded-none border transition-all ${
                selectedStatus === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              כל הידיעות ({articles.length})
            </button>
            <button
              onClick={() => setSelectedStatus('published')}
              className={`px-4 py-2 text-xs font-bold rounded-none border transition-all ${
                selectedStatus === 'published'
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              מאושרים בפיד ({publishedCount})
            </button>
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-4 py-2 text-xs font-bold rounded-none border transition-all ${
                selectedStatus === 'pending'
                  ? 'bg-amber-700 text-white border-amber-700'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              ממתינים לסקירה ({pendingCount})
            </button>
            <button
              onClick={() => setSelectedStatus('rejected')}
              className={`px-4 py-2 text-xs font-bold rounded-none border transition-all ${
                selectedStatus === 'rejected'
                  ? 'bg-rose-700 text-white border-rose-700'
                  : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
              }`}
            >
              בארכיון ({rejectedCount})
            </button>
          </div>

          {/* Search Box */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="חפש לפי כותרת, מקור או נושא..."
            className="px-4 py-2.5 bg-slate-50 border border-slate-200 text-xs md:text-sm rounded-none focus:outline-none focus:border-blue-500 w-full md:w-64"
          />
        </div>

        {/* Source Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-3 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 shrink-0 flex items-center gap-1">
            <Filter size={12} />
            <span>סנן מקור:</span>
          </span>
          <button
            onClick={() => setSelectedSource('all')}
            className={`px-3 py-1 text-[11px] font-bold rounded-none border shrink-0 transition-all ${
              selectedSource === 'all'
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            כל המקורות
          </button>
          {sources.map(src => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-3 py-1 text-[11px] font-bold rounded-none border shrink-0 transition-all ${
                selectedSource === src
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Table / Moderation List */}
      <div className="space-y-4">
        {filteredArticles.length > 0 ? (
          filteredArticles.map(art => {
            const status = art.status || 'published';
            return (
              <div
                key={art.id}
                className="bg-white border border-slate-200 rounded-none p-5 md:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Right: Article Details */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded-none">
                      {art.source}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-none uppercase">
                      {art.category}
                    </span>
                    {status === 'published' && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-none">
                        מאושר בפיד
                      </span>
                    )}
                    {status === 'pending' && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-none">
                        ממתין לסקירה
                      </span>
                    )}
                    {status === 'rejected' && (
                      <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-none">
                        בארכיון / לא רלוונטי
                      </span>
                    )}
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                    {art.title}
                  </h3>

                  <p className="text-xs md:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {art.summary}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>פורסם: {new Date(art.publishedAt).toLocaleDateString('he-IL')}</span>
                    <span>•</span>
                    <span>מדד השפעה: {art.impactScore}</span>
                  </div>
                </div>

                {/* Left: Actions */}
                <div className="flex flex-wrap md:flex-col items-center md:items-end gap-2 shrink-0 w-full md:w-auto">
                  <button
                    onClick={() => onSelectArticle(art.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-none transition-all"
                  >
                    <Eye size={14} />
                    <span>צפה</span>
                  </button>

                  {status !== 'published' && (
                    <button
                      onClick={() => {
                        onUpdateArticleStatus(art.id, 'published');
                        showToast('הכתבה אושרה ופורסמה בפיד הראשי!', 'success');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-none border border-emerald-600 shadow-sm transition-all"
                    >
                      <CheckCircle2 size={14} />
                      <span>אשר בפיד</span>
                    </button>
                  )}

                  {status !== 'rejected' && (
                    <button
                      onClick={() => {
                        onUpdateArticleStatus(art.id, 'rejected');
                        showToast('הכתבה סומנה כלא רלוונטית והועברה לארכיון.', 'info');
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-none transition-all"
                    >
                      <XCircle size={14} />
                      <span>סמן כלא רלוונטי</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-slate-200 p-12 text-center rounded-none shadow-sm space-y-3">
            <div className="text-3xl">🗄️</div>
            <h3 className="font-bold text-slate-800 text-sm">אין ידיעות התואמות את הסינון</h3>
            <p className="text-xs text-slate-500">נסה לשנות את הסינונים או ללחוץ על רענן כדי למשוך ידיעות חדשות.</p>
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import {
  Newspaper,
  TrendingUp,
  PlusCircle,
  User,
  Bookmark,
  Activity,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showBookmarksOnly: boolean;
  setShowBookmarksOnly: (val: boolean) => void;
  bookmarkCount: number;
  newsCount: number;
  latestUpdateCount: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  showBookmarksOnly,
  setShowBookmarksOnly,
  bookmarkCount,
  newsCount,
  latestUpdateCount,
}: Props) {
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setShowBookmarksOnly(false);
  };

  return (
    <aside className="w-[260px] min-w-[260px] bg-white border-l border-slate-200 flex flex-col h-full shadow-sm rounded-none" dir="rtl">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-slate-200 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-none flex items-center justify-center text-white shadow-sm animate-signal">
          <Activity size={22} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-tight">פולס-טק</h1>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">טכנולוגיה & גוף האדם</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">תפריט ראשי</div>
        
        {/* News Feed Tab */}
        <button
          onClick={() => handleTabClick('feed')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-none text-xs font-bold transition-all ${
            activeTab === 'feed' && !showBookmarksOnly
              ? 'bg-slate-900 text-white border-r-4 border-r-blue-500'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Newspaper size={16} className={activeTab === 'feed' && !showBookmarksOnly ? 'text-blue-400' : 'text-slate-400'} />
            <span>פיד חדשות ומחקרים</span>
          </div>
          <span className={`text-[10px] px-2 py-0.5 font-bold rounded-none ${
            activeTab === 'feed' && !showBookmarksOnly ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
          }`}>
            {newsCount}
          </span>
        </button>

        {/* Bookmarks Tab */}
        <button
          onClick={() => {
            setShowBookmarksOnly(true);
            setActiveTab('feed');
          }}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-none text-xs font-bold transition-all ${
            showBookmarksOnly
              ? 'bg-slate-900 text-white border-r-4 border-r-amber-500'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Bookmark size={16} className={showBookmarksOnly ? 'text-amber-400' : 'text-slate-400'} />
            <span>כתבות שמורות</span>
          </div>
          {bookmarkCount > 0 && (
            <span className={`text-[10px] px-2 py-0.5 font-bold rounded-none ${
              showBookmarksOnly ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {bookmarkCount}
            </span>
          )}
        </button>

        {/* Trend Analyzer Tab */}
        <button
          onClick={() => handleTabClick('trends')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-none text-xs font-bold transition-all ${
            activeTab === 'trends'
              ? 'bg-slate-900 text-white border-r-4 border-r-indigo-500'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <TrendingUp size={16} className={activeTab === 'trends' ? 'text-indigo-400' : 'text-slate-400'} />
            <span>מנתח מגמות (Trends)</span>
          </div>
        </button>

        {/* Submit News / Updates Tab */}
        <button
          onClick={() => handleTabClick('submit')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-none text-xs font-bold transition-all ${
            activeTab === 'submit'
              ? 'bg-slate-900 text-white border-r-4 border-r-emerald-500'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <PlusCircle size={16} className={activeTab === 'submit' ? 'text-emerald-400' : 'text-slate-400'} />
            <span>הוספת כתבה / עדכון</span>
          </div>
          {latestUpdateCount > 0 && (
            <span className="w-2 h-2 bg-rose-500 rounded-none animate-pulse" />
          )}
        </button>

        <div className="pt-4 border-t border-slate-200 my-4"></div>
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">אזור אישי</div>

        {/* Profile Tab */}
        <button
          onClick={() => handleTabClick('profile')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-none text-xs font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-slate-900 text-white border-r-4 border-r-blue-500'
              : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <User size={16} className={activeTab === 'profile' ? 'text-blue-400' : 'text-slate-400'} />
            <span>פרופיל בריאות מותאם</span>
          </div>
        </button>
      </nav>

      {/* Live tracking signal */}
      <div className="m-4 p-4 rounded-none bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-2 h-2 rounded-none bg-emerald-500 animate-signal" />
          <span className="text-[11px] font-bold text-slate-700 tracking-wider">מעקב פיד פעיל</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
          המערכת סורקת ומעדכנת התפתחויות במחקרים בזמן אמת. כתבות עם עדכון חדש יוקפצו לראש הפיד.
        </p>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-none bg-slate-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
          YA
        </div>
        <div className="flex-1 truncate">
          <span className="block text-xs font-bold text-slate-800">יורי אלטשולר</span>
          <span className="block text-[10px] text-slate-500">חוקר בריאות דיגיטלית</span>
        </div>
      </div>
    </aside>
  );
}

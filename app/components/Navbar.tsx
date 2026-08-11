'use client';
import {
  Newspaper,
  TrendingUp,
  PlusCircle,
  User,
  Bookmark,
  Activity,
  FolderArchive,
  Search,
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showBookmarksOnly: boolean;
  setShowBookmarksOnly: (val: boolean) => void;
  bookmarkCount: number;
  newsCount: number;
  latestUpdateCount: number;
  selectedCategory?: string;
  onSelectCategory?: (cat: any) => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  showBookmarksOnly,
  setShowBookmarksOnly,
  bookmarkCount,
  newsCount,
  latestUpdateCount,
  selectedCategory = 'all',
  onSelectCategory,
}: Props) {
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    setShowBookmarksOnly(false);
  };

  const handleCategoryClick = (cat: string) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    setActiveTab('feed');
    setShowBookmarksOnly(false);
  };

  return (
    <header className="w-full sticky top-0 z-40 rounded-none" dir="rtl">
      
      {/* ── Top Bar: Brand + Functional Tabs ── */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand Logo & Live Signal */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="w-11 h-11 bg-slate-900 text-white flex items-center justify-center rounded-none shadow-lg animate-signal border-b-[3px] border-b-blue-500">
              <Activity size={20} className="stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <h1 className="font-extrabold text-[22px] text-slate-900 tracking-tight leading-none">
                פולס-טק
              </h1>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
                WELLNESS TECH MAGAZINE
              </span>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/80 text-emerald-700 text-[10px] font-bold border border-emerald-200/60 rounded-none mr-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>LIVE</span>
            </span>
          </div>

          {/* Functional Tabs (compact) */}
          <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: 'feed', label: 'פיד', icon: Newspaper, count: newsCount },
              { id: 'archive', label: 'ארכיון', icon: FolderArchive },
              { id: 'trends', label: 'מגמות', icon: TrendingUp },
              { id: 'submit', label: 'הוסף', icon: PlusCircle, dot: latestUpdateCount > 0 },
              { id: 'profile', label: 'פרופיל', icon: User },
            ].map(tab => {
              const isActive = tab.id === 'feed' 
                ? activeTab === 'feed' && !showBookmarksOnly 
                : activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold transition-all rounded-none whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={13} className={isActive ? 'text-blue-400' : 'text-slate-400'} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded-none ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {tab.dot && (
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}

            {/* Bookmarks Button */}
            <button
              onClick={() => {
                setShowBookmarksOnly(true);
                setActiveTab('feed');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-[11px] font-semibold transition-all rounded-none whitespace-nowrap ${
                showBookmarksOnly
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Bookmark size={13} className={showBookmarksOnly ? 'text-amber-400' : 'text-slate-400'} />
              <span>שמורות</span>
              {bookmarkCount > 0 && (
                <span className={`text-[9px] px-1.5 py-0.5 font-bold rounded-none ${
                  showBookmarksOnly ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700'
                }`}>
                  {bookmarkCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Avatar */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="block text-[11px] font-bold text-slate-900 leading-tight">יורי אלטשולר</span>
              <span className="block text-[10px] text-slate-400 font-medium">חוקר ביו-טק</span>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-slate-900 text-white text-[11px] font-bold flex items-center justify-center rounded-none shadow-md">
              YA
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Mega-Nav (Bait Venoy editorial style) ── */}
      <div className="bg-white border-b border-slate-200/70 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1280px] mx-auto px-6 md:px-10 py-0 flex items-center gap-0 overflow-x-auto">
          {[
            { id: 'all', label: 'מה חדש', color: 'text-slate-900' },
            { id: 'body', label: 'גוף האדם ואריכות ימים', color: 'text-indigo-600' },
            { id: 'health', label: 'בריאות דיגיטלית', color: 'text-teal-600' },
            { id: 'sports', label: 'טכנולוגיית ספורט', color: 'text-emerald-600' },
            { id: 'nutrition', label: 'תזונה ומטבוליזם', color: 'text-amber-600' },
          ].map(cat => {
            const isActive = selectedCategory === cat.id && activeTab === 'feed';
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`relative px-5 py-3.5 text-[13px] font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? `${cat.color} font-bold`
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {cat.label}
                {/* Active indicator bar */}
                <span className={`absolute bottom-0 right-0 left-0 h-[2.5px] transition-all duration-300 ${
                  isActive ? 'bg-current opacity-100' : 'opacity-0'
                }`} />
              </button>
            );
          })}
          
          <span className="mx-3 w-px h-5 bg-slate-200 shrink-0" />
          
          <button
            onClick={() => handleTabClick('archive')}
            className={`relative px-5 py-3.5 text-[13px] font-semibold transition-all whitespace-nowrap ${
              activeTab === 'archive'
                ? 'text-amber-600 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            ארכיון וסינון
            <span className={`absolute bottom-0 right-0 left-0 h-[2.5px] transition-all duration-300 ${
              activeTab === 'archive' ? 'bg-amber-500 opacity-100' : 'opacity-0'
            }`} />
          </button>
        </div>
      </div>
    </header>
  );
}

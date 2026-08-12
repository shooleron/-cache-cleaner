'use client';
import {
  Newspaper,
  TrendingUp,
  PlusCircle,
  User,
  Bookmark,
  Activity,
  FolderArchive,
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
    <header className="w-full sticky top-0 z-40 bg-[#FAFAF7] border-b border-[#DEDAD1] select-none" dir="rtl">
      
      {/* ── Main Editorial Header ── */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-5 flex items-center justify-between gap-6">
        
        {/* Brand Logo (Vital Index style: מדדהגוף -> פולסטק) */}
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleTabClick('feed')}>
          <div className="font-extrabold text-2xl md:text-3xl text-[#14171C] tracking-tight leading-none">
            פולס<span className="text-[#EF4423]">טק</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#84807A] border-r border-[#DEDAD1] pr-3">
            כושר · טכנולוגיה · אריכות ימים
          </span>
        </div>

        {/* Primary Navigation Tabs */}
        <nav className="flex items-center gap-6 text-[15px] font-semibold text-[#14171C]">
          {[
            { id: 'feed', label: 'פיד ראשי', icon: Newspaper, count: newsCount },
            { id: 'archive', label: 'ארכיון', icon: FolderArchive },
            { id: 'trends', label: 'מגמות', icon: TrendingUp },
            { id: 'submit', label: 'הוסף', icon: PlusCircle },
            { id: 'profile', label: 'פרופיל', icon: User },
          ].map(tab => {
            const isActive = tab.id === 'feed' 
              ? activeTab === 'feed' && !showBookmarksOnly 
              : activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`relative py-1 font-medium transition-colors ${
                  isActive
                    ? 'text-[#EF4423] font-bold border-b-2 border-[#EF4423]'
                    : 'text-[#14171C] hover:text-[#EF4423]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="mr-1.5 text-[11px] font-mono text-[#84807A]">
                    ({tab.count})
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bookmarks & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowBookmarksOnly(!showBookmarksOnly);
              if (!showBookmarksOnly) setActiveTab('feed');
            }}
            className={`px-4 py-2 text-[13px] font-mono font-semibold transition-all border ${
              showBookmarksOnly
                ? 'bg-[#EF4423] text-white border-[#EF4423]'
                : 'bg-[#14171C] text-[#FAFAF7] border-[#14171C] hover:bg-[#EF4423] hover:border-[#EF4423]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Bookmark size={14} className={showBookmarksOnly ? 'fill-current' : ''} />
              <span>שמורים</span>
              <span className="text-[11px]">({bookmarkCount})</span>
            </span>
          </button>
        </div>
      </div>

      {/* ── Sub Navigation: Category Selector Strips ── */}
      <div className="border-t border-[#DEDAD1] bg-[#F0EEE9]/60">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-[12px] font-mono">
            <span className="text-[#84807A] font-bold uppercase tracking-wider ml-2">קטגוריות:</span>
            {[
              { id: 'all', label: 'הכל' },
              { id: 'health', label: 'בריאות דיגיטלית' },
              { id: 'sports', label: 'כושר וספורט' },
              { id: 'nutrition', label: 'תזונה ומטבוליזם' },
              { id: 'body', label: 'אריכות ימים' },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id && !showBookmarksOnly;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-3 py-1 font-mono text-[11px] transition-all ${
                    isSelected
                      ? 'bg-[#14171C] text-[#FAFAF7] font-bold'
                      : 'bg-[#FAFAF7] text-[#14171C] border border-[#DEDAD1] hover:border-[#14171C]'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[#84807A]">
            <span>עודכן לראשונה: היום</span>
            <span>·</span>
            <span className="text-[#1F5C52] font-semibold">מקורות מאומתים בזמן אמת</span>
          </div>
        </div>
      </div>
    </header>
  );
}

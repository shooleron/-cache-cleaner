'use client';
import { Bookmark, Shield, Lock, SlidersHorizontal } from 'lucide-react';
import { SectionCategory, AdminUser } from '../types';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showBookmarksOnly: boolean;
  setShowBookmarksOnly: (val: boolean) => void;
  bookmarkCount: number;
  newsCount: number;
  selectedCategory?: string;
  onSelectCategory?: (cat: string) => void;
  categories: SectionCategory[];
  adminUser: AdminUser | null;
  onOpenAdminLogin: () => void;
  onOpenAdminDashboard: () => void;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  showBookmarksOnly,
  setShowBookmarksOnly,
  bookmarkCount,
  newsCount,
  selectedCategory = 'all',
  onSelectCategory,
  categories,
  adminUser,
  onOpenAdminLogin,
  onOpenAdminDashboard,
}: Props) {
  const handleCategoryClick = (slug: string) => {
    if (onSelectCategory) {
      onSelectCategory(slug);
    }
    setActiveTab('feed');
    setShowBookmarksOnly(false);
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-[#FAFAF7] border-b border-[#DEDAD1] select-none" dir="rtl">
      
      {/* ── Main Classic Magazine Header ── */}
      <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-5 flex items-center justify-between gap-6">
        
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-4 cursor-pointer" 
          onClick={() => {
            setActiveTab('feed');
            setShowBookmarksOnly(false);
            if (onSelectCategory) onSelectCategory('all');
          }}
        >
          <div className="font-black text-2xl md:text-3xl text-[#14171C] tracking-tight leading-none">
            פולס<span className="text-[#EF4423]">טק</span>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-mono text-[#84807A] border-r border-[#DEDAD1] pr-3">
            כושר · טכנולוגיה · אריכות ימים
          </span>
        </div>

        {/* Reader Navigation & Category Links */}
        <nav className="hidden md:flex items-center gap-6 text-[15px] font-medium text-[#14171C]">
          <button
            onClick={() => handleCategoryClick('all')}
            className={`py-1 font-medium transition-colors ${
              selectedCategory === 'all' && activeTab === 'feed' && !showBookmarksOnly
                ? 'text-[#EF4423] font-bold border-b-2 border-[#EF4423]'
                : 'text-[#14171C] hover:text-[#EF4423]'
            }`}
          >
            ראשי
          </button>

          {categories.slice(0, 4).map((cat) => {
            const isSelected = selectedCategory === cat.slug && activeTab === 'feed' && !showBookmarksOnly;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className={`py-1 font-medium transition-colors ${
                  isSelected
                    ? 'text-[#EF4423] font-bold border-b-2 border-[#EF4423]'
                    : 'text-[#14171C] hover:text-[#EF4423]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Admin Login Zone */}
        <div className="flex items-center gap-3">
          
          {/* Bookmarked items button */}
          <button
            onClick={() => {
              setShowBookmarksOnly(!showBookmarksOnly);
              if (!showBookmarksOnly) setActiveTab('feed');
            }}
            className={`px-3.5 py-2 text-[12px] font-mono transition-all border ${
              showBookmarksOnly
                ? 'bg-[#EF4423] text-white border-[#EF4423]'
                : 'bg-[#FAFAF7] text-[#14171C] border-[#DEDAD1] hover:border-[#14171C]'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Bookmark size={13} className={showBookmarksOnly ? 'fill-current' : ''} />
              <span>שמורים ({bookmarkCount})</span>
            </span>
          </button>

          {/* Admin Management Dashboard Trigger / Login Zone */}
          {adminUser?.isAuthenticated ? (
            <button
              onClick={onOpenAdminDashboard}
              className={`px-4 py-2 text-[12px] font-mono font-bold transition-all border flex items-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-[#EF4423] text-white border-[#EF4423]'
                  : 'bg-[#14171C] text-[#FAFAF7] border-[#14171C] hover:bg-[#EF4423] hover:border-[#EF4423]'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>מערכת ניהול</span>
            </button>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="px-4 py-2 bg-[#14171C] text-[#FAFAF7] hover:bg-[#EF4423] text-[12px] font-mono font-bold transition-colors border border-[#14171C] flex items-center gap-2"
            >
              <Lock size={13} />
              <span>אזור ניהול</span>
            </button>
          )}

        </div>
      </div>

      {/* ── Sub Navigation: Category Bar ── */}
      <div className="border-t border-[#DEDAD1] bg-[#F0EEE9]/60">
        <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-2 flex items-center justify-between gap-4 overflow-x-auto">
          <div className="flex items-center gap-2 text-[12px] font-mono">
            <span className="text-[#84807A] font-bold uppercase tracking-wider ml-2">מדורים:</span>
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.slug && !showBookmarksOnly && activeTab === 'feed';
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={`px-3 py-1 font-mono text-[11px] transition-all ${
                    isSelected
                      ? 'bg-[#14171C] text-[#FAFAF7] font-bold'
                      : 'bg-[#FAFAF7] text-[#14171C] border border-[#DEDAD1] hover:border-[#14171C]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono text-[#84807A]">
            <span>עיתונות תוכן נקייה</span>
            <span>·</span>
            <span className="text-[#1F5C52] font-semibold">מתעדכן יומית</span>
          </div>
        </div>
      </div>

    </header>
  );
}

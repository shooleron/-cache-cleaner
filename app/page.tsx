'use client';
import { useState, useEffect } from 'react';
import { Article, ArticleCategory, SectionCategory, AdminUser } from './types';
import { INITIAL_ARTICLES } from './mockData';
import Navbar from './components/Navbar';
import ArticleCard from './components/ArticleCard';
import ArticleDetail from './components/ArticleDetail';
import BaitVenoyHeroCard from './components/BaitVenoyHeroCard';
import VitalsTicker from './components/VitalsTicker';
import MetricStrip from './components/MetricStrip';
import MarketTrackerBanner from './components/MarketTrackerBanner';
import AdminLoginModal from './components/AdminLoginModal';
import AdminDashboard from './components/AdminDashboard';
import { Search, RefreshCw, X, AlertCircle } from 'lucide-react';

const INITIAL_CATEGORIES: SectionCategory[] = [
  { id: 'cat-health', name: 'בריאות דיגיטלית', slug: 'health', description: 'ניטור מדדים רציף, חיישנים לבישים ורפואה מונעת' },
  { id: 'cat-sports', name: 'כושר וספורט', slug: 'sports', description: 'טכנולוגיית ספורט, ביצועים ואופטימיזציה של אימונים' },
  { id: 'cat-nutrition', name: 'תזונה ומטבוליזם', slug: 'nutrition', description: 'מטבוליזם תאי, גלוקוז רציף ומיקרוביום במעי' },
  { id: 'cat-body', name: 'אריכות ימים', slug: 'body', description: 'האטת הזדקנות תאית (Longevity) ושגשוג מיטוכונדריאלי' },
  { id: 'cat-wearables', name: 'גאדג\'טים לבישים', slug: 'wearables', description: 'שעונים חכמים, טבעות בריאות וסנסורים תת-עוריים' },
];

export default function Page() {
  const [activeTab, setActiveTab] = useState<'feed' | 'admin'>('feed');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [categories, setCategories] = useState<SectionCategory[]>(INITIAL_CATEGORIES);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Admin & Auth State
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);
  const [isLoadingNews, setIsLoadingNews] = useState(false);

  // ── Persistence Layer ──────────────────────────────────────────────
  const CONTENT_VERSION = 'v12_cms_admin_split';

  const saveArticles = (newArticles: Article[]) => {
    setArticles(newArticles);
    try {
      localStorage.setItem('pulsetech_articles', JSON.stringify(newArticles));
      localStorage.setItem('pulsetech_content_version', CONTENT_VERSION);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles: newArticles, version: CONTENT_VERSION })
    }).catch(err => console.error('Failed to persist articles to disk:', err));
  };

  const fetchLiveNews = async (forceRefresh = false) => {
    setIsLoadingNews(true);
    try {
      const res = await fetch('/api/news');
      if (!res.ok) throw new Error('Failed to fetch news');
      const data = await res.json();
      const fetched: Article[] = Array.isArray(data) ? data : (data.articles || []);

      const current = articles;
      const merged = fetched.map(fetchedArt => {
        const localMatch = current.find(c => c.id === fetchedArt.id);
        if (localMatch) {
          return {
            ...fetchedArt,
            isBookmarked: localMatch.isBookmarked,
            status: localMatch.status || fetchedArt.status,
            timeline: localMatch.timeline,
          };
        }
        return fetchedArt;
      });

      current.forEach(localArt => {
        const exists = fetched.some(f => f.id === localArt.id);
        if (!exists && !INITIAL_ARTICLES.some(m => m.id === localArt.id)) {
          merged.push(localArt);
        }
      });

      INITIAL_ARTICLES.forEach(mockArt => {
        if (!merged.some(m => m.id === mockArt.id)) {
          const match = current.find(c => c.id === mockArt.id);
          merged.push(match || mockArt);
        }
      });

      saveArticles(merged.length > 0 ? merged : INITIAL_ARTICLES);
      if (forceRefresh) {
        showToast('פיד החדשות רענן בהצלחה ממקורות המידע!', 'success');
      }
    } catch (err) {
      console.error(err);
      if (forceRefresh) {
        showToast('שגיאה בחיבור למקורות. נטענו נתוני הגיבוי.', 'info');
      }
    } finally {
      setIsLoadingNews(false);
    }
  };

  useEffect(() => {
    const savedVersion = localStorage.getItem('pulsetech_content_version');
    if (savedVersion === CONTENT_VERSION) {
      const saved = localStorage.getItem('pulsetech_articles');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setArticles(parsed);
            return;
          }
        } catch (e) {}
      }
    }
    saveArticles(INITIAL_ARTICLES);
    fetchLiveNews(false);
  }, []);

  // Update categories article counts
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    articleCount: articles.filter(a => a.category === cat.slug && (a.status || 'published') === 'published').length
  }));

  // Handlers for Articles
  const handleToggleBookmark = (articleId: string) => {
    const updated = articles.map(art => 
      art.id === articleId ? { ...art, isBookmarked: !art.isBookmarked } : art
    );
    saveArticles(updated);
    const art = updated.find(a => a.id === articleId);
    if (art) {
      showToast(art.isBookmarked ? 'הכתבה נשמרה במועדפים' : 'הכתבה הוסרה מהמועדפים', 'success');
    }
  };

  const handleUpdateArticle = (updatedArticle: Article) => {
    const updated = articles.map(a => a.id === updatedArticle.id ? updatedArticle : a);
    saveArticles(updated);
  };

  const handleDeleteArticle = (articleId: string) => {
    const updated = articles.filter(art => art.id !== articleId);
    saveArticles(updated);
    if (selectedArticleId === articleId) setSelectedArticleId(null);
    showToast('הכתבה הוסרה בהצלחה', 'success');
  };

  const handleAddArticle = (newArticle: Article) => {
    const updated = [newArticle, ...articles];
    saveArticles(updated);
  };

  const handleAddCategory = (newCat: SectionCategory) => {
    setCategories([...categories, newCat]);
    showToast(`המדור ${newCat.name} נוסף בהצלחה!`, 'success');
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories(categories.filter(c => c.id !== catId));
    showToast('המדור הוסר בהצלחה', 'info');
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Filtered Articles for Public Reader Feed
  const publishedArticles = articles.filter(a => (a.status || 'published') === 'published');
  
  const filteredArticles = publishedArticles.filter(art => {
    const matchesSearch = searchQuery === '' || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesBookmark = !showBookmarksOnly || art.isBookmarked;

    return matchesSearch && matchesCategory && matchesBookmark;
  });

  const heroArticle = filteredArticles[0] || publishedArticles[0];
  const gridArticles = heroArticle && !showBookmarksOnly && searchQuery === '' && selectedCategory === 'all'
    ? filteredArticles.slice(1)
    : filteredArticles;

  const selectedArticle = articles.find(a => a.id === selectedArticleId);

  return (
    <div className="min-h-screen bg-[#FAFAF7] text-[#14171C] font-sans antialiased selection:bg-[#EF4423] selection:text-white" dir="rtl">
      
      {/* Toast Notification Bar */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 animate-fade-up">
          <div className={`px-5 py-3 border font-mono text-xs font-bold flex items-center gap-3 shadow-xl ${
            toast.type === 'success'
              ? 'bg-[#14171C] text-[#FAFAF7] border-[#EF4423]'
              : 'bg-[#F0EEE9] text-[#14171C] border-[#DEDAD1]'
          }`}>
            <AlertCircle size={16} className="text-[#EF4423]" />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="mr-2 text-[#84807A] hover:text-white">
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Public Magazine Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: string) => {
          if (tab === 'feed' || tab === 'admin') setActiveTab(tab);
        }}
        showBookmarksOnly={showBookmarksOnly}
        setShowBookmarksOnly={setShowBookmarksOnly}
        bookmarkCount={articles.filter(a => a.isBookmarked).length}
        newsCount={publishedArticles.length}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat: string) => setSelectedCategory(cat)}
        categories={categoriesWithCounts}
        adminUser={adminUser}
        onOpenAdminLogin={() => setIsLoginModalOpen(true)}
        onOpenAdminDashboard={() => setActiveTab('admin')}
      />

      {/* Vitals Continuous Ticker Bar */}
      <VitalsTicker />

      {/* MAIN VIEW SWITCHER: PUBLIC READER FRONTEND vs ADMIN CMS DASHBOARD */}
      {activeTab === 'admin' && adminUser?.isAuthenticated ? (
        
        /* ── ADMIN MANAGEMENT DASHBOARD VIEW ── */
        <AdminDashboard
          user={adminUser}
          articles={articles}
          categories={categoriesWithCounts}
          onLogout={() => {
            setAdminUser(null);
            setActiveTab('feed');
            showToast('יצאת בהצלחה ממערכת הניהול', 'info');
          }}
          onUpdateArticle={handleUpdateArticle}
          onDeleteArticle={handleDeleteArticle}
          onAddArticle={handleAddArticle}
          onAddCategory={handleAddCategory}
          onDeleteCategory={handleDeleteCategory}
          onSelectArticle={(id) => {
            setSelectedArticleId(id);
            setActiveTab('feed');
          }}
          showToast={showToast}
        />

      ) : (

        /* ── PUBLIC READER FRONTEND (CLASSIC MAGAZINE CONTENT SITE) ── */
        <main className="w-full">
          
          {/* Hero Editorial 2-Column Section */}
          {heroArticle && !showBookmarksOnly && searchQuery === '' && selectedCategory === 'all' && (
            <div className="w-full border-b border-[#DEDAD1]">
              <div className="max-w-[1200px] mx-auto">
                <BaitVenoyHeroCard
                  article={heroArticle}
                  secondaryArticles={publishedArticles.slice(1, 4)}
                  onSelect={() => setSelectedArticleId(heroArticle.id)}
                />
              </div>
            </div>
          )}

          {/* Metric Strip Bar */}
          {!showBookmarksOnly && searchQuery === '' && selectedCategory === 'all' && (
            <div className="w-full">
              <div className="max-w-[1200px] mx-auto">
                <MetricStrip totalArticles={publishedArticles.length} />
              </div>
            </div>
          )}

          {/* Public Feed Container */}
          <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-10 space-y-8">
            
            {/* Search & Feed Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#DEDAD1]">
              
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute right-3 top-3 text-[#84807A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="חפש כתבה, מחבר או נושא במגזין..."
                  className="w-full bg-[#FAFAF7] border border-[#DEDAD1] pr-10 pl-4 py-2 text-sm font-mono outline-none focus:border-[#14171C] placeholder:text-[#84807A]"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-3 top-3 text-[#84807A] hover:text-[#14171C]"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => fetchLiveNews(true)}
                  disabled={isLoadingNews}
                  className="px-4 py-2 bg-[#FAFAF7] hover:bg-[#F0EEE9] border border-[#DEDAD1] text-[#14171C] font-mono text-xs font-bold transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={13} className={isLoadingNews ? 'animate-spin text-[#EF4423]' : ''} />
                  <span>{isLoadingNews ? 'מרענן מחדש...' : 'רענן פיד'}</span>
                </button>
              </div>

            </div>

            {/* Articles Grid */}
            {gridArticles.length > 0 ? (
              <div className="space-y-6">
                {gridArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onSelect={() => setSelectedArticleId(article.id)}
                    onToggleBookmark={() => handleToggleBookmark(article.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center border border-[#DEDAD1] bg-[#F0EEE9]/50 font-mono space-y-3">
                <span className="text-base text-[#14171C] font-bold block">לא נמצאו כתבות תואמות</span>
                <p className="text-xs text-[#84807A]">
                  נסה לבחור מדור אחר או לחפש מילת מפתח חלופית
                </p>
              </div>
            )}

            {/* Dark Market Tracker Banner */}
            {!showBookmarksOnly && searchQuery === '' && (
              <div className="w-full">
                <div className="max-w-[1200px] mx-auto">
                  <MarketTrackerBanner />
                </div>
              </div>
            )}

          </div>

        </main>
      )}

      {/* Classic Magazine Reader Popup Modal */}
      {selectedArticle && (
        <ArticleDetail
          article={selectedArticle}
          onClose={() => setSelectedArticleId(null)}
          onToggleBookmark={() => handleToggleBookmark(selectedArticle.id)}
        />
      )}

      {/* Admin Login Zone Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user: AdminUser) => {
          setAdminUser(user);
          setActiveTab('admin');
          showToast(`ברוך הבא למערכת הניהול, ${user.username}!`, 'success');
        }}
      />

      {/* Classic Magazine Footer */}
      <footer className="w-full bg-[#FAFAF7] border-t border-[#DEDAD1] py-8 px-6 md:px-10 text-[#84807A] font-mono text-xs flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1200px] mx-auto select-none">
        <span>© 2026 פולס-טק — עיתונות תוכן, כושר וטכנולוגיה</span>
        <span>מערכת עיתונאית עצמאית בזמן אמת</span>
      </footer>

    </div>
  );
}

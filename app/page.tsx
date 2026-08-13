'use client';
import { useState, useEffect } from 'react';
import { Article, ArticleCategory, TimelineEvent, UserProfile } from './types';
import { INITIAL_ARTICLES, MOCK_DEVELOPMENTS } from './mockData';
import Navbar from './components/Navbar';
import ArticleCard from './components/ArticleCard';
import ArticleDetail from './components/ArticleDetail';
import TrendAnalyzer from './components/TrendAnalyzer';
import NewsSubmitter from './components/NewsSubmitter';
import UserProfileView from './components/UserProfileView';
import AILinkConverterBox from './components/AILinkConverterBox';
import ArchiveManager from './components/ArchiveManager';
import BaitVenoyHeroCard from './components/BaitVenoyHeroCard';
import VitalsTicker from './components/VitalsTicker';
import MetricStrip from './components/MetricStrip';
import MarketTrackerBanner from './components/MarketTrackerBanner';
import { Search, Sparkles, AlertCircle, RefreshCw, X } from 'lucide-react';

export default function Page() {
  const [activeTab, setActiveTab] = useState('feed');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | ArticleCategory>('all');
  
  // Highlighted article ID for bump animation
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'יורי אלטשולר',
    interests: ['אריכות ימים ומניעת הזדקנות', 'חיישנים ומכשור לביש', 'ביו-האקינג ושיפור קוגניטיבי'],
    frequency: 'daily',
  });

  const [isLoadingNews, setIsLoadingNews] = useState(false);

  // ── Persistence Layer ──────────────────────────────────────────────
  // Dual persistence: localStorage (instant) + server JSON file (permanent)
  const CONTENT_VERSION = 'v11_bounded_100_to_500_words';

  const saveArticles = (newArticles: Article[]) => {
    setArticles(newArticles);
    // 1. Instant save to localStorage
    try {
      localStorage.setItem('pulsetech_articles', JSON.stringify(newArticles));
      localStorage.setItem('pulsetech_content_version', CONTENT_VERSION);
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
    // 2. Persistent save to server (fire-and-forget)
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

      // Get current articles to merge state (bookmarks, custom timeline events, moderation)
      const current = articles;

      const merged = fetched.map(fetchedArt => {
        const localMatch = current.find(c => c.id === fetchedArt.id);
        if (localMatch) {
          const mergedTimeline = [...fetchedArt.timeline];
          localMatch.timeline.forEach(localEv => {
            const alreadyInTimeline = mergedTimeline.some(t => t.title === localEv.title);
            if (!alreadyInTimeline) {
              mergedTimeline.push(localEv);
            }
          });

          return {
            ...fetchedArt,
            isBookmarked: localMatch.isBookmarked,
            status: localMatch.status, // Preserve moderation status
            timeline: mergedTimeline,
            lastUpdated: localMatch.lastUpdated > fetchedArt.lastUpdated ? localMatch.lastUpdated : fetchedArt.lastUpdated
          };
        }
        return fetchedArt;
      });

      // Append any user-created articles that aren't in RSS feeds
      current.forEach(localArt => {
        const existsInFetched = fetched.some(f => f.id === localArt.id);
        if (!existsInFetched && !INITIAL_ARTICLES.some(m => m.id === localArt.id)) {
          merged.push(localArt);
        }
      });

      // Also keep all INITIAL_ARTICLES that weren't in the RSS fetch
      INITIAL_ARTICLES.forEach(mockArt => {
        const existsInMerged = merged.some(m => m.id === mockArt.id);
        if (!existsInMerged) {
          const localMatch = current.find(c => c.id === mockArt.id);
          merged.push(localMatch || mockArt);
        }
      });

      if (merged.length === 0) {
        saveArticles(INITIAL_ARTICLES);
      } else {
        saveArticles(merged);
      }
      if (forceRefresh) {
        showToast('פיד החדשות רענן בהצלחה ממקורות המידע העולמיים!', 'success');
      }
    } catch (err) {
      console.error(err);
      if (forceRefresh) {
        showToast('שגיאה בחיבור למקורות החיים. נטענו נתוני הגיבוי.', 'info');
      }
    } finally {
      setIsLoadingNews(false);
    }
  };

  // ── Load on Mount: Server → localStorage → mockData fallback ─────
  useEffect(() => {
    const loadArticles = async () => {
      try {
        // 1. Try loading from persistent server storage
        const res = await fetch('/api/articles');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.articles) && data.articles.length > 0 && data.version === CONTENT_VERSION) {
            setArticles(data.articles);
            // Sync to localStorage for instant access next time
            localStorage.setItem('pulsetech_articles', JSON.stringify(data.articles));
            localStorage.setItem('pulsetech_content_version', CONTENT_VERSION);
            fetchLiveNews(false);
            return;
          }
        }
      } catch {
        // Server unavailable, fall through to localStorage
      }

      // 2. Fall back to localStorage
      const savedVersion = localStorage.getItem('pulsetech_content_version');
      if (savedVersion === CONTENT_VERSION) {
        const saved = localStorage.getItem('pulsetech_articles');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setArticles(parsed);
              fetchLiveNews(false);
              return;
            }
          } catch { /* fall through */ }
        }
      }

      // 3. Fresh start: load from mockData and persist
      saveArticles(INITIAL_ARTICLES);
      fetchLiveNews(false);
    };

    loadArticles();
  }, []);

  // Helper: Calculate Match Score based on user profile interests
  const calculateMatchScore = (article: Article): number => {
    let score = 0;
    const interests = userProfile.interests;

    if (interests.includes('אריכות ימים ומניעת הזדקנות') && article.category === 'body') score += 40;
    if (interests.includes('ביו-האקינג ושיפור קוגניטיבי') && (article.category === 'body' || article.category === 'sports')) score += 30;
    if (interests.includes('תזונה מטבולית ומדע המזון') && article.category === 'nutrition') score += 40;
    if (interests.includes('רפואה מונעת ואבחון ביתי') && article.category === 'health') score += 40;
    if (interests.includes('שיקום שרירים ופיזיולוגיית ספורט') && article.category === 'sports') score += 40;
    
    // Keyword match
    if (interests.includes('חיישנים ומכשור לביש')) {
      const keywords = ['שבב', 'טבעת', 'חיישן', 'wearable', 'לביש', 'קפסולה'];
      const matches = keywords.some(k => article.title.includes(k) || article.content.includes(k));
      if (matches) score += 30;
    }

    return Math.min(score, 100);
  };

  // Bookmark Toggle
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

  // Delete Article Handler
  const handleDeleteArticle = (articleId: string) => {
    const updated = articles.filter(art => art.id !== articleId);
    saveArticles(updated);
    if (selectedArticleId === articleId) {
      setSelectedArticleId(null);
    }
    showToast('הכתבה הוסרה בהצלחה מהפיד', 'success');
  };

  // Show Toast Helper
  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Dynamic Bump Simulation
  const handleSimulateUpdate = () => {
    const randomIndex = Math.floor(Math.random() * MOCK_DEVELOPMENTS.length);
    const mockDev = MOCK_DEVELOPMENTS[randomIndex];
    
    const targetArticle = articles.find(a => a.id === mockDev.articleId);
    if (!targetArticle) return;

    const alreadyExists = targetArticle.timeline.some(e => e.title === mockDev.title);
    
    const newEvent: TimelineEvent = {
      id: crypto.randomUUID(),
      title: mockDev.title,
      description: mockDev.description,
      timestamp: new Date().toISOString(),
      isNew: true
    };

    const updatedArticles = articles.map(art => {
      if (art.id === mockDev.articleId) {
        const newTimeline = alreadyExists 
          ? art.timeline 
          : [...art.timeline, newEvent];
          
        const newSystems = mockDev.physiologicalImpactAddition
          ? Array.from(new Set([...art.physiologicalImpact, ...mockDev.physiologicalImpactAddition]))
          : art.physiologicalImpact;

        return {
          ...art,
          timeline: newTimeline,
          lastUpdated: new Date().toISOString(),
          physiologicalImpact: newSystems
        };
      }
      return art;
    });

    saveArticles(updatedArticles);
    setHighlightedId(mockDev.articleId);
    showToast(`התפתחות מחקרית חדשה בכתבה: "${targetArticle.title.slice(0, 30)}..." - הכתבה הוקפצה לראש הפיד!`, 'success');

    setTimeout(() => setHighlightedId(null), 2500);
  };

  // News Submission Adders
  const handleAddArticle = (newArticle: Article) => {
    const updated = [newArticle, ...articles];
    saveArticles(updated);
    showToast('כתבה חדשה הועלתה וסווגה בהצלחה!', 'success');
    setHighlightedId(newArticle.id);
    setTimeout(() => setHighlightedId(null), 2500);
  };

  const handleAddUpdate = (articleId: string, event: TimelineEvent) => {
    const updated = articles.map(art => {
      if (art.id === articleId) {
        return {
          ...art,
          lastUpdated: new Date().toISOString(),
          timeline: [...art.timeline, event]
        };
      }
      return art;
    });
    saveArticles(updated);
    showToast('העדכון נקלט! הכתבה הוקפצה לראש הפיד.', 'success');
    setHighlightedId(articleId);
    setTimeout(() => setHighlightedId(null), 2500);
  };

  // Update Article Moderation Status (Published, Pending, Rejected)
  const handleUpdateArticleStatus = (articleId: string, status: 'published' | 'pending' | 'rejected') => {
    const updated = articles.map(art => 
      art.id === articleId ? { ...art, status } : art
    );
    saveArticles(updated);
  };

  // Batch Approve All Articles from a specific source
  const handleBatchApproveSource = (source: string) => {
    const updated = articles.map(art => 
      art.source === source ? { ...art, status: 'published' as const } : art
    );
    saveArticles(updated);
    showToast(`כל הידיעות מ-${source} אושרו ופורסמו בפיד!`, 'success');
  };

  // Filter & Sort Feed
  const sortedArticles = [...articles].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

  const filteredArticles = sortedArticles.filter(article => {
    // Hide articles that were explicitly rejected/archived from main live feed
    const status = article.status || 'published';
    if (status === 'rejected') return false;

    // Bookmarks only filter
    if (showBookmarksOnly && !article.isBookmarked) return false;

    // Category filter
    if (selectedCategory !== 'all' && article.category !== selectedCategory) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchTitle = article.title.toLowerCase().includes(query);
      const matchContent = article.content.toLowerCase().includes(query);
      const matchImpact = article.physiologicalImpact.some(s => s.toLowerCase().includes(query));
      return matchTitle || matchContent || matchImpact;
    }

    return true;
  });

  const activeArticle = articles.find(a => a.id === selectedArticleId) || null;

  // Bait Venoy Feature: Top Hero Story
  const heroArticle = selectedCategory === 'all' && !searchQuery.trim() && !showBookmarksOnly && filteredArticles.length > 0
    ? filteredArticles[0]
    : null;

  const feedArticlesList = heroArticle 
    ? filteredArticles.slice(1) 
    : filteredArticles;

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans" dir="rtl">
      
      {/* Top Header & Bait Venoy Category Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showBookmarksOnly={showBookmarksOnly}
        setShowBookmarksOnly={setShowBookmarksOnly}
        bookmarkCount={articles.filter(a => a.isBookmarked).length}
        newsCount={articles.length}
        latestUpdateCount={articles.filter(a => a.timeline.some(e => e.isNew)).length}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Signature Vitals Ticker Bar (Vital Index feature) */}
      <VitalsTicker />

      {/* Main Workspace content — vital-index.html paper styling */}
      <main className="flex-1 w-full flex flex-col relative bg-[#FAFAF7]">
        
        {/* Toast Notification Alert */}
        {toast && (
          <div className="fixed top-24 left-6 z-50 animate-fade-up max-w-sm">
            <div className={`p-4 rounded-none shadow-lg border flex items-center gap-3 font-mono text-xs ${
              toast.type === 'success'
                ? 'bg-[#1F5C52] text-[#FAFAF7] border-[#1F5C52]'
                : 'bg-[#14171C] text-[#FAFAF7] border-[#14171C]'
            }`}>
              <AlertCircle size={16} className="text-[#EF4423]" />
              <span className="leading-normal">{toast.message}</span>
              <button onClick={() => setToast(null)} className="text-[#84807A] hover:text-white mr-auto">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Selected Article Popup Reader Modal */}
        {selectedArticleId && activeArticle && (
          <ArticleDetail
            article={activeArticle}
            onClose={() => setSelectedArticleId(null)}
            onToggleBookmark={() => handleToggleBookmark(activeArticle.id)}
          />
        )}

        {/* Tab switcher workspaces */}
        <div className="flex-1 flex flex-col items-center w-full">
          
          {/* TAB CONTENT: NEWS FEED */}
          {activeTab === 'feed' && (
            <div className="w-full flex flex-col items-center">
              
              {/* Hero Section — vital-index.html 2-column hero */}
              {heroArticle && !showBookmarksOnly && searchQuery === '' && selectedCategory === 'all' && (
                <div className="w-full border-b border-[#DEDAD1]">
                  <div className="max-w-[1200px] mx-auto">
                    <BaitVenoyHeroCard
                      article={heroArticle}
                      secondaryArticles={articles.slice(1, 4)}
                      onSelect={() => setSelectedArticleId(heroArticle.id)}
                    />
                  </div>
                </div>
              )}

              {/* Metric Strip Bar */}
              {!showBookmarksOnly && searchQuery === '' && selectedCategory === 'all' && (
                <div className="w-full">
                  <div className="max-w-[1200px] mx-auto">
                    <MetricStrip totalArticles={articles.length} />
                  </div>
                </div>
              )}

              {/* Feed Content Container */}
              <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-10 space-y-8">
                
                {/* Search & Controls Bar */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-[#DEDAD1]">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute right-4 top-3.5 text-[#84807A]" size={16} />
                    <input
                      type="text"
                      placeholder="חפש לפי מחקר, איבר, מילת מפתח..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-[#F0EEE9] border border-[#DEDAD1] pr-11 pl-4 py-3 text-sm font-mono outline-none focus:border-[#14171C] transition-all text-[#14171C] placeholder:text-[#84807A]"
                    />
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-auto font-mono text-xs">
                    <button
                      onClick={() => fetchLiveNews(true)}
                      disabled={isLoadingNews}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#FAFAF7] hover:bg-[#F0EEE9] text-[#14171C] border border-[#DEDAD1] transition-all disabled:opacity-50 shrink-0 font-semibold"
                    >
                      <RefreshCw size={13} className={isLoadingNews ? 'animate-spin' : ''} />
                      <span>{isLoadingNews ? 'מרענן...' : 'רענן פיד'}</span>
                    </button>

                    <button
                      onClick={handleSimulateUpdate}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-[#14171C] hover:bg-[#EF4423] text-[#FAFAF7] font-semibold transition-all shrink-0"
                    >
                      <Sparkles size={13} />
                      <span>סמלץ עדכון</span>
                    </button>
                  </div>
                </div>

                {/* Loading indicator */}
                {isLoadingNews && (
                  <div className="w-full bg-[#14171C] text-[#7FD8A4] p-4 flex items-center justify-center gap-3 text-xs font-mono">
                    <RefreshCw size={14} className="animate-spin" />
                    <span>מעדכן מחקרים וידיעות בזמן אמת ממקורות גלובליים...</span>
                  </div>
                )}

                {/* AI Link Converter */}
                <AILinkConverterBox
                  onArticleConverted={(newArt) => {
                    const updated = [newArt, ...articles];
                    saveArticles(updated);
                    setHighlightedId(newArt.id);
                  }}
                  showToast={(msg, type) => showToast(msg, type === 'error' ? 'info' : type)}
                />

                {/* Feed Articles Cards Grid */}
                {feedArticlesList.length > 0 ? (
                  <div className="space-y-6 w-full">
                    {feedArticlesList.map((art) => (
                      <ArticleCard
                        key={art.id}
                        article={art}
                        onSelect={() => setSelectedArticleId(art.id)}
                        onToggleBookmark={(e) => {
                          e.stopPropagation();
                          handleToggleBookmark(art.id);
                        }}
                        onDelete={(e) => {
                          e.stopPropagation();
                          handleDeleteArticle(art.id);
                        }}
                        highlightedId={highlightedId}
                        matchScore={calculateMatchScore(art)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-20 bg-[#FAFAF7] border border-[#DEDAD1] text-center w-full">
                    <div className="text-5xl mb-5 opacity-30">📰</div>
                    <h3 className="font-bold text-[#14171C] text-base mb-2">אין כתבות להצגה</h3>
                    <p className="text-xs font-mono text-[#84807A] max-w-sm leading-relaxed">
                      לא נמצאו ידיעות המתאימות לסינון הנוכחי. נסה לבטל את הסינונים או לשנות את מילת המפתח.
                    </p>
                  </div>
                )}

              </div>

              {/* Dark Market Tracker Banner */}
              {!showBookmarksOnly && searchQuery === '' && (
                <div className="w-full">
                  <div className="max-w-[1200px] mx-auto">
                    <MarketTrackerBanner />
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB CONTENT: ARCHIVE & MODERATION HUB */}
          {activeTab === 'archive' && (
            <div className="w-full max-w-[1200px] mx-auto py-8 px-4 md:px-8">
              <ArchiveManager
                articles={articles}
                onUpdateArticleStatus={handleUpdateArticleStatus}
                onBatchApproveSource={handleBatchApproveSource}
                onSelectArticle={(id) => {
                  setSelectedArticleId(id);
                  setActiveTab('feed');
                }}
                showToast={showToast}
              />
            </div>
          )}

          {/* TAB CONTENT: TRENDS ANALYZER */}
          {activeTab === 'trends' && (
            <div className="w-full max-w-[1200px] mx-auto py-8 px-4 md:px-8">
              <TrendAnalyzer articles={articles} />
            </div>
          )}

          {/* TAB CONTENT: NEWS SUBMITTER */}
          {activeTab === 'submit' && (
            <div className="w-full max-w-[1200px] mx-auto py-8 px-4 md:px-8">
              <NewsSubmitter
                articles={articles}
                onAddArticle={handleAddArticle}
                onAddUpdate={handleAddUpdate}
                onNavigateToFeed={() => setActiveTab('feed')}
              />
            </div>
          )}

          {/* TAB CONTENT: USER HEALTH-TECH PROFILE */}
          {activeTab === 'profile' && (
            <div className="w-full max-w-[1200px] mx-auto py-8 px-4 md:px-8">
              <UserProfileView
                profile={userProfile}
                onUpdateProfile={setUserProfile}
              />
            </div>
          )}

        </div>

        {/* Footer (Vital Index style) */}
        <footer className="w-full bg-[#FAFAF7] border-t border-[#DEDAD1] py-8 px-6 md:px-10 text-[#84807A] font-mono text-xs flex flex-col md:flex-row justify-between items-center gap-4 max-w-[1200px] mx-auto">
          <span>© 2026 פולס-טק — תוכן, כושר וטכנולוגיה</span>
          <span>מערכת עיתונאית עצמאית בזמן אמת</span>
        </footer>

      </main>
    </div>
  );
}

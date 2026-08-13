'use client';
import { useState } from 'react';
import { Article, ArticleCategory, SectionCategory, AdminUser } from '../types';
import ArticleEditorModal from './ArticleEditorModal';
import CategoryManager from './CategoryManager';
import AILinkConverterBox from './AILinkConverterBox';
import ArchiveManager from './ArchiveManager';
import TrendAnalyzer from './TrendAnalyzer';
import {
  FileText,
  FolderTree,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Eye,
  LogOut,
  ShieldCheck,
  Search,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
} from 'lucide-react';

interface Props {
  user: AdminUser;
  articles: Article[];
  categories: SectionCategory[];
  onLogout: () => void;
  onUpdateArticle: (article: Article) => void;
  onDeleteArticle: (id: string) => void;
  onAddArticle: (article: Article) => void;
  onAddCategory: (category: SectionCategory) => void;
  onDeleteCategory: (id: string) => void;
  onSelectArticle: (id: string) => void;
  showToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function AdminDashboard({
  user,
  articles,
  categories,
  onLogout,
  onUpdateArticle,
  onDeleteArticle,
  onAddArticle,
  onAddCategory,
  onDeleteCategory,
  onSelectArticle,
  showToast,
}: Props) {
  const [adminTab, setAdminTab] = useState<'articles' | 'categories' | 'ai-tools' | 'moderation'>('articles');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'pending' | 'rejected'>('all');

  const filteredArticles = articles.filter(a => {
    const matchesSearch = searchQuery === '' || 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (a.status || 'published') === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenNewArticle = () => {
    setEditingArticle(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditArticle = (article: Article) => {
    setEditingArticle(article);
    setIsEditorOpen(true);
  };

  const handleSaveArticle = (savedArticle: Article) => {
    if (articles.some(a => a.id === savedArticle.id)) {
      onUpdateArticle(savedArticle);
      showToast('הכתבה עודכנה בהצלחה במערכת!', 'success');
    } else {
      onAddArticle(savedArticle);
      showToast('כתבה חדשה נוצרה ופורסמה בהצלחה!', 'success');
    }
  };

  const publishedCount = articles.filter(a => (a.status || 'published') === 'published').length;
  const pendingCount = articles.filter(a => (a.status || 'published') === 'pending').length;

  return (
    <div className="w-full bg-[#FAFAF7] text-[#14171C] select-none" dir="rtl">
      
      {/* Admin Top Status Banner */}
      <div className="bg-[#14171C] text-[#FAFAF7] px-6 md:px-10 py-4 border-b-2 border-[#EF4423]">
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 bg-[#7FD8A4] rounded-full animate-pulse" />
            <span className="font-bold text-white text-sm">מערכת ניהול תוכן CMS — פולס-טק</span>
            <span className="text-[#84807A]">|</span>
            <span className="text-[#7FD8A4] flex items-center gap-1">
              <ShieldCheck size={14} />
              {user.username} ({user.role === 'admin' ? 'מנהל ראשי' : 'עורך תוכן'})
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[#84807A]">כתבות באתר: {publishedCount}</span>
            <button
              onClick={onLogout}
              className="px-3 py-1 bg-[#EF4423] text-white hover:bg-white hover:text-[#14171C] font-bold transition-colors flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span>יציאה מהמערכת</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Dashboard Container */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 space-y-8">
        
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DEDAD1] pb-4">
          <div className="flex items-center gap-2 font-mono text-xs">
            {[
              { id: 'articles', label: 'ניהול ועריכת כתבות', icon: FileText, count: articles.length },
              { id: 'categories', label: 'ניהול מדורים ותחומים', icon: FolderTree, count: categories.length },
              { id: 'ai-tools', label: 'כלי AI ומאחורי הקלעים', icon: Sparkles },
              { id: 'moderation', label: 'מגמות ובקרת איכות', icon: TrendingUp },
            ].map((tab) => {
              const isActive = adminTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setAdminTab(tab.id as any)}
                  className={`px-4 py-2.5 flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-[#14171C] text-[#FAFAF7] font-bold'
                      : 'bg-[#FAFAF7] text-[#14171C] border border-[#DEDAD1] hover:border-[#14171C]'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-[#EF4423]' : 'text-[#84807A]'} />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className="mr-1 text-[11px] opacity-70">({tab.count})</span>
                  )}
                </button>
              );
            })}
          </div>

          {adminTab === 'articles' && (
            <button
              onClick={handleOpenNewArticle}
              className="px-5 py-2.5 bg-[#EF4423] text-white font-mono text-xs font-bold uppercase hover:bg-[#14171C] transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={15} />
              <span>יצירת כתבה חדשה</span>
            </button>
          )}
        </div>

        {/* TAB 1: ARTICLES MANAGEMENT & EDITOR TABLE */}
        {adminTab === 'articles' && (
          <div className="space-y-6">
            
            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#F0EEE9] p-4 border border-[#DEDAD1]">
              <div className="relative flex-1">
                <Search size={16} className="absolute right-3 top-3 text-[#84807A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FAFAF7] border border-[#DEDAD1] pr-10 pl-3 py-2 text-xs font-mono outline-none focus:border-[#14171C]"
                  placeholder="חפש כתבות לפי כותרת או שם מחבר..."
                />
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="text-[#84807A]">סינון לפי סטטוס:</span>
                {[
                  { id: 'all', label: 'הכל' },
                  { id: 'published', label: 'פורסמו' },
                  { id: 'pending', label: 'ממתינים' },
                  { id: 'rejected', label: 'בארכיון' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setStatusFilter(st.id as any)}
                    className={`px-3 py-1 font-mono transition-colors ${
                      statusFilter === st.id
                        ? 'bg-[#14171C] text-[#FAFAF7] font-bold'
                        : 'bg-[#FAFAF7] text-[#14171C] border border-[#DEDAD1]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles Table */}
            <div className="border border-[#DEDAD1] overflow-x-auto bg-[#FAFAF7]">
              <table className="w-full text-right border-collapse text-xs">
                <thead>
                  <tr className="bg-[#14171C] text-[#FAFAF7] font-mono border-b border-[#DEDAD1]">
                    <th className="p-3">כותרת הכתבה</th>
                    <th className="p-3">מדור</th>
                    <th className="p-3">מחבר / מקור</th>
                    <th className="p-3">תאריך עדכון</th>
                    <th className="p-3">סטטוס</th>
                    <th className="p-3 text-center">פעולות עריכה</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEDAD1]">
                  {filteredArticles.map((art) => {
                    const status = art.status || 'published';
                    return (
                      <tr key={art.id} className="hover:bg-[#F0EEE9] transition-colors">
                        <td className="p-3 font-bold text-[#14171C] max-w-[340px] truncate">
                          {art.title}
                        </td>
                        <td className="p-3 font-mono text-[#84807A]">
                          <span className="px-2 py-0.5 bg-[#F0EEE9] border border-[#DEDAD1] text-[#14171C]">
                            {art.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-[#555]">
                          {art.author} ({art.source})
                        </td>
                        <td className="p-3 font-mono text-[#84807A]">
                          {new Date(art.lastUpdated).toLocaleDateString('he-IL')}
                        </td>
                        <td className="p-3 font-mono">
                          {status === 'published' ? (
                            <span className="inline-flex items-center gap-1 text-[#1F5C52] font-bold">
                              <CheckCircle size={12} /> פורסם
                            </span>
                          ) : status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 text-[#EF4423] font-bold">
                              <Clock size={12} /> ממתין
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#84807A]">
                              <XCircle size={12} /> בארכיון
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenEditArticle(art)}
                              className="px-3 py-1 bg-[#14171C] text-[#FAFAF7] hover:bg-[#EF4423] font-mono font-bold transition-colors flex items-center gap-1"
                              title="ערוך כתבה זו"
                            >
                              <Edit2 size={12} />
                              <span>ערוך</span>
                            </button>

                            <button
                              onClick={() => onSelectArticle(art.id)}
                              className="p-1 text-[#84807A] hover:text-[#14171C] transition-colors"
                              title="צפה באתר"
                            >
                              <Eye size={14} />
                            </button>

                            <button
                              onClick={() => onDeleteArticle(art.id)}
                              className="p-1 text-[#84807A] hover:text-[#EF4423] transition-colors"
                              title="מחק כתבה"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: CATEGORY & SECTION MANAGER */}
        {adminTab === 'categories' && (
          <CategoryManager
            categories={categories}
            onAddCategory={onAddCategory}
            onDeleteCategory={onDeleteCategory}
          />
        )}

        {/* TAB 3: AI BACKOFFICE HUB */}
        {adminTab === 'ai-tools' && (
          <div className="space-y-8">
            <div className="bg-[#14171C] text-[#FAFAF7] p-6 border-b-2 border-[#EF4423]">
              <h2 className="text-xl font-bold font-mono flex items-center gap-2">
                <Sparkles size={18} className="text-[#EF4423]" />
                <span>כלי AI ומאחורי הקלעים</span>
              </h2>
              <p className="text-xs font-mono text-[#84807A] mt-1">
                המרת קישורים, ייבוא אוטומטי מפידים גלובליים ותרגום כתבות
              </p>
            </div>

            <AILinkConverterBox
              onArticleConverted={(newArt) => {
                onAddArticle(newArt);
                showToast('כתבה תורגמה והתווספה למערכת!', 'success');
              }}
              showToast={showToast}
            />

            <ArchiveManager
              articles={articles}
              onUpdateArticleStatus={(id, status) => {
                const target = articles.find(a => a.id === id);
                if (target) {
                  onUpdateArticle({ ...target, status });
                }
              }}
              onBatchApproveSource={() => {}}
              onSelectArticle={onSelectArticle}
              showToast={showToast}
            />
          </div>
        )}

        {/* TAB 4: TRENDS ANALYZER */}
        {adminTab === 'moderation' && (
          <TrendAnalyzer articles={articles} />
        )}

      </div>

      {/* Full Modal Article Editor */}
      <ArticleEditorModal
        isOpen={isEditorOpen}
        articleToEdit={editingArticle}
        categories={categories}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveArticle}
      />

    </div>
  );
}

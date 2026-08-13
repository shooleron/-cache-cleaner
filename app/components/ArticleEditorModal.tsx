'use client';
import { useState, useEffect } from 'react';
import { Article, ArticleCategory, SectionCategory } from '../types';
import { X, Save, Eye, Edit3, Image, Sparkles, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  articleToEdit: Article | null;
  categories: SectionCategory[];
  onClose: () => void;
  onSave: (article: Article) => void;
}

export default function ArticleEditorModal({
  isOpen,
  articleToEdit,
  categories,
  onClose,
  onSave,
}: Props) {
  const [formData, setFormData] = useState<Partial<Article>>({
    title: '',
    summary: '',
    content: '',
    category: 'health',
    author: 'מערכת פולס-טק',
    source: 'מערכת עיתונאית',
    imageUrl: '',
    impactScore: 9.0,
    scientificConfidence: 9.0,
    clinicalStage: 'אישור FDA / זמין בשוק',
    status: 'published',
  });

  const [activeView, setActiveView] = useState<'edit' | 'preview'>('edit');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (articleToEdit) {
      setFormData(articleToEdit);
    } else {
      setFormData({
        id: `custom-art-${Date.now()}`,
        title: '',
        summary: '',
        content: '',
        category: 'health',
        author: 'מערכת פולס-טק',
        source: 'מערכת עיתונאית',
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
        impactScore: 8.8,
        scientificConfidence: 9.0,
        clinicalStage: 'אישור FDA / זמין בשוק',
        publishedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        readTime: "4 דק' קריאה",
        physiologicalImpact: ['מערכת הניטור', 'הומיאוסטזיס'],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            title: 'יצירת הכתבה',
            description: 'הכתבה נוצרה ונערכה במערכת הניהול',
            timestamp: new Date().toISOString(),
            isNew: true,
          },
        ],
        status: 'published',
      });
    }
  }, [articleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    const wordCount = (formData.content || '').split(/\s+/).filter(Boolean).length;
    const computedReadTime = `${Math.max(2, Math.floor(wordCount / 100))} דק' קריאה`;

    const finalArticle: Article = {
      id: formData.id || `art-${Date.now()}`,
      title: formData.title || '',
      summary: formData.summary || formData.title || '',
      content: formData.content || '',
      category: (formData.category as ArticleCategory) || 'health',
      impactScore: Number(formData.impactScore) || 8.5,
      scientificConfidence: Number(formData.scientificConfidence) || 9.0,
      clinicalStage: formData.clinicalStage || 'אישור FDA / זמין בשוק',
      readTime: formData.readTime || computedReadTime,
      author: formData.author || 'עורך ראשי',
      source: formData.source || 'מערכת ניהול',
      publishedAt: formData.publishedAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      physiologicalImpact: formData.physiologicalImpact || ['מערכת העצבים'],
      timeline: formData.timeline || [],
      imageUrl: formData.imageUrl || '',
      status: formData.status || 'published',
    };

    onSave(finalArticle);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14171C]/80 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-fade-up" dir="rtl">
      <div className="max-w-[1000px] w-full h-[90vh] bg-[#FAFAF7] border border-[#DEDAD1] shadow-2xl flex flex-col overflow-hidden relative select-none">
        
        {/* Modal Header */}
        <div className="p-5 bg-[#FAFAF7] border-b border-[#DEDAD1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#14171C] text-[#EF4423] flex items-center justify-center">
              <Edit3 size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#14171C]">
                {articleToEdit ? 'עריכת כתבה קיימת במערכת' : 'יצירת כתבה חדשה'}
              </h2>
              <span className="text-xs font-mono text-[#84807A]">עורך תוכן CMS פולס-טק</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Toggle */}
            <div className="flex items-center bg-[#F0EEE9] p-1 border border-[#DEDAD1] font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveView('edit')}
                className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${
                  activeView === 'edit' ? 'bg-[#14171C] text-[#FAFAF7] font-bold' : 'text-[#84807A]'
                }`}
              >
                <Edit3 size={13} />
                <span>טופס עריכה</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('preview')}
                className={`px-3 py-1 flex items-center gap-1.5 transition-colors ${
                  activeView === 'preview' ? 'bg-[#14171C] text-[#FAFAF7] font-bold' : 'text-[#84807A]'
                }`}
              >
                <Eye size={13} />
                <span>תצוגה מקדימה</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-[#84807A] hover:bg-[#F0EEE9] hover:text-[#14171C] border border-[#DEDAD1]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeView === 'edit' ? (
            <form id="editor-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono font-bold text-[#14171C] mb-1">
                    כותרת הכתבה *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-[#FAFAF7] border border-[#DEDAD1] p-3 text-base font-bold outline-none focus:border-[#14171C]"
                    placeholder="הזן כותרת ראשית מעניינת..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#14171C] mb-1">
                    מדור / קטגוריה *
                  </label>
                  <select
                    value={formData.category || 'health'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ArticleCategory })}
                    className="w-full bg-[#FAFAF7] border border-[#DEDAD1] p-3 text-sm font-mono outline-none focus:border-[#14171C]"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name} ({cat.slug})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Summary / Excerpt */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#14171C] mb-1">
                  תקציר מנהלים (Excerpt / TL;DR)
                </label>
                <textarea
                  rows={2}
                  value={formData.summary || ''}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full bg-[#FAFAF7] border border-[#DEDAD1] p-3 text-sm outline-none focus:border-[#14171C]"
                  placeholder="תקציר קצר ב-2-3 משפטים המוצג בפיד..."
                />
              </div>

              {/* Main Content Body */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#14171C] mb-1">
                  תוכן הכתבה המלא (תמיכה בפסקאות ותת-כותרות ###) *
                </label>
                <textarea
                  rows={10}
                  required
                  value={formData.content || ''}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-[#FAFAF7] border border-[#DEDAD1] p-4 text-base leading-relaxed outline-none focus:border-[#14171C] font-normal"
                  placeholder="כתוב או הדבק את תוכן הכתבה כאן... (ניתן להוסיף תת-כותרות באמצעות ###)"
                />
                <span className="text-[11px] font-mono text-[#84807A] block mt-1">
                  ספירת מילים נוכחית: {(formData.content || '').split(/\s+/).filter(Boolean).length} מילים
                </span>
              </div>

              {/* Author, Source, Image URL */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#14171C] mb-1">
                    כותב / מחבר
                  </label>
                  <input
                    type="text"
                    value={formData.author || ''}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-[#FAFAF7] border border-[#DEDAD1] p-2.5 text-sm outline-none focus:border-[#14171C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#14171C] mb-1">
                    מקור הכתבה
                  </label>
                  <input
                    type="text"
                    value={formData.source || ''}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full bg-[#FAFAF7] border border-[#DEDAD1] p-2.5 text-sm outline-none focus:border-[#14171C]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-[#14171C] mb-1">
                    סטטוס פרסום
                  </label>
                  <select
                    value={formData.status || 'published'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-[#FAFAF7] border border-[#DEDAD1] p-2.5 text-sm font-mono outline-none focus:border-[#14171C]"
                  >
                    <option value="published">פורסם באתר (Published)</option>
                    <option value="pending">ממתין לאישור (Pending)</option>
                    <option value="rejected">בארכיון / נדחה (Archived)</option>
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#14171C] mb-1">
                  קישור לתמונה ראשית (Image URL)
                </label>
                <div className="relative">
                  <Image size={16} className="absolute right-3 top-3 text-[#84807A]" />
                  <input
                    type="text"
                    value={formData.imageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-[#FAFAF7] border border-[#DEDAD1] pr-10 pl-3 py-2.5 text-xs font-mono outline-none focus:border-[#14171C]"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

            </form>
          ) : (
            /* Live Preview Mode */
            <div className="space-y-6 max-w-[700px] mx-auto text-right">
              <div className="bg-[#EF4423] text-white font-mono text-xs p-3 font-bold flex items-center justify-between">
                <span>תצוגה מקדימה - איך הכתבה תראה באתר</span>
                <Sparkles size={14} />
              </div>

              {formData.imageUrl && (
                <div className="w-full h-64 overflow-hidden border border-[#DEDAD1]">
                  <img src={formData.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <h1 className="text-3xl font-black text-[#14171C]">{formData.title || 'כותרת הכתבה'}</h1>

              <div className="text-xs font-mono text-[#84807A]">
                מאת {formData.author} · מקור: {formData.source}
              </div>

              <div className="bg-[#F0EEE9] p-4 border-r-4 border-r-[#EF4423] border border-[#DEDAD1] text-sm">
                {formData.summary}
              </div>

              <div className="text-base leading-relaxed text-[#3a3a3a] space-y-4">
                {(formData.content || '').split(/\n\n+/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#FAFAF7] border-t border-[#DEDAD1] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-[#F0EEE9] text-[#14171C] font-mono text-xs font-bold hover:bg-[#DEDAD1] border border-[#DEDAD1]"
          >
            ביטול
          </button>

          <button
            type="submit"
            form="editor-form"
            className="px-6 py-2.5 bg-[#EF4423] text-white font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#14171C] transition-colors flex items-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check size={16} />
                <span>נשמר בהצלחה!</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>שמור ופרסם כתבה</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}

'use client';
import { useState } from 'react';
import { SectionCategory } from '../types';
import { FolderPlus, Tag, Edit2, Trash2, Check, Plus } from 'lucide-react';

interface Props {
  categories: SectionCategory[];
  onAddCategory: (category: SectionCategory) => void;
  onDeleteCategory: (id: string) => void;
}

export default function CategoryManager({
  categories,
  onAddCategory,
  onDeleteCategory,
}: Props) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    onAddCategory({
      id: `cat-${Date.now()}`,
      name,
      slug: slug.toLowerCase().trim().replace(/\s+/g, '-'),
      description: description || 'מדור תוכן עיתונאי במערכת',
      articleCount: 0,
    });

    setName('');
    setSlug('');
    setDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-[#FAFAF7] border border-[#DEDAD1] p-6 space-y-6 select-none" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#DEDAD1] pb-5">
        <div>
          <h2 className="text-xl font-bold text-[#14171C]">ניהול מדורים ותחומי עניין</h2>
          <p className="text-xs font-mono text-[#84807A] mt-1">
            הגדרת המדורים באתר, חלוקת נושאים וסיווג תכנים
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-[#14171C] text-[#FAFAF7] hover:bg-[#EF4423] font-mono text-xs font-bold transition-colors flex items-center gap-2 self-start md:self-auto"
        >
          <Plus size={14} />
          <span>הוסף מדור חדש</span>
        </button>
      </div>

      {/* Add New Category Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#F0EEE9] border border-[#DEDAD1] p-5 space-y-4 animate-fade-up">
          <h3 className="text-sm font-bold text-[#14171C] font-mono flex items-center gap-2">
            <FolderPlus size={16} className="text-[#EF4423]" />
            <span>הגדרת מדור חדש</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#14171C] mb-1">
                שם המדור בעברית *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#DEDAD1] p-2.5 text-sm font-bold outline-none focus:border-[#14171C]"
                placeholder="למשל: גאדג'טים לבישים"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#14171C] mb-1">
                מזהה אנגלית (Slug) *
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#FAFAF7] border border-[#DEDAD1] p-2.5 text-xs font-mono outline-none focus:border-[#14171C]"
                placeholder="wearables"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#14171C] mb-1">
              תיאור קצר של המדור
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FAFAF7] border border-[#DEDAD1] p-2.5 text-xs outline-none focus:border-[#14171C]"
              placeholder="תיאור המדור והתכנים המשוייכים אליו..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-[#FAFAF7] text-[#14171C] border border-[#DEDAD1] font-mono text-xs"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#EF4423] text-white font-mono text-xs font-bold uppercase hover:bg-[#14171C] transition-colors"
            >
              שמור מדור
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-5 bg-[#FAFAF7] border border-[#DEDAD1] flex flex-col justify-between hover:border-[#14171C] transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs bg-[#14171C] text-[#FAFAF7] px-2.5 py-1 font-bold">
                  {cat.name}
                </span>
                <span className="font-mono text-[11px] text-[#84807A]">
                  slug: {cat.slug}
                </span>
              </div>
              <p className="text-xs text-[#555] leading-relaxed mb-4">
                {cat.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#DEDAD1] flex items-center justify-between text-xs font-mono text-[#84807A]">
              <span>כתבות במדור: {cat.articleCount || 0}</span>
              {categories.length > 2 && (
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  title="מחק מדור"
                  className="text-[#84807A] hover:text-[#EF4423] transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

'use client';
import { Article, ArticleCategory } from '../types';
import { ArrowLeft } from 'lucide-react';

interface Props {
  article: Article;
  onSelect: () => void;
  secondaryArticles?: Article[];
  onSelectArticle?: (id: string) => void;
}

const CATEGORY_NAMES: Record<ArticleCategory, string> = {
  health: 'בריאות דיגיטלית',
  sports: 'כושר וספורט',
  nutrition: 'תזונה',
  body: 'אריכות ימים',
};

export default function BaitVenoyHeroCard({ article, onSelect, secondaryArticles = [], onSelectArticle }: Props) {
  return (
    <section className="bg-[#FAFAF7] border-b border-[#DEDAD1] overflow-hidden dir-rtl select-none" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr]">
        
        {/* Main Hero Story */}
        <div 
          onClick={onSelect}
          className="p-8 md:p-14 lg:border-l border-[#DEDAD1] cursor-pointer group hover:bg-[#F0EEE9] transition-colors"
        >
          <span className="font-mono text-xs text-[#EF4423] tracking-[1.5px] uppercase font-semibold block mb-4">
            כתבת השער · {CATEGORY_NAMES[article.category]}
          </span>
          
          <h1 className="text-3xl md:text-5xl font-black text-[#14171C] leading-[1.08] tracking-tight mb-6 group-hover:text-[#EF4423] transition-colors">
            {article.title}
          </h1>

          {/* Hero Banner Image */}
          {article.imageUrl && (
            <div className="w-full h-[260px] md:h-[340px] overflow-hidden mb-6 border border-[#DEDAD1] bg-[#F0EEE9]">
              <img
                src={article.imageUrl}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          )}

          <p className="text-base md:text-lg text-[#3a3a3a] leading-relaxed max-w-2xl mb-6">
            {article.summary}
          </p>

          <div className="flex flex-wrap items-center gap-5 text-xs text-[#84807A] font-mono border-t border-[#DEDAD1] pt-4">
            <span>מאת {article.author}</span>
            <span>·</span>
            <span>{article.readTime}</span>
            <span>·</span>
            <span>מקור: {article.source}</span>
          </div>
        </div>

        {/* Hero Side Column — Also in this issue */}
        <div className="p-8 md:p-14 flex flex-col justify-between bg-[#FAFAF7]">
          <div>
            <span className="font-mono text-xs font-bold tracking-[1px] text-[#84807A] uppercase block mb-6">
              מבזקים והתפתחויות אחרונות
            </span>

            <div className="space-y-0">
              {secondaryArticles.slice(0, 3).map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onSelectArticle ? onSelectArticle(item.id) : onSelect()}
                  className="py-5 border-b border-[#DEDAD1] last:border-b-0 cursor-pointer group hover:opacity-80 transition-opacity"
                >
                  <h4 className="text-base font-bold text-[#14171C] leading-snug mb-2 group-hover:text-[#EF4423] transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-[#84807A] font-mono">
                    <span className="px-2 py-0.5 bg-[#14171C] text-[#FAFAF7] text-[10px]">
                      {CATEGORY_NAMES[item.category]}
                    </span>
                    <span>{item.readTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-[#DEDAD1] mt-6">
            <button 
              onClick={onSelect}
              className="w-full py-3.5 bg-[#14171C] text-[#FAFAF7] hover:bg-[#EF4423] text-xs font-mono font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>קרא את כתבת השער המלאה</span>
              <ArrowLeft size={14} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

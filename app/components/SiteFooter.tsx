'use client';

import Link from 'next/link';
import { Activity, ArrowUpLeft, BookOpen, Mail, ShieldCheck } from 'lucide-react';
import type { ArticleCategory } from '../types';
import { CATEGORY_META } from '@/lib/categories';

export default function SiteFooter({ onSelectCategory, onNavigate }: {
  onSelectCategory: (category: ArticleCategory | 'all') => void;
  onNavigate: (tab: string) => void;
}) {
  const navigateHome = (category: ArticleCategory | 'all' = 'all') => {
    onNavigate('feed');
    onSelectCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="mt-16 bg-[#071b20] text-white" dir="rtl">
      <div className="border-b border-white/10">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-6 py-10 md:grid-cols-[1fr_auto] md:items-center md:px-10">
          <div className="max-w-2xl">
            <div className="text-xs font-black tracking-[.18em] text-[#b9f227]">ידע שימושי. מדע אמין. חיים טובים יותר.</div>
            <h2 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">החיבור בין גוף האדם, נפש האדם וטכנולוגיה</h2>
            <p className="mt-3 text-sm leading-7 text-white/60">אנחנו מאתרים מחקרים, כלים וטכנולוגיות חדשות בעולם הוולנס ומנגישים אותם בעברית ברורה — עם מקורות, הקשר וערך שאפשר לקחת לחיים.</p>
          </div>
          <Link href="/glossary" className="inline-flex w-fit items-center gap-3 bg-[#b9f227] px-5 py-3.5 text-sm font-black text-[#071b20] transition hover:bg-white">
            <BookOpen size={18} />למילון המושגים<ArrowUpLeft size={16} />
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1280px] gap-10 px-6 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] md:px-10">
        <div>
          <button onClick={() => navigateHome()} className="flex items-center gap-3 text-right">
            <span className="grid h-11 w-11 place-items-center bg-white text-[#071b20]"><Activity size={21} /></span>
            <span><strong className="block text-xl font-black">פולס-טק</strong><small className="text-[10px] font-bold tracking-[.16em] text-white/40">WELLNESS TECH MAGAZINE</small></span>
          </button>
          <p className="mt-5 max-w-xs text-sm leading-7 text-white/50">מגזין עברי עצמאי לתוכן מבוסס ראיות בתחומי הבריאות, הביצועים, התזונה ואריכות החיים.</p>
          <div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-300"><ShieldCheck size={15} />המקורות והקרדיטים מוצגים בכל כתבה</div>
        </div>

        <nav aria-label="קטגוריות בפוטר">
          <h3 className="text-sm font-black text-white">קטגוריות</h3>
          <div className="mt-5 space-y-3">
            {Object.entries(CATEGORY_META).map(([key, category]) => (
              <button key={key} onClick={() => navigateHome(key as ArticleCategory)} className="flex items-center gap-2 text-sm text-white/55 transition hover:text-white">
                <span className={`h-2 w-2 rounded-full ${category.dot}`} />{category.label}
              </button>
            ))}
          </div>
        </nav>

        <nav aria-label="תפריט שימושי בפוטר">
          <h3 className="text-sm font-black text-white">תפריט</h3>
          <div className="mt-5 flex flex-col items-start gap-3 text-sm text-white/55">
            <button onClick={() => navigateHome()} className="transition hover:text-white">עמוד הבית</button>
            <button onClick={() => { onNavigate('trends'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="transition hover:text-white">מגמות</button>
            <button onClick={() => { onNavigate('archive'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="transition hover:text-white">ארכיון כתבות</button>
            <Link href="/glossary" className="transition hover:text-white">מילון מושגים</Link>
            <Link href="/admin/login" className="transition hover:text-white">כניסה למערכת הניהול</Link>
          </div>
        </nav>

        <div>
          <h3 className="text-sm font-black text-white">יש נושא שכדאי שנבדוק?</h3>
          <p className="mt-5 text-sm leading-6 text-white/50">שלחו לנו מחקר, טכנולוגיה או שאלה שמעניינת אתכם ונבחן אותה לכתבה עתידית.</p>
          <button onClick={() => { onNavigate('submit'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mt-5 inline-flex items-center gap-2 border border-white/20 px-4 py-3 text-sm font-bold transition hover:border-[#b9f227] hover:text-[#b9f227]">
            <Mail size={16} />הצעת נושא למערכת
          </button>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-6 py-5 text-[11px] text-white/35 sm:flex-row sm:items-center sm:justify-between md:px-10">
          <span>© {new Date().getFullYear()} פולס-טק. כל הזכויות שמורות.</span>
          <span>המידע באתר אינו תחליף לייעוץ רפואי מקצועי.</span>
        </div>
      </div>
    </footer>
  );
}

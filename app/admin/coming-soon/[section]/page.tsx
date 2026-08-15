import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';

const sections: Record<string, { title: string; description: string; phase: string }> = {
  video: { title: 'כתבות מצולמות', description: 'ניהול סרטונים, פרקים, תמלולים ותמונות קאבר.', phase: 'שלב 3' },
  pages: { title: 'עמודים קבועים', description: 'עמודי אודות, צור קשר, מדיניות ותוכן מערכתי.', phase: 'שלב 3' },
  glossary: { title: 'מילון, מותגים ומשפיענים', description: 'יצירת ערכי SEO וקישור אוטומטי שלהם מתוך הכתבות.', phase: 'שלב 2' },
  campaigns: { title: 'באנרים וקמפיינים', description: 'ניהול מיקומים, תאריכים, קריאייטיב וקישורי קמפיין.', phase: 'שלב 2' },
  community: { title: 'תגובות ודירוגים', description: 'אישור תגובות, טיפול בדיווחים וניתוח אהבתי או לא אהבתי.', phase: 'שלב 3' },
  analytics: { title: 'נתונים וביצועים', description: 'כניסות, מקורות תנועה, כתבות מובילות וביצועי הפצה.', phase: 'שלב 2' },
  users: { title: 'משתמשים והרשאות', description: 'ניהול אדמינים, עורכים ותפקידי מערכת.', phase: 'שלב 3' },
  settings: { title: 'הגדרות מערכת', description: 'שם האתר, פרטי מותג, חיבורים וכללי פרסום.', phase: 'שלב 3' },
};

export default async function ComingSoonPage({ params }: { params: Promise<{ section: string }> }) {
  await requireAdmin();
  const { section } = await params;
  const item = sections[section];
  if (!item) notFound();

  return <main className="px-5 py-8 sm:px-8" dir="rtl"><div className="mx-auto max-w-6xl">
    <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
      <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-900">{item.phase} · בתכנון</span>
      <h1 className="mt-5 text-3xl font-black sm:text-4xl">{item.title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{item.description}</p>
      <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">המעטפת והניווט למסך מוכנים. הפעולות והנתונים של המודול יתווספו בשלב המוצג למעלה.</div>
      <Link href="/admin" className="mt-7 inline-block rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">חזרה ללוח הבקרה</Link>
    </div>
  </div></main>;
}

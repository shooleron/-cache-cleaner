import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { createSource } from '../actions';

export default async function NewSourcePage() {
  await requireAdmin();
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8" dir="rtl">
      <div className="mx-auto max-w-2xl">
        <Link href="/admin/sources" className="text-sm font-bold text-teal-700">← חזרה למקורות</Link>
        <h1 className="mt-3 text-3xl font-black text-slate-950">הוספת מקור מידע</h1>
        <form action={createSource} className="mt-7 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <label className="block text-sm font-bold">שם המקור<input name="name" required placeholder="לדוגמה: Nature Medicine" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
          <label className="block text-sm font-bold">כתובת האתר<input name="url" type="url" required placeholder="https://..." dir="ltr" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-left font-normal" /></label>
          <label className="block text-sm font-bold">כתובת פיד RSS / Atom<input name="feed_url" type="url" required placeholder="https://example.com/feed/" dir="ltr" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-left font-normal" /><span className="mt-2 block text-xs font-normal text-slate-500">המנוע סורק את הפיד בלבד ולא מפרסם ישירות.</span></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-bold">סוג מקור<select name="source_type" defaultValue="publication" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"><option value="publication">מגזין / אתר</option><option value="research">מחקר</option><option value="journal">כתב עת מדעי</option><option value="institution">מוסד</option><option value="social">רשת חברתית</option></select></label>
            <label className="block text-sm font-bold">ציון אמינות (1–10)<input name="trust_score" type="number" min="1" max="10" step="0.5" defaultValue="7" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-bold">שפת המקור<select name="language" defaultValue="en" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"><option value="en">אנגלית</option><option value="he">עברית</option><option value="es">ספרדית</option><option value="de">גרמנית</option><option value="fr">צרפתית</option></select></label>
            <label className="block text-sm font-bold">סריקה בכל כמה שעות<input name="scan_interval_hours" type="number" min="1" max="168" defaultValue="24" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
          </div>
          <label className="block text-sm font-bold">נושאים מועדפים<input name="topics" placeholder="longevity, nutrition, wearables" dir="ltr" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-left font-normal" /><span className="mt-2 block text-xs font-normal text-slate-500">הפרידו בין נושאים בפסיקים.</span></label>
          <button className="rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">שמירת המקור</button>
        </form>
      </div>
    </main>
  );
}

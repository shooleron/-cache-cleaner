import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { createArticle } from '../actions';
import { CATEGORY_META } from '@/lib/categories';

export default async function NewArticlePage() {
  await requireAdmin();
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8" dir="rtl">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/articles" className="text-sm font-bold text-teal-700">← חזרה לכתבות</Link>
        <h1 className="mt-3 text-3xl font-black text-slate-950">יצירת כתבה</h1>
        <form action={createArticle} className="mt-7 space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
          <label className="block text-sm font-bold">כותרת<input name="title" required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-bold">מדור<select name="category" required defaultValue="health" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal">{Object.entries(CATEGORY_META).map(([value, category]) => <option key={value} value={value}>{category.label}</option>)}</select></label>
            <label className="block text-sm font-bold">סטטוס<select name="status" defaultValue="draft" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"><option value="draft">טיוטה</option><option value="reviewing">בבדיקה</option><option value="published">פרסום מידי</option></select></label>
          </div>
          <label className="block text-sm font-bold">תקציר<textarea name="summary" required rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /></label>
          <label className="block text-sm font-bold">גוף הכתבה<textarea name="body" required rows={16} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal leading-7" /></label>
          <button className="rounded-xl bg-slate-950 px-6 py-3 font-bold text-white">שמירת הכתבה</button>
        </form>
      </div>
    </main>
  );
}

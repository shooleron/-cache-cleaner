import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { updateArticleStatus } from './actions';
import { CATEGORY_META, getCategoryMeta } from '@/lib/categories';

const statusLabels: Record<string, string> = {
  collected: 'נאספה', reviewing: 'בבדיקה', draft: 'טיוטה', scheduled: 'מתוזמנת', published: 'פורסמה', rejected: 'נדחתה',
};

export default async function ArticlesAdminPage() {
  const { supabase } = await requireAdmin();
  const { data: articles } = await supabase
    .from('articles')
    .select('id,title,category,status,updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><Link href="/admin" className="text-sm font-bold text-teal-700">← לוח ניהול</Link><h1 className="mt-2 text-3xl font-black text-slate-950">ניהול כתבות</h1></div>
          <Link href="/admin/articles/new" className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">כתבה חדשה</Link>
        </div>

        <div className="mt-5 flex flex-wrap gap-2" aria-label="מקרא צבעי קטגוריות">
          {Object.entries(CATEGORY_META).map(([key, category]) => (
            <span key={key} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ring-1 ring-inset ${category.surface}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${category.dot}`} />{category.label}
            </span>
          ))}
        </div>

        <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {!articles?.length ? (
            <div className="p-12 text-center"><h2 className="text-xl font-black">עדיין אין כתבות ב־CMS</h2><p className="mt-2 text-sm">אפשר ליצור כתבה ידנית או לקלוט אותה מאייג׳נט בהמשך.</p></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {articles.map((article) => {
                const category = getCategoryMeta(article.category);
                return (
                <article key={article.id} className={`grid gap-4 border-r-4 p-5 md:grid-cols-[1fr_160px_190px] md:items-center ${category.border}`}>
                  <div><Link href={`/admin/articles/${article.id}`} className="font-black text-slate-950 hover:text-teal-700">{article.title}</Link><div className="mt-2 flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ring-inset ${category.surface}`}><span className={`h-2 w-2 rounded-full ${category.dot}`} />{category.label}</span><span className="text-xs text-slate-500">עודכן {new Intl.DateTimeFormat('he-IL').format(new Date(article.updated_at))} · ניהול קרדיטים</span></div></div>
                  <span className="w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800">{statusLabels[article.status]}</span>
                  <form action={updateArticleStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={article.id} />
                    <select name="status" defaultValue={article.status} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm">
                      {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold">שמירה</button>
                  </form>
                </article>
              )})}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import { attachSource, detachSource, saveArticle } from './actions';
import { CATEGORY_META, getCategoryMeta } from '@/lib/categories';

const categoryLabels = Object.fromEntries(Object.entries(CATEGORY_META).map(([value, meta]) => [value, meta.label]));

const statusLabels: Record<string, string> = {
  collected: 'נאספה', reviewing: 'בבדיקה', draft: 'טיוטה', scheduled: 'מתוזמנת', published: 'פורסמה', rejected: 'נדחתה',
};

export default async function ArticleEditorPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: article }, { data: sources }, { data: credits }] = await Promise.all([
    supabase.from('articles').select('*').eq('id', id).maybeSingle(),
    supabase.from('sources').select('id,name,url,trust_score').eq('active', true).order('name'),
    supabase.from('article_sources').select('source_id,source_url,citation_label,is_primary,sources(name,trust_score)').eq('article_id', id),
  ]);
  if (!article) notFound();

  const save = saveArticle.bind(null, article.id);
  const addCredit = attachSource.bind(null, article.id);
  const removeCredit = detachSource.bind(null, article.id);
  const wordCount = article.body.trim().split(/\s+/).filter(Boolean).length;
  const categoryMeta = getCategoryMeta(article.category);

  return <main className="min-h-screen bg-slate-50 px-5 py-8" dir="rtl">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><Link href="/admin/articles" className="text-sm font-bold text-teal-700">← חזרה לכתבות</Link><h1 className="mt-2 text-3xl font-black text-slate-950">עריכת כתבה</h1></div>
        <div className="flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-black ring-1 ring-inset ${categoryMeta.surface}`}><span className={`h-2.5 w-2.5 rounded-full ${categoryMeta.dot}`} />{categoryMeta.label}</span><span className="rounded-full bg-teal-50 px-3 py-2 text-xs font-bold text-teal-800">{statusLabels[article.status] ?? article.status}</span><span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-600">{wordCount} מילים</span></div>
      </div>

      {(query.saved || query.generated) && <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">{query.generated ? 'הטיוטה נוצרה ונשמרה. עכשיו אפשר לערוך ולבדוק אותה.' : 'השינויים נשמרו בהצלחה.'}</div>}
      {query.error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">השמירה נכשלה: {query.error}</div>}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_350px]">
        <form action={save} className="space-y-6">
          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <div><p className="text-xs font-black text-teal-700">תוכן הכתבה</p><h2 className="mt-1 text-xl font-black">עריכה בעברית</h2></div>
            <label className="block text-sm font-bold">כותרת<input name="title" defaultValue={article.title} required className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-black" /></label>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-bold">מדור<select name="category" defaultValue={article.category} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal">{Object.entries(categoryLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label className="block text-sm font-bold">רמת ביסוס<select name="evidence_level" defaultValue={article.evidence_level ?? 'limited'} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal"><option value="high">גבוהה</option><option value="medium">בינונית</option><option value="limited">מוגבלת</option></select></label>
            </div>
            <label className="block text-sm font-bold">תקציר<textarea name="summary" defaultValue={article.summary} required rows={4} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal leading-7" /></label>
            <label className="block text-sm font-bold">גוף הכתבה<textarea name="body" defaultValue={article.body} required rows={28} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-4 font-normal leading-8" /><span className="mt-2 block text-xs font-normal text-slate-500">כותרות משנה מתחילות ב־##. יעד מומלץ: 450–650 מילים.</span></label>
          </section>

          <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <div><p className="text-xs font-black text-violet-700">נראות וחיפוש</p><h2 className="mt-1 text-xl font-black">SEO ותמונת קאבר</h2></div>
            <label className="block text-sm font-bold">כותרת SEO<input name="seo_title" defaultValue={article.seo_title ?? ''} maxLength={60} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">עד 60 תווים</span></label>
            <label className="block text-sm font-bold">תיאור מטא<textarea name="seo_description" defaultValue={article.seo_description ?? ''} maxLength={155} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">עד 155 תווים</span></label>
            <label className="block text-sm font-bold">כתובת תמונת קאבר<input name="cover_image_url" type="url" dir="ltr" defaultValue={article.cover_image_url ?? ''} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-left font-normal" /></label>
            {article.cover_image_url && <div className="aspect-[16/7] overflow-hidden rounded-2xl bg-slate-100"><img src={article.cover_image_url} alt="תצוגה מקדימה של הקאבר" className="h-full w-full object-cover" /></div>}
          </section>

          <div className="sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
            <p className="text-xs text-slate-500">השמירה אינה מפרסמת את הכתבה באתר.</p>
            <div className="flex gap-2"><button name="status" value="draft" className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-black">שמירה כטיוטה</button><button name="status" value="reviewing" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">העברה לבדיקה</button></div>
          </div>
        </form>

        <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-black">מקורות וקרדיטים</h2>
            <p className="mt-1 text-xs text-slate-500">לא ניתן לפרסם כתבה ללא מקור.</p>
            <div className="mt-4 space-y-3">{!credits?.length ? <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">עדיין לא חובר מקור.</p> : credits.map((credit) => {
              const source = Array.isArray(credit.sources) ? credit.sources[0] : credit.sources;
              return <div key={`${credit.source_id}-${credit.source_url}`} className="rounded-xl border border-slate-100 p-4"><div className="font-bold">{source?.name ?? 'מקור'}</div><a href={credit.source_url} target="_blank" rel="noreferrer" dir="ltr" className="mt-1 block truncate text-left text-xs text-slate-500 underline">{credit.source_url}</a><div className="mt-2 text-xs">{credit.citation_label || 'ללא תווית'} {credit.is_primary ? '· ראשי' : ''}</div><form action={removeCredit} className="mt-3"><input type="hidden" name="source_id" value={credit.source_id} /><button className="text-xs font-bold text-red-700">הסרת הקרדיט</button></form></div>;
            })}</div>
          </section>

          <form action={addCredit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-black">הוספת מקור</h2>
            <label className="block text-sm font-bold">מקור<select name="source_id" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal"><option value="">בחירת מקור</option>{sources?.map((source) => <option key={source.id} value={source.id}>{source.name} — {source.trust_score}</option>)}</select></label>
            <label className="block text-sm font-bold">קישור מדויק<input name="source_url" type="url" dir="ltr" placeholder="https://..." className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-left font-normal" /></label>
            <label className="block text-sm font-bold">תווית קרדיט<input name="citation_label" placeholder="למשל: מחקר קליני" className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal" /></label>
            <label className="flex items-center gap-2 text-sm font-bold"><input name="is_primary" type="checkbox" className="size-4" /> מקור ראשי</label>
            <button className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-black text-white">הוספת המקור</button>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 text-xs text-slate-500">
            <div>Slug: <span dir="ltr">{article.slug}</span></div><div className="mt-2">עודכן: {new Date(article.updated_at).toLocaleString('he-IL')}</div>
          </section>
        </aside>
      </div>
    </div>
  </main>;
}

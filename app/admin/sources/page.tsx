import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { toggleSource } from './actions';

const sourceTypeLabels: Record<string, string> = {
  publication: 'מגזין / אתר', research: 'מחקר', institution: 'מוסד', journal: 'כתב עת', social: 'רשת חברתית',
};

export default async function SourcesPage() {
  const { supabase } = await requireAdmin();
  const { data: sources } = await supabase.from('sources').select('*').order('trust_score', { ascending: false });

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8" dir="rtl">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><Link href="/admin" className="text-sm font-bold text-teal-700">← לוח ניהול</Link><h1 className="mt-2 text-3xl font-black text-slate-950">מקורות מידע</h1><p className="mt-2 text-sm">מאגר המקורות המאומתים שמהם המערכת והאייג׳נטים רשאים לאסוף תוכן.</p></div>
          <Link href="/admin/sources/new" className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">מקור חדש</Link>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {!sources?.length ? <p className="rounded-2xl border border-slate-200 bg-white p-8">עדיין לא נוספו מקורות.</p> : sources.map((source) => (
            <article key={source.id} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-lg font-black text-slate-950">{source.name}</h2><div className="mt-1 text-xs font-bold text-teal-700">{sourceTypeLabels[source.source_type] ?? source.source_type}</div></div>
                <div className="rounded-xl bg-slate-950 px-3 py-2 text-center text-white"><div className="text-lg font-black">{source.trust_score}</div><div className="text-[10px]">אמינות</div></div>
              </div>
              <a href={source.url} target="_blank" rel="noreferrer" dir="ltr" className="mt-4 block truncate text-left text-sm text-slate-500 underline">{source.url}</a>
              <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                <div className="truncate" dir="ltr">RSS: {source.feed_url || 'לא הוגדר'}</div>
                <div className="mt-2">סריקה: כל {source.scan_interval_hours} שעות · שפה: {source.language}</div>
                <div className="mt-1">סטטוס אחרון: {source.last_scan_status ?? 'טרם נסרק'}{source.items_last_scan ? ` · ${source.items_last_scan} חדשים` : ''}</div>
                {source.last_scan_error && <div className="mt-1 text-red-700">{source.last_scan_error}</div>}
              </div>
              <form action={toggleSource} className="mt-5">
                <input type="hidden" name="id" value={source.id} /><input type="hidden" name="active" value={String(!source.active)} />
                <button className={`rounded-lg px-3 py-2 text-xs font-bold ${source.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{source.active ? 'פעיל — לחצו להשבתה' : 'לא פעיל — לחצו להפעלה'}</button>
              </form>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

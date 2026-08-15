import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { runNow } from './actions';

export default async function IngestionPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const { supabase } = await requireAdmin();
  const params = await searchParams;
  const [{ data: items }, { data: lastRun }] = await Promise.all([
    supabase.from('ingestion_items').select('id,raw_title,source_url,status,agent_score,published_at,discovered_at,sources(name)').order('discovered_at', { ascending: false }).limit(100),
    supabase.from('agent_runs').select('status,started_at,finished_at,output,error').eq('job_type', 'source_scan').order('started_at', { ascending: false }).limit(1).maybeSingle(),
  ]);

  return <main className="min-h-screen bg-slate-50 px-5 py-8" dir="rtl"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><Link href="/admin" className="text-sm font-bold text-teal-700">← לוח ניהול</Link><h1 className="mt-2 text-3xl font-black">מנוע איסוף התוכן</h1><p className="mt-2 text-sm text-slate-600">כתבות נאספות לתור בדיקה בלבד. שום תוכן לא מתפרסם אוטומטית.</p></div>
      <form action={runNow}><button className="rounded-xl bg-slate-950 px-5 py-3 font-bold text-white">סריקה עכשיו</button></form>
    </div>
    {params.run && <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">הסריקה הסתיימה: {params.queued ?? 0} פריטים חדשים, {params.errors ?? 0} שגיאות.</div>}
    {params.error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">לא ניתן להפעיל: {params.error}</div>}
    {lastRun && <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 text-sm"><b>ריצה אחרונה:</b> {lastRun.status} · {new Date(lastRun.started_at).toLocaleString('he-IL')}</div>}
    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {!items?.length ? <p className="p-8">התור עדיין ריק. הוסיפו מקור עם כתובת RSS והפעילו סריקה.</p> : <div className="divide-y divide-slate-100">{items.map((item) => {
        const source = Array.isArray(item.sources) ? item.sources[0] : item.sources;
        return <article key={item.id} className="grid gap-3 p-5 md:grid-cols-[1fr_130px_110px] md:items-center">
          <div><Link href={`/admin/ingestion/${item.id}`} className="font-black text-slate-950 hover:text-teal-700">{item.raw_title || 'ללא כותרת'}</Link><p className="mt-1 text-xs text-slate-500">{source?.name ?? 'מקור לא ידוע'} · {new Date(item.published_at ?? item.discovered_at).toLocaleDateString('he-IL')}</p></div>
          <div className="text-sm font-bold">ציון {Math.round((item.agent_score ?? 0) * 100)}</div>
          <div className={`rounded-lg px-3 py-2 text-center text-xs font-bold ${item.status === 'reviewing' ? 'bg-emerald-50 text-emerald-700' : item.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-800'}`}>{item.status === 'reviewing' ? 'מומלץ לבדיקה' : item.status === 'rejected' ? 'נדחה' : 'נאסף'}</div>
        </article>;
      })}</div>}
    </div>
  </div></main>;
}

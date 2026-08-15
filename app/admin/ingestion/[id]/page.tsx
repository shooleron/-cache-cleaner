import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Json } from '@/lib/database.types';
import { requireAdmin } from '@/lib/auth/admin';
import { generateDraft, updateIngestionDecision } from './actions';

type QualityDetails = {
  matchedTopics?: string[];
  evidenceSignals?: string[];
  ageDays?: number;
  trust?: number;
  relevance?: number;
  evidence?: number;
  freshness?: number;
};

const topicLabels: Record<string, string> = { body: 'גוף', mind: 'נפש', technology: 'טכנולוגיה' };

function qualityDetails(value: Json): QualityDetails {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as QualityDetails : {};
}

function metric(value: number | undefined) {
  return Math.round((value ?? 0) * 100);
}

export default async function IngestionReviewPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: item }, { data: generatedArticle }] = await Promise.all([
    supabase.from('ingestion_items').select('*,sources(id,name,url,source_type,trust_score,language)').eq('id', id).maybeSingle(),
    supabase.from('articles').select('id,title,status').eq('ingestion_item_id', id).maybeSingle(),
  ]);

  if (!item) notFound();
  const source = Array.isArray(item.sources) ? item.sources[0] : item.sources;
  const details = qualityDetails(item.quality_details);
  const score = metric(item.agent_score ?? 0);
  const metrics = [
    ['אמינות המקור', metric(details.trust)],
    ['רלוונטיות', metric(details.relevance)],
    ['ביסוס מחקרי', metric(details.evidence)],
    ['עדכניות', metric(details.freshness)],
  ] as const;

  return <main className="min-h-screen bg-slate-50 px-5 py-8" dir="rtl">
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/ingestion" className="text-sm font-bold text-teal-700">← חזרה לתור הבדיקה</Link>
      {query.saved && <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">החלטת העורך נשמרה.</div>}
      {query.error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">השמירה נכשלה: {query.error}</div>}

      <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
          {item.image_url && <div className="aspect-[16/7] overflow-hidden bg-slate-100"><img src={item.image_url} alt="" className="h-full w-full object-cover" /></div>}
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="rounded-full bg-teal-50 px-3 py-1.5 text-teal-800">{source?.name ?? 'מקור לא ידוע'}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">{source?.source_type ?? 'publication'}</span>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">{item.language?.toUpperCase() ?? '—'}</span>
            </div>
            <h1 className="mt-5 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{item.raw_title || 'ללא כותרת'}</h1>
            <p className="mt-3 text-sm text-slate-500">פורסם: {new Date(item.published_at ?? item.discovered_at).toLocaleDateString('he-IL')} · נאסף: {new Date(item.discovered_at).toLocaleString('he-IL')}</p>
            <div className="mt-7 whitespace-pre-line text-base leading-8 text-slate-700">{item.raw_content || 'לא התקבל תקציר מהמקור. ניתן לקרוא את הכתבה המלאה באתר המקורי.'}</div>
            <a href={item.source_url} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-900 hover:border-teal-600 hover:text-teal-700">פתיחת הכתבה המקורית ↗</a>
          </div>
        </article>

        <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
          <section className="rounded-3xl bg-slate-950 p-6 text-white">
            <div className="flex items-end justify-between"><div><p className="text-xs font-bold text-teal-300">ציון המנוע</p><div className="mt-1 text-5xl font-black">{score}</div></div><div className="text-sm text-slate-400">מתוך 100</div></div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-teal-400" style={{ width: `${score}%` }} /></div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="font-black text-slate-950">פירוט האיכות</h2>
            <div className="mt-4 space-y-4">{metrics.map(([label, value]) => <div key={label}><div className="flex justify-between text-xs font-bold"><span>{label}</span><span>{value}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600" style={{ width: `${value}%` }} /></div></div>)}</div>
            <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-500">גיל הכתבה: {details.ageDays ?? '—'} ימים · אמינות המקור: {source?.trust_score ?? '—'}/10</div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="font-black text-slate-950">התאמה לשילוש האתר</h2>
            <div className="mt-3 flex flex-wrap gap-2">{details.matchedTopics?.length ? details.matchedTopics.map((topic) => <span key={topic} className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-800">{topicLabels[topic] ?? topic}</span>) : <span className="text-sm text-slate-500">לא זוהתה התאמה חזקה</span>}</div>
            <h3 className="mt-5 text-sm font-black">אותות מחקריים</h3>
            <div className="mt-2 flex flex-wrap gap-2">{details.evidenceSignals?.length ? details.evidenceSignals.map((signal) => <span key={signal} className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-800">{signal}</span>) : <span className="text-sm text-slate-500">לא זוהו אותות מחקריים</span>}</div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5">
            <h2 className="font-black text-slate-950">החלטת העורך</h2>
            <p className="mt-1 text-xs text-slate-500">סטטוס נוכחי: {item.status}</p>
            <div className="mt-4 grid gap-3">
              {generatedArticle
                ? <Link href={`/admin/articles/${generatedArticle.id}`} className="block w-full rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-black text-emerald-800">פתיחת הטיוטה שנוצרה</Link>
                : <form action={generateDraft}><input type="hidden" name="id" value={item.id} /><button className="w-full rounded-xl bg-teal-700 px-4 py-3 text-sm font-black text-white">יצירת טיוטה בעברית עם AI</button><p className="mt-2 text-center text-[11px] text-slate-500">התהליך עשוי להימשך עד דקה</p></form>}
              <form action={updateIngestionDecision}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="status" value="reviewing" /><button className="w-full rounded-xl bg-amber-50 px-4 py-3 text-sm font-black text-amber-900">השארה בבדיקה</button></form>
              <form action={updateIngestionDecision} className="space-y-2"><input type="hidden" name="id" value={item.id} /><input type="hidden" name="status" value="rejected" /><input name="rejection_reason" defaultValue={item.rejection_reason ?? ''} placeholder="סיבת הדחייה (אופציונלי)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" /><button className="w-full rounded-xl bg-red-50 px-4 py-3 text-sm font-black text-red-800">דחיית הכתבה</button></form>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </main>;
}

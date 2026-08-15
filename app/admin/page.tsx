import Link from 'next/link';
import { Clock3, Eye, FileCheck2, Trophy, Users } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/admin';
import { signOut } from './actions';
import AILinkConverterBox from '@/app/components/AILinkConverterBox';

const cards = [
  { label: 'כל הכתבות', table: 'articles', href: '/admin/articles' },
  { label: 'מקורות מידע', table: 'sources', href: '/admin/sources' },
  { label: 'תור איסוף', table: 'ingestion_items', href: '/admin/ingestion' },
  { label: 'פריטי מילון', table: 'entities', href: '/admin/coming-soon/glossary' },
  { label: 'קמפיינים', table: 'campaigns', href: '/admin/campaigns' },
] as const;

function formatDuration(seconds: number | null) {
  if (seconds === null) return '—';
  if (seconds < 60) return `${seconds} שנ׳`;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes} דק׳ ${remaining} שנ׳`;
}

export default async function AdminPage() {
  const { supabase, profile } = await requireAdmin();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [counts, activeResult, analyticsResult] = await Promise.all([
    Promise.all(cards.map(async ({ table }) => {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      return count ?? 0;
    })),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase
      .from('analytics_events')
      .select('event_name, article_id, anonymous_id, metadata')
      .gte('created_at', since)
      .limit(10000),
  ]);

  const events = analyticsResult.data ?? [];
  const siteVisits = events.filter((event) => event.event_name === 'site_visit').length;
  const articleViews = events.filter((event) => event.event_name === 'article_view');
  const durations = events.flatMap((event) => {
    if (event.event_name !== 'session_duration' || !event.metadata || typeof event.metadata !== 'object' || Array.isArray(event.metadata)) return [];
    const value = event.metadata.duration_seconds;
    return typeof value === 'number' && Number.isFinite(value) ? [value] : [];
  });
  const averageDuration = durations.length
    ? Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length)
    : null;

  const viewsByArticle = new Map<string, number>();
  articleViews.forEach((event) => {
    if (event.article_id) viewsByArticle.set(event.article_id, (viewsByArticle.get(event.article_id) ?? 0) + 1);
  });
  const topArticleEntry = [...viewsByArticle.entries()].sort((a, b) => b[1] - a[1])[0];
  const topArticleResult = topArticleEntry
    ? await supabase.from('articles').select('id, title, slug').eq('id', topArticleEntry[0]).maybeSingle()
    : null;
  const topArticle = topArticleResult?.data ?? null;

  const metrics = [
    { label: 'כתבות פעילות', value: activeResult.count ?? 0, note: 'מפורסמות באתר', icon: FileCheck2, color: 'bg-[#e8f7b5] text-[#18343a]' },
    { label: 'כניסות לאתר', value: siteVisits, note: 'ב־30 הימים האחרונים', icon: Users, color: 'bg-cyan-100 text-cyan-900' },
    { label: 'צפיות בכתבות', value: articleViews.length, note: 'ב־30 הימים האחרונים', icon: Eye, color: 'bg-violet-100 text-violet-900' },
    { label: 'זמן שהייה ממוצע', value: formatDuration(averageDuration), note: durations.length ? `${durations.length} ביקורים נמדדו` : 'האיסוף מתחיל מעכשיו', icon: Clock3, color: 'bg-amber-100 text-amber-900' },
  ];

  return (
    <main className="px-5 py-8 sm:px-8" dir="rtl">
      <div className="mx-auto max-w-6xl pb-8">
        <header className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-[#0b1f24] p-6 text-white shadow-lg sm:p-8">
          <div>
            <div className="text-xs font-black tracking-[0.18em] text-[#b9f227]">PULSETECH CMS</div>
            <h1 className="mt-2 text-2xl font-black text-white sm:text-3xl">שלום, {profile.display_name}</h1>
            <p className="mt-2 text-sm text-white/55">כל התוכן, האיסוף והביצועים במקום אחד.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-xl border border-white/20 px-4 py-2 text-sm font-bold hover:bg-white/10">צפייה באתר</Link>
            <form action={signOut}><button className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-950">יציאה</button></form>
          </div>
        </header>

        <div className="mt-10 space-y-14 sm:mt-12 sm:space-y-16">
        <section id="analytics" className="scroll-mt-24">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-bold text-teal-700">תמונת מצב</p><h2 className="mt-1 text-3xl font-black text-slate-950">ביצועי המגזין</h2></div>
            <span className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-500 shadow-sm">נתוני 30 הימים האחרונים</span>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return <article key={metric.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className={`grid h-11 w-11 place-items-center rounded-2xl ${metric.color}`}><Icon size={22} /></div>
                <div className="mt-5 text-3xl font-black text-slate-950">{metric.value}</div>
                <div className="mt-1 font-black text-slate-700">{metric.label}</div>
                <div className="mt-2 text-xs font-medium text-slate-400">{metric.note}</div>
              </article>;
            })}
          </div>

          <article className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-l from-[#12343b] to-[#0b1f24] p-6 text-white shadow-lg sm:p-8">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#b9f227] text-[#0b1f24]"><Trophy size={24} /></div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black tracking-wide text-[#b9f227]">הכתבה הנצפית ביותר · 30 ימים</div>
                {topArticle ? <>
                  <h3 className="mt-2 text-xl font-black sm:text-2xl">{topArticle.title}</h3>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/65">
                    <span className="flex items-center gap-2"><Eye size={16} />{topArticleEntry?.[1] ?? 0} צפיות</span>
                    <Link href={`/articles/${topArticle.slug}`} className="font-bold text-white underline decoration-white/30 underline-offset-4">צפייה בכתבה</Link>
                  </div>
                </> : <p className="mt-2 text-sm text-white/60">עדיין אין מספיק נתוני צפייה להצגת כתבה מובילה.</p>}
              </div>
            </div>
          </article>
        </section>

        <section>
          <p className="text-sm font-bold text-teal-700">תפעול המערכת</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">תוכן וכלים</h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {cards.map((card, index) => (
              <Link key={card.table} href={card.href} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="text-4xl font-black text-slate-950">{counts[index]}</div>
                <div className="mt-2 font-bold text-slate-600">{card.label}</div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-7"><p className="text-sm font-bold text-teal-700">קליטת תוכן</p><h2 className="mt-1 text-2xl font-black text-slate-950">יצירת טיוטה מקישור</h2></div>
          <AILinkConverterBox />
        </section>
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import { setCampaignStatus } from './actions';

const labels: Record<string, string> = { active: 'פעיל', paused: 'מושהה', draft: 'טיוטה' };
const colors: Record<string, string> = { active: 'bg-emerald-50 text-emerald-800', paused: 'bg-amber-50 text-amber-800', draft: 'bg-slate-100 text-slate-700' };

export default async function CampaignsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const { supabase } = await requireAdmin();
  const { data: campaigns } = await supabase.from('campaigns').select('*,banners(id,placement,image_url,alt_text,active)').order('created_at', { ascending: false });
  return <main className="px-5 py-8 sm:px-8" dir="rtl"><div className="mx-auto max-w-6xl">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold text-teal-700">צמיחה וקהל</p><h1 className="mt-1 text-3xl font-black">באנרים וקמפיינים</h1><p className="mt-2 text-sm text-slate-500">ניהול הקריאייטיב, מועדי הפרסום ומיקומי התצוגה באתר.</p></div><Link href="/admin/campaigns/new" className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white">+ קמפיין חדש</Link></div>
    {query.error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">{query.error}</div>}
    <div className="mt-7 grid gap-5">{!campaigns?.length ? <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center"><h2 className="text-xl font-black">עדיין אין קמפיינים</h2><p className="mt-2 text-sm text-slate-500">צרו את הקמפיין הראשון והבאנר יופיע באתר בהתאם להגדרות.</p></div> : campaigns.map((campaign) => {
      const banner = Array.isArray(campaign.banners) ? campaign.banners[0] : campaign.banners;
      return <article key={campaign.id} className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white lg:grid-cols-[260px_1fr_auto] lg:items-center">
        <div className="h-44 bg-slate-900 lg:h-full">{banner?.image_url && <img src={banner.image_url} alt="" className="h-full w-full object-cover opacity-80" />}</div>
        <div className="p-6"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-black ${colors[campaign.status] ?? colors.draft}`}>{labels[campaign.status] ?? campaign.status}</span><span className="text-xs font-bold text-slate-400">{banner?.placement ?? 'ללא באנר'}</span></div><Link href={`/admin/campaigns/${campaign.id}`} className="mt-3 block text-xl font-black hover:text-teal-700">{campaign.name}</Link><p className="mt-2 text-sm text-slate-500">{banner?.alt_text}</p><p className="mt-3 text-xs text-slate-400">{campaign.starts_at ? new Date(campaign.starts_at).toLocaleDateString('he-IL') : 'ללא תאריך התחלה'} — {campaign.ends_at ? new Date(campaign.ends_at).toLocaleDateString('he-IL') : 'ללא תאריך סיום'}</p></div>
        <div className="flex gap-2 p-6 lg:flex-col"><Link href={`/admin/campaigns/${campaign.id}`} className="rounded-xl border border-slate-200 px-4 py-2 text-center text-sm font-bold">עריכה</Link><form action={setCampaignStatus}><input type="hidden" name="id" value={campaign.id} /><input type="hidden" name="status" value={campaign.status === 'active' ? 'paused' : 'active'} /><button className={`w-full rounded-xl px-4 py-2 text-sm font-black ${campaign.status === 'active' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-600 text-white'}`}>{campaign.status === 'active' ? 'השהיה' : 'הפעלה'}</button></form></div>
      </article>;
    })}</div>
  </div></main>;
}

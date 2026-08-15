import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/admin';
import CampaignForm from '../CampaignForm';
import { saveCampaign } from '../actions';

export default async function EditCampaignPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { id } = await params; const query = await searchParams; const { supabase } = await requireAdmin();
  const [{ data: campaign }, { data: banner }] = await Promise.all([supabase.from('campaigns').select('*').eq('id', id).maybeSingle(), supabase.from('banners').select('*').eq('campaign_id', id).limit(1).maybeSingle()]);
  if (!campaign || !banner) notFound();
  const action = saveCampaign.bind(null, campaign.id, banner.id);
  return <main className="px-5 py-8 sm:px-8" dir="rtl"><div className="mx-auto max-w-6xl"><Link href="/admin/campaigns" className="text-sm font-bold text-teal-700">← חזרה לקמפיינים</Link><h1 className="mt-2 text-3xl font-black">עריכת קמפיין</h1>{(query.saved || query.created) && <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-800">הקמפיין נשמר בהצלחה.</div>}{query.error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">{query.error}</div>}<CampaignForm action={action} campaign={campaign} banner={banner} submitLabel="שמירת השינויים" /></div></main>;
}

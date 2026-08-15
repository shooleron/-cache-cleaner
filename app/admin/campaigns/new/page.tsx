import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/admin';
import CampaignForm from '../CampaignForm';
import { createCampaign } from '../actions';

export default async function NewCampaignPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdmin(); const query = await searchParams;
  return <main className="px-5 py-8 sm:px-8" dir="rtl"><div className="mx-auto max-w-6xl"><Link href="/admin/campaigns" className="text-sm font-bold text-teal-700">← חזרה לקמפיינים</Link><h1 className="mt-2 text-3xl font-black">קמפיין חדש</h1>{query.error && <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-800">{query.error}</div>}<CampaignForm action={createCampaign} submitLabel="יצירת הקמפיין" /></div></main>;
}

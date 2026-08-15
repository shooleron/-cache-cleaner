'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';

type Banner = { id: string; placement: string; image_url: string; target_url: string; alt_text: string };

export default function InlineCampaignBanner({ placement }: { placement: 'article_top' | 'article_bottom' | 'footer' }) {
  const [banner, setBanner] = useState<Banner | null>(null);
  useEffect(() => {
    fetch(`/api/banners?placement=${placement}`).then((response) => response.json()).then(({ banner }) => {
      if (!banner) return;
      setBanner(banner);
      fetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bannerId: banner.id, event: 'banner_impression', placement }), keepalive: true }).catch(() => undefined);
    }).catch(() => undefined);
  }, [placement]);
  if (!banner) return null;
  return <aside className="my-8 overflow-hidden border border-slate-200 bg-slate-950" aria-label="תוכן ממומן"><a href={banner.target_url} onClick={() => fetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bannerId: banner.id, event: 'banner_click', placement }), keepalive: true }).catch(() => undefined)} className="group relative grid min-h-36 place-items-center overflow-hidden p-6 text-center text-white"><img src={banner.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45 transition duration-500 group-hover:scale-105" /><span className="absolute inset-0 bg-slate-950/50" /><span className="relative"><small className="text-[9px] font-black tracking-[.18em] text-teal-300">תוכן מקודם</small><strong className="mt-2 block text-xl">{banner.alt_text}</strong><span className="mt-3 inline-flex items-center gap-2 text-xs font-bold">למידע נוסף <ArrowLeft size={13} /></span></span></a></aside>;
}

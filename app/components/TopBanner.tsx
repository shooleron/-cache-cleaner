'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, X } from 'lucide-react';
type Banner = { id: string; placement: string; image_url: string; target_url: string; alt_text: string };

export default function TopBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/banners?placement=home_top')
      .then((response) => response.json())
      .then(({ banner }) => {
        if (!banner) return;
        setBanner(banner);
        fetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bannerId: banner.id, event: 'banner_impression', placement: 'home_top' }), keepalive: true }).catch(() => undefined);
      })
      .catch(() => undefined);
  }, []);

  if (!banner || dismissed) return null;

  return (
    <aside className="w-full bg-white px-4 pt-6 md:px-8" aria-label="תוכן מקודם">
      <div className="relative mx-auto min-h-[150px] w-full max-w-[860px] overflow-hidden border border-slate-200 bg-slate-950 md:min-h-[190px]">
        <img src={banner.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-slate-950/65" />
        <div className="relative z-10 flex min-h-[150px] items-center justify-center px-12 py-7 text-center md:min-h-[190px] md:px-16">
          <div className="mx-auto max-w-2xl text-white">
            <div className="mb-2 text-[10px] font-black tracking-[0.18em] text-teal-300">PULSETECH PICKS</div>
            <h2 className="text-xl font-black leading-tight text-white md:text-3xl">{banner.alt_text}</h2>
            <a href={banner.target_url} onClick={() => fetch('/api/banners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bannerId: banner.id, event: 'banner_click', placement: 'home_top' }), keepalive: true }).catch(() => undefined)} className="mt-5 inline-flex items-center justify-center gap-2 border border-white/30 bg-white px-4 py-2 text-xs font-black text-slate-950 transition hover:bg-teal-300">
              למידע נוסף <ArrowLeft size={14} />
            </a>
          </div>
          <button onClick={() => setDismissed(true)} aria-label="סגירת הבאנר" className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/30 p-2 text-white transition hover:bg-black/60">
            <X size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}

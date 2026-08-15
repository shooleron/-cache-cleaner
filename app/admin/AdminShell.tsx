'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  BookOpenText,
  Bot,
  ChevronLeft,
  FileText,
  GalleryVerticalEnd,
  Globe2,
  ImageIcon,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Megaphone,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';

const groups = [
  {
    label: 'תוכן',
    items: [
      { label: 'לוח בקרה', href: '/admin', icon: LayoutDashboard },
      { label: 'כתבות', href: '/admin/articles', icon: FileText },
      { label: 'מנוע איסוף', href: '/admin/ingestion', icon: Bot },
      { label: 'מקורות וקרדיטים', href: '/admin/sources', icon: Globe2 },
      { label: 'כתבות מצולמות', href: '/admin/coming-soon/video', icon: GalleryVerticalEnd },
      { label: 'עמודים קבועים', href: '/admin/coming-soon/pages', icon: BookOpenText },
    ],
  },
  {
    label: 'צמיחה וקהל',
    items: [
      { label: 'מילון ומותגים', href: '/admin/coming-soon/glossary', icon: Search },
      { label: 'באנרים וקמפיינים', href: '/admin/campaigns', icon: Megaphone },
      { label: 'תגובות ודירוגים', href: '/admin/coming-soon/community', icon: MessageSquareText },
      { label: 'נתונים וביצועים', href: '/admin#analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'מערכת',
    items: [
      { label: 'משתמשים והרשאות', href: '/admin/coming-soon/users', icon: Users },
      { label: 'הגדרות', href: '/admin/coming-soon/settings', icon: Settings },
    ],
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === '/admin/login') return children;

  const section = groups.flatMap((group) => group.items).find((item) =>
    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href),
  );

  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-950" dir="rtl">
      {open && <button aria-label="סגירת תפריט" className="fixed inset-0 z-40 bg-slate-950/45 lg:hidden" onClick={() => setOpen(false)} />}

      <aside className={`fixed inset-y-0 right-0 z-50 flex w-[286px] flex-col bg-[#0b1f24] text-white shadow-2xl transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link href="/admin" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#b9f227] text-lg font-black text-[#0b1f24]">P</span>
            <span><b className="block text-lg tracking-wide">PULSETECH</b><small className="text-[10px] font-bold tracking-[.24em] text-white/50">CONTENT OS</small></span>
          </Link>
          <button aria-label="סגירה" className="rounded-lg p-2 text-white/70 lg:hidden" onClick={() => setOpen(false)}><X size={20} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-7">
          {groups.map((group, groupIndex) => <div key={group.label} className={groupIndex < groups.length - 1 ? 'mb-9 border-b border-white/8 pb-8' : ''}>
            <div className="mb-3 px-3 text-[10px] font-black tracking-[.16em] text-white/40">{group.label}</div>
            <div className="space-y-2">
              {group.items.map((item) => {
                const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                const Icon = item.icon;
                return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? 'bg-[#b9f227] text-[#0b1f24]' : 'text-white/70 hover:bg-white/8 hover:text-white'}`}>
                  <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                  <span className="flex-1">{item.label}</span>
                  {active && <ChevronLeft size={15} />}
                </Link>;
              })}
            </div>
          </div>)}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/6 p-3">
            <div className="text-xs font-bold text-white/90">מערכת פעילה</div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-white/45"><span className="h-2 w-2 rounded-full bg-emerald-400" />Supabase מחובר</div>
          </div>
        </div>
      </aside>

      <div className="lg:pr-[286px]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <button aria-label="פתיחת תפריט" className="rounded-xl border border-slate-200 p-2.5 lg:hidden" onClick={() => setOpen(true)}><Menu size={21} /></button>
            <div><div className="text-[11px] font-black text-teal-700">מערכת ניהול</div><div className="font-black sm:text-lg">{section?.label ?? 'PULSETECH CMS'}</div></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/" className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold transition hover:bg-slate-50 sm:block">צפייה באתר</Link>
            <Link href="/admin/articles/new" className="rounded-xl bg-[#0b1f24] px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800">+ כתבה חדשה</Link>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[#e8f7b5] text-sm font-black text-[#18343a]">יא</div>
          </div>
        </header>
        <div className="min-w-0 pb-10">{children}</div>
      </div>
    </div>
  );
}

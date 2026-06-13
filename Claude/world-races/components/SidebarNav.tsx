"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type Locale } from "@/lib/i18n";

type NavItem = {
  key: string;
  href: (l: Locale) => string;
  icon: string;
  labelKey: string;
  match: (p: string, l: Locale) => boolean;
  primary?: boolean;
  sectionLabelKey?: string;
};

const ITEMS: NavItem[] = [
  {
    key: "home",
    href: (l) => `/${l}`,
    icon: "🏠",
    labelKey: "bottomNav.home",
    match: (p, l) => p === `/${l}` || p === `/${l}/`,
    primary: true,
  },
  {
    key: "ai-coach",
    href: (l) => `/${l}/ai-coach`,
    icon: "🤖",
    labelKey: "nav.aicoach",
    match: (p, l) => p.startsWith(`/${l}/ai-coach`) || p.startsWith(`/${l}/onboarding`),
    primary: true,
    sectionLabelKey: "nav.section.coaching",
  },
  {
    key: "find",
    href: (l) => `/${l}/find`,
    icon: "🔍",
    labelKey: "nav.find",
    match: (p, l) =>
      p.startsWith(`/${l}/find`) ||
      p.startsWith(`/${l}/coaches`) ||
      p.startsWith(`/${l}/groups`) ||
      p.startsWith(`/${l}/clubs`),
    primary: true,
  },
  {
    key: "programs",
    href: (l) => `/${l}/programs`,
    icon: "📋",
    labelKey: "nav.programs",
    match: (p, l) => p.startsWith(`/${l}/programs`),
    primary: true,
    sectionLabelKey: "nav.section.training",
  },
  {
    key: "chat",
    href: (l) => `/${l}/chat`,
    icon: "💬",
    labelKey: "nav.chat",
    match: (p, l) => p.startsWith(`/${l}/chat`),
    primary: true,
  },
  {
    key: "feed",
    href: (l) => `/${l}/feed`,
    icon: "📰",
    labelKey: "nav.feed",
    match: (p, l) => p.startsWith(`/${l}/feed`),
  },
  {
    key: "races",
    href: (l) => `/${l}/races`,
    icon: "🏁",
    labelKey: "nav.races",
    match: (p, l) => p.startsWith(`/${l}/races`),
    sectionLabelKey: "nav.section.racing",
  },
  {
    key: "tracking",
    href: (l) => `/${l}/tracking`,
    icon: "🏃",
    labelKey: "nav.tracking",
    match: (p, l) => p.startsWith(`/${l}/tracking`),
  },
  {
    key: "tools",
    href: (l) => `/${l}/tools`,
    icon: "🧮",
    labelKey: "nav.tools",
    match: (p, l) => p.startsWith(`/${l}/tools`),
    // same section as races
  },
];

export function SidebarNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto py-6 ps-4 pe-3 border-e border-[color:var(--ur-surface-glass-border)]">
      <nav className="flex flex-col gap-0.5">
        {ITEMS.map((it) => {
          const isActive = it.match(pathname, locale);
          return (
            <div key={it.key}>
              {it.sectionLabelKey && (
                <div className="ur-eyebrow text-[color:var(--ur-fg-4)] px-3 pt-4 pb-1.5">
                  {t(locale, it.sectionLabelKey)}
                </div>
              )}
              <Link
                href={it.href(locale)}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? "bg-[color:var(--ur-surface-active)] text-[color:var(--ur-red-500)] border border-[color:var(--ur-surface-active-border)]"
                    : "text-[color:var(--ur-fg-2)] hover:bg-[color:var(--ur-surface-glass-hover)] hover:text-[color:var(--ur-fg-1)]"
                }`}
              >
                <span className="text-lg leading-none shrink-0" aria-hidden>
                  {it.icon}
                </span>
                <span
                  className={`text-sm ${
                    it.primary ? "font-semibold" : "font-medium"
                  }`}
                >
                  {t(locale, it.labelKey)}
                </span>
                {isActive && (
                  <span
                    className="ms-auto w-1.5 h-1.5 rounded-full ur-gradient-bg"
                    aria-hidden
                  />
                )}
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-[color:var(--ur-surface-glass-border)] text-[10px] text-[color:var(--ur-fg-4)]">
        <div className="ur-eyebrow mb-1.5 text-[color:var(--ur-fg-4)]">
          CoachUp
        </div>
        v1.0 · {locale === "he" ? "אפליקציה מקומית" : "Web app"}
      </div>
    </aside>
  );
}

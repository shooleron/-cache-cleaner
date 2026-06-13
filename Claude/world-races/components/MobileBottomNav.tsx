"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { t, type Locale } from "@/lib/i18n";

type Tab = {
  key: string;
  href: (locale: Locale, userId?: string) => string;
  icon: string;
  activeIcon: string;
  labelKey: string;
  match: (pathname: string, locale: Locale) => boolean;
};

const TABS: Tab[] = [
  {
    key: "home",
    href: (l) => `/${l}`,
    icon: "🏠",
    activeIcon: "🏠",
    labelKey: "bottomNav.home",
    match: (p, l) => p === `/${l}` || p === `/${l}/`,
  },
  {
    key: "find",
    href: (l) => `/${l}/find`,
    icon: "🔍",
    activeIcon: "🔍",
    labelKey: "bottomNav.find",
    match: (p, l) =>
      p.startsWith(`/${l}/find`) ||
      p.startsWith(`/${l}/coaches`) ||
      p.startsWith(`/${l}/groups`) ||
      p.startsWith(`/${l}/clubs`),
  },
  {
    key: "programs",
    href: (l) => `/${l}/programs`,
    icon: "📋",
    activeIcon: "📋",
    labelKey: "bottomNav.programs",
    match: (p, l) => p.startsWith(`/${l}/programs`),
  },
  {
    key: "profile",
    href: (l, uid) => (uid ? `/${l}/u/${uid}` : `/${l}/auth`),
    icon: "👤",
    activeIcon: "👤",
    labelKey: "bottomNav.profile",
    match: (p, l) =>
      p.startsWith(`/${l}/u/`) ||
      p.startsWith(`/${l}/settings`) ||
      p.startsWith(`/${l}/tracking`) ||
      p.startsWith(`/${l}/my-races`) ||
      p.startsWith(`/${l}/recommendations`),
  },
];

export function MobileBottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (data.user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", data.user.id)
          .maybeSingle();
        setAvatarUrl((p?.avatar_url as string | null) ?? null);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) setAvatarUrl(null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  // Hide on auth-style pages
  if (
    pathname.startsWith(`/${locale}/auth`) ||
    pathname.startsWith(`/${locale}/offline`)
  ) {
    return null;
  }

  return (
    <>
      <nav
        aria-label="Primary mobile navigation"
        className="lg:hidden fixed bottom-0 inset-x-0 z-20 backdrop-blur-2xl bg-[color:var(--ur-canvas-0)]/85 border-t border-[color:var(--ur-surface-glass-border)] pb-[env(safe-area-inset-bottom)]"
      >
        <ul className="grid grid-cols-4">
          {TABS.map((tab) => {
            const isActive = tab.match(pathname, locale);
            const isProfile = tab.key === "profile";
            return (
              <li key={tab.key}>
                <Link
                  href={tab.href(locale, user?.id)}
                  className={`flex flex-col items-center gap-0.5 py-2.5 transition-colors ${
                    isActive
                      ? "text-[color:var(--ur-red-500)]"
                      : "text-[color:var(--ur-fg-3)] hover:text-[color:var(--ur-fg-1)]"
                  }`}
                >
                  {isProfile && user && avatarUrl ? (
                    <span
                      className={`w-6 h-6 rounded-full overflow-hidden border-2 ${
                        isActive
                          ? "border-[color:var(--ur-red-500)]"
                          : "border-transparent"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={avatarUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </span>
                  ) : (
                    <span
                      className="text-xl leading-none"
                      aria-hidden
                    >
                      {isActive ? tab.activeIcon : tab.icon}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider ${
                      isActive ? "" : "opacity-80"
                    }`}
                  >
                    {t(locale, tab.labelKey)}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      {/* Spacer so content doesn't hide behind the bottom bar */}
      <div className="lg:hidden h-16" aria-hidden />
    </>
  );
}

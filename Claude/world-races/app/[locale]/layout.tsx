import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Rubik } from "next/font/google";
import "../globals.css";
import { HeaderUserMenu } from "@/components/HeaderUserMenu";
import { PWAInstall } from "@/components/PWAInstall";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { MobileFAB } from "@/components/MobileFAB";
import { SidebarNav } from "@/components/SidebarNav";
import { isLocale, dir, t, LOCALES } from "@/lib/i18n";

const rubik = Rubik({
  subsets: ["latin", "hebrew"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
});

export const metadata: Metadata = {
  title: "CoachUp — Train smart, race strong",
  description:
    "Multi-sport platform for coaches, groups, clubs, and athletes — find a coach, train smart, race strong.",
  manifest: "/manifest.webmanifest",
  applicationName: "CoachUp",
  appleWebApp: {
    capable: true,
    title: "CoachUp",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#ff5c00",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const otherLocale = locale === "he" ? "en" : "he";

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      className={`${rubik.variable} h-full antialiased`}
      style={{ fontFamily: "var(--font-rubik), var(--ur-font)" }}
    >
      <body className="min-h-full flex flex-col">
        {/* Prevent theme flash on load */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){var t=localStorage.getItem('theme');if(t==='light'){var l=document.documentElement.style;l.setProperty('--ur-canvas-0','#f5f5f7');l.setProperty('--ur-canvas-1','#ebebed');l.setProperty('--ur-canvas-2','#e1e1e4');l.setProperty('--ur-canvas-gradient','linear-gradient(140deg,#f5f5f7 0%,#ebebed 55%,#e1e1e4 100%)');l.setProperty('--ur-fg-1','#1c0c00');l.setProperty('--ur-fg-2','rgba(28,12,0,0.85)');l.setProperty('--ur-fg-3','rgba(28,12,0,0.6)');l.setProperty('--ur-fg-4','rgba(28,12,0,0.4)');l.setProperty('--ur-fg-5','rgba(28,12,0,0.10)');l.setProperty('--ur-surface-glass','rgba(255,255,255,0.65)');l.setProperty('--ur-surface-glass-border','rgba(28,12,0,0.08)');l.setProperty('--ur-surface-glass-hover','rgba(255,255,255,0.85)');l.setProperty('--ur-surface-item','rgba(255,255,255,0.45)');l.setProperty('--ur-surface-item-border','rgba(28,12,0,0.06)');l.setProperty('--ur-surface-active','rgba(255,92,0,0.10)');l.setProperty('--ur-surface-active-border','rgba(255,92,0,0.40)');l.setProperty('--ur-surface-sunken','rgba(28,12,0,0.05)');l.setProperty('--background','var(--ur-canvas-0)');l.setProperty('--foreground','var(--ur-fg-1)');}})()` }} />
        {/* Top header — slim app bar */}
        <header className="sticky top-0 z-20 backdrop-blur-2xl bg-[color:var(--ur-canvas-0)]/70 border-b border-[color:var(--ur-surface-glass-border)]">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2.5 font-extrabold tracking-tight"
            >
              <span
                className="inline-flex items-center justify-center w-8 h-8 rounded-[10px] ur-gradient-bg text-white text-base"
                style={{ boxShadow: "var(--ur-glow-red)" }}
                aria-hidden
              >
                ▶
              </span>
              <span className="ur-gradient-text text-lg sm:text-xl">
                {t(locale, "app.title")}
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href={`/${locale}/chat`}
                className="ur-btn-ghost rounded-full w-9 h-9 flex items-center justify-center text-base"
                aria-label={t(locale, "nav.chat")}
              >
                💬
              </Link>
              <HeaderUserMenu locale={locale} />
              <Link
                href={`/${otherLocale}`}
                className="ur-btn-ghost rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider"
              >
                {locale === "he" ? "EN" : "עב"}
              </Link>
            </div>
          </div>
        </header>

        {/* App body: sidebar + main */}
        <div className="flex-1 mx-auto max-w-screen-2xl w-full px-0 lg:px-6 flex gap-0 lg:gap-8">
          <SidebarNav locale={locale} />
          <main className="flex-1 min-w-0">{children}</main>
        </div>

        <footer className="border-t border-[color:var(--ur-surface-glass-border)] mt-16 py-8 text-xs text-[color:var(--ur-fg-4)]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="ur-eyebrow mb-2">CoachUp</div>
            <div>{t(locale, "footer.data")}</div>
          </div>
        </footer>

        <MobileFAB locale={locale} />
        <MobileBottomNav locale={locale} />
        <PWAInstall locale={locale} />
      </body>
    </html>
  );
}

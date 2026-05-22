import Link from "next/link";
import { countryFlag, t, type Locale } from "@/lib/i18n";
import type { Club } from "@/lib/types";

function coachTier(level: number | null): { key: string; style: string } | null {
  if (!level) return null;
  if (level >= 4) return { key: "coach.tier.elite", style: "bg-amber-400/15 text-amber-400 border-amber-400/30" };
  if (level === 3) return { key: "coach.tier.pro", style: "bg-purple-400/15 text-purple-400 border-purple-400/30" };
  return { key: "coach.tier.certified", style: "bg-sky-400/15 text-sky-400 border-sky-400/30" };
}

export function ClubCard({ club, locale }: { club: Club; locale: Locale }) {
  return (
    <Link
      href={`/${locale}/clubs/${club.slug}`}
      className="ur-card p-5 flex flex-col hover:border-[color:var(--ur-surface-active-border)] transition-all hover:-translate-y-0.5"
    >
      {/* Avatar */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`shrink-0 w-12 h-12 ur-gradient-bg text-white flex items-center justify-center text-base font-extrabold uppercase overflow-hidden ${club.kind === "coach" ? "rounded-full" : "rounded-2xl"}`}
          style={{ boxShadow: "var(--ur-shadow-sm)" }}
        >
          {(() => {
            if (club.kind === "coach") {
              const src = club.logo_url && !club.logo_url.includes("avataaars")
                ? club.logo_url
                : `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(club.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
              // eslint-disable-next-line @next/next/no-img-element
              return <img src={src} alt="" className="w-full h-full object-cover" />;
            }
            if (club.logo_url) {
              // eslint-disable-next-line @next/next/no-img-element
              return <img src={club.logo_url} alt="" className="w-full h-full object-cover" />;
            }
            return club.name.slice(0, 2);
          })()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-bold text-sm leading-snug line-clamp-2">
              {club.name}
            </h3>
            {club.is_secret && (
              <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-[color:var(--ur-surface-glass-border)] text-[color:var(--ur-fg-3)]">
                🔒
              </span>
            )}
            {club.kind === "coach" && (() => {
              const tier = coachTier(club.level);
              return tier ? (
                <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${tier.style}`}>
                  {t(locale, tier.key)}
                </span>
              ) : null;
            })()}
          </div>
          <div className="text-xs text-[color:var(--ur-fg-3)] mt-0.5 truncate">
            {club.country_code && countryFlag(club.country_code)}{" "}
            {[club.city, club.country_code].filter(Boolean).join(" · ")}
          </div>
        </div>
      </div>

      {/* Description */}
      {club.description && (
        <p className="text-xs text-[color:var(--ur-fg-2)] line-clamp-2 mb-3 leading-relaxed flex-1">
          {club.description}
        </p>
      )}

      {/* Sports + members */}
      <div className="flex flex-wrap items-center gap-1.5 mt-auto">
        {club.sports.slice(0, 3).map((s) => (
          <span key={s} className="ur-chip text-[10px] uppercase tracking-wider">
            {t(locale, `sport.${s}`)}
          </span>
        ))}
        <span className="ms-auto text-xs text-[color:var(--ur-fg-3)] whitespace-nowrap">
          👟 {club.member_count}
        </span>
      </div>
    </Link>
  );
}

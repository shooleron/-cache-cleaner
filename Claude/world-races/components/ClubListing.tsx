import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { t, type Locale } from "@/lib/i18n";
import type { Club } from "@/lib/types";
import { ClubCard } from "@/components/ClubCard";

type ClubKind = "club" | "group" | "coach";

type SP = { [key: string]: string | string[] | undefined };

export async function ClubListing({
  locale,
  kind,
  searchParams,
}: {
  locale: Locale;
  kind: ClubKind;
  searchParams: SP;
}) {
  const supabase = await createClient();
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const country =
    typeof searchParams.country === "string" ? searchParams.country : undefined;
  const sport =
    typeof searchParams.sport === "string" ? searchParams.sport : undefined;

  let query = supabase
    .from("clubs")
    .select("*")
    .eq("kind", kind)
    .eq("is_public", true)
    .eq("is_secret", false)
    .order("member_count", { ascending: false })
    .limit(60);

  if (q) {
    const like = `%${q}%`;
    query = query.or(
      `name.ilike.${like},city.ilike.${like},description.ilike.${like},tagline.ilike.${like}`,
    );
  }
  if (country) query = query.eq("country_code", country.toUpperCase());
  if (sport) query = query.contains("sports", [sport]);

  const { data } = await query;
  const clubs = (data ?? []) as Club[];

  const titleKey =
    kind === "coach" ? "kind.coaches"
    : kind === "group" ? "kind.groups"
    : "kind.clubs";
  const createBtn = `/${locale}/clubs/new?kind=${kind}`;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="ur-eyebrow mb-2 text-[color:var(--ur-fg-3)]">
            CoachUp
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {kind === "coach" ? "🎯" : kind === "group" ? "🤝" : "👟"}{" "}
            {t(locale, titleKey)}
          </h1>
        </div>
        <Link
          href={createBtn}
          className="ur-btn-primary rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
        >
          + {t(locale, "clubs.create")}
        </Link>
      </div>

      {/* Kind tabs */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
        {(["coach", "group", "club"] as ClubKind[]).map((k) => (
          <Link
            key={k}
            href={`/${locale}/${k === "coach" ? "coaches" : k === "group" ? "groups" : "clubs"}`}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-semibold whitespace-nowrap border transition-colors ${
              kind === k
                ? "ur-gradient-bg text-white border-transparent shadow-[var(--ur-glow-red)]"
                : "border-[color:var(--ur-surface-glass-border)] hover:bg-[color:var(--ur-surface-glass-hover)]"
            }`}
          >
            {t(locale, k === "coach" ? "kind.coaches" : k === "group" ? "kind.groups" : "kind.clubs")}
          </Link>
        ))}
      </div>

      <form className="mb-6 flex flex-wrap gap-3" method="get">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t(locale, "clubs.search")}
          className="flex-1 min-w-[200px] rounded-lg border border-[color:var(--ur-surface-glass-border)] bg-[color:var(--ur-surface-item)] px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--ur-red-500)]"
        />
        <input
          name="sport"
          defaultValue={sport ?? ""}
          placeholder="running, yoga, crossfit..."
          className="w-48 rounded-lg border border-[color:var(--ur-surface-glass-border)] bg-[color:var(--ur-surface-item)] px-3 py-2.5 text-sm"
        />
        <input
          name="country"
          defaultValue={country ?? ""}
          placeholder="IL"
          maxLength={2}
          className="w-20 rounded-lg border border-[color:var(--ur-surface-glass-border)] bg-[color:var(--ur-surface-item)] px-3 py-2.5 text-sm uppercase text-center"
        />
        <button
          type="submit"
          className="ur-btn-ghost rounded-lg px-5 py-2.5 text-xs font-semibold uppercase tracking-wider"
        >
          {t(locale, "filters.apply")}
        </button>
      </form>

      {clubs.length === 0 ? (
        <div className="ur-card p-10 text-center text-[color:var(--ur-fg-3)]">
          {t(locale, "clubs.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((c) => (
            <ClubCard key={c.id} club={c} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}

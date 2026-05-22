import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  isLocale,
  t,
  countryLabel,
  type Locale,
} from "@/lib/i18n";

function coachTierBadge(level: number | null): { key: string; style: string } | null {
  if (!level) return null;
  if (level >= 4) return { key: "coach.tier.elite", style: "bg-amber-400/20 text-amber-300 border-amber-400/40" };
  if (level === 3) return { key: "coach.tier.pro", style: "bg-purple-400/20 text-purple-300 border-purple-400/40" };
  return { key: "coach.tier.certified", style: "bg-sky-400/20 text-sky-300 border-sky-400/40" };
}
import type {
  Achievement,
  Club,
  ClubEvent,
  ClubMemberWithProfile,
  ClubPhoto,
  TrainingSession,
  WeeklySlot,
  Coach,
  Testimonial,
  TrainingProgram,
} from "@/lib/types";
import { ClubPhotoGallery } from "./ClubPhotoGallery";
import type { GalleryPhoto } from "@/components/PhotoGallery";
import { ClubJoinButton } from "@/components/ClubJoinButton";
import { ClubChatButton } from "@/components/ClubChatButton";
import { ClubEventCard } from "@/components/ClubEventCard";
import { TrainingSessionCard } from "@/components/TrainingSessionCard";
import { TrainingSessionForm } from "@/components/TrainingSessionForm";
import { TraineeInquiryForm } from "@/components/TraineeInquiryForm";
import { ProgramCard } from "@/components/ProgramCard";

export default async function ClubLandingPage(
  props: PageProps<"/[locale]/clubs/[slug]">,
) {
  const { locale, slug } = await props.params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;

  const supabase = await createClient();
  const { data: clubData } = await supabase
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  const club = clubData as Club | null;
  if (!club) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: memberRows },
    { data: photoRows },
    { data: eventRows },
    { data: sessionRows },
    { data: programRows },
  ] = await Promise.all([
    supabase
      .from("club_members")
      .select("*, profile:profiles!user_id(*)")
      .eq("club_id", club.id)
      .order("joined_at", { ascending: false })
      .limit(60),
    supabase
      .from("club_photos")
      .select("*")
      .eq("club_id", club.id)
      .order("position", { ascending: true })
      .limit(24),
    supabase
      .from("club_events")
      .select("*")
      .eq("club_id", club.id)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(12),
    supabase
      .from("training_sessions")
      .select("*")
      .eq("club_id", club.id)
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(8),
    supabase
      .from("training_programs")
      .select("*")
      .eq("club_id", club.id)
      .eq("is_published", true)
      .order("follower_count", { ascending: false })
      .limit(6),
  ]);

  const members = (memberRows ?? []) as ClubMemberWithProfile[];
  const photos = (photoRows ?? []) as ClubPhoto[];
  const events = (eventRows ?? []) as ClubEvent[];
  const sessions = (sessionRows ?? []) as TrainingSession[];
  const programs = (programRows ?? []) as TrainingProgram[];

  const isAdmin = user
    ? members.find((m) => m.user_id === user.id)?.role === "admin"
    : false;

  const coaches = (club.coaches ?? []) as Coach[];
  const schedule = (club.weekly_schedule ?? []) as WeeklySlot[];
  const testimonials = (club.testimonials ?? []) as Testimonial[];

  return (
    <div>
      {/* ─── Hero ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden border-b border-[color:var(--ur-surface-glass-border)]">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "var(--ur-gradient-race)" }}
        />
        {club.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={club.cover_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[color:var(--ur-canvas-0)] via-[color:var(--ur-canvas-0)]/40 to-transparent"
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
          <div className="ur-eyebrow mb-4 text-white/85">
            CoachUp · {countryLabel(club.country_code ?? "", loc)}
          </div>
          <div className="flex items-start gap-5 mb-4">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ur-gradient-bg text-white flex items-center justify-center text-3xl font-extrabold uppercase shrink-0"
              style={{ boxShadow: "var(--ur-glow-red)" }}
            >
              {club.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={club.logo_url}
                  alt=""
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                club.name.slice(0, 2)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow leading-tight">
                  {club.name}
                </h1>
                {club.is_secret && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-white/30 bg-black/40 text-white/85">
                    🔒 {loc === "he" ? "סודי" : "Secret"}
                  </span>
                )}
                {club.kind === "coach" && (() => {
                  const tier = coachTierBadge(club.level);
                  return tier ? (
                    <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${tier.style}`}>
                      {t(loc, tier.key)}
                    </span>
                  ) : null;
                })()}
              </div>
              {club.tagline && (
                <p className="mt-2 text-lg sm:text-xl text-white/85 drop-shadow">
                  {club.tagline}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ClubJoinButton clubId={club.id} locale={loc} />
            <ClubChatButton clubId={club.id} clubKind={club.kind} locale={loc} />
            <span className="text-white/85 text-sm">
              👟 {club.member_count} {t(loc, "clubs.members")}
            </span>
            <div className="ms-auto flex flex-wrap gap-2">
              {club.sports.map((s) => (
                <span
                  key={s}
                  className="ur-chip text-[10px] uppercase tracking-wider font-bold bg-black/40 border-white/30 text-white"
                >
                  {t(loc, `sport.${s}`)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-14">

        {/* ─── About + Trial CTA ─────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="ur-eyebrow mb-3 text-[color:var(--ur-fg-3)]">
              {t(loc, "clubs.about")}
            </div>
            {club.description ? (
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {club.description}
              </p>
            ) : (
              <p className="text-sm text-[color:var(--ur-fg-3)]">—</p>
            )}
            {club.meeting_point && (
              <div className="mt-5 ur-chip text-xs">
                📍 {club.meeting_point}
              </div>
            )}
          </div>
          <aside className="ur-card p-6 relative overflow-hidden">
            <div
              aria-hidden
              className="absolute -top-16 -end-16 w-48 h-48 rounded-full blur-3xl opacity-40"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,0,117,.7), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="text-3xl mb-2">🎟️</div>
              <h3 className="font-bold text-xl tracking-tight mb-1">
                {t(loc, "club.trial.title")}
              </h3>
              <p className="text-sm text-[color:var(--ur-fg-3)] mb-4">
                {club.trial_session_text ?? t(loc, "club.trial.subtitle")}
              </p>
              <TraineeInquiryForm clubId={club.id} locale={loc} />
            </div>
          </aside>
        </section>

        {/* ─── Coach profile: Bio + Background + Philosophy ─ */}
        {(club.bio || club.background || club.philosophy) && (
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {club.bio && (
              <div className="lg:col-span-2">
                <h2 className="ur-eyebrow text-[color:var(--ur-fg-3)] mb-3">
                  {t(loc, "coach.profile.bio")}
                </h2>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {club.bio}
                </p>
              </div>
            )}
            {club.philosophy && (
              <aside className="ur-card p-5 relative overflow-hidden">
                <div
                  aria-hidden
                  className="absolute -top-16 -end-16 w-48 h-48 rounded-full blur-3xl opacity-30"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255,92,0,.7), transparent 70%)",
                  }}
                />
                <div className="relative">
                  <div className="text-3xl mb-2">💭</div>
                  <h3 className="ur-eyebrow text-[color:var(--ur-fg-3)] mb-2">
                    {t(loc, "coach.profile.philosophy")}
                  </h3>
                  <p className="text-sm leading-relaxed italic">
                    &ldquo;{club.philosophy}&rdquo;
                  </p>
                </div>
              </aside>
            )}
            {club.background && !club.bio && (
              <div className="lg:col-span-2">
                <h2 className="ur-eyebrow text-[color:var(--ur-fg-3)] mb-3">
                  {t(loc, "coach.profile.background")}
                </h2>
                <p className="text-base leading-relaxed whitespace-pre-wrap text-[color:var(--ur-fg-2)]">
                  {club.background}
                </p>
              </div>
            )}
          </section>
        )}

        {/* ─── Background (if also has bio) ────────────────── */}
        {club.bio && club.background && (
          <section>
            <h2 className="ur-eyebrow text-[color:var(--ur-fg-3)] mb-3">
              {t(loc, "coach.profile.background")}
            </h2>
            <p className="text-base leading-relaxed whitespace-pre-wrap text-[color:var(--ur-fg-2)]">
              {club.background}
            </p>
          </section>
        )}

        {/* ─── Certifications + Specialties + Languages ───── */}
        {(club.certifications?.length > 0 ||
          club.specialties?.length > 0 ||
          club.languages?.length > 0 ||
          club.years_experience != null) && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {club.years_experience != null && (
              <article className="ur-card p-5">
                <div className="text-3xl mb-2">⏳</div>
                <div className="text-4xl font-extrabold tabular-nums ur-gradient-text leading-none">
                  {club.years_experience}+
                </div>
                <div className="ur-eyebrow text-[color:var(--ur-fg-3)] mt-2">
                  {t(loc, "coach.experience")}
                </div>
              </article>
            )}
            {club.specialties?.length > 0 && (
              <article className="ur-card p-5">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="ur-eyebrow text-[color:var(--ur-fg-3)] mb-2">
                  {t(loc, "coach.profile.specialties")}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {club.specialties.map((sp) => (
                    <span
                      key={sp}
                      className="ur-chip text-[10px] uppercase tracking-wider font-semibold"
                    >
                      {sp}
                    </span>
                  ))}
                </div>
              </article>
            )}
            {club.languages?.length > 0 && (
              <article className="ur-card p-5">
                <div className="text-3xl mb-2">🌐</div>
                <h3 className="ur-eyebrow text-[color:var(--ur-fg-3)] mb-2">
                  {t(loc, "coach.profile.languages")}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {club.languages.map((lng) => (
                    <span
                      key={lng}
                      className="ur-chip text-[10px] uppercase tracking-wider font-semibold"
                    >
                      {lng}
                    </span>
                  ))}
                </div>
              </article>
            )}
            {club.certifications?.length > 0 && (
              <article className="ur-card p-5 sm:col-span-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🎓</span>
                  <h3 className="ur-eyebrow text-[color:var(--ur-fg-3)]">
                    {t(loc, "coach.profile.certifications")}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {club.certifications.map((c) => (
                    <span
                      key={c}
                      className="ur-chip text-xs font-semibold border border-[color:var(--ur-surface-active-border)] bg-[color:var(--ur-surface-active)]"
                    >
                      ✓ {c}
                    </span>
                  ))}
                </div>
              </article>
            )}
          </section>
        )}

        {/* ─── Achievements timeline ──────────────────────── */}
        {(club.achievements as Achievement[])?.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-5">
              🏆 {t(loc, "coach.profile.achievements")}
            </h2>
            <div className="space-y-3">
              {(club.achievements as Achievement[]).map((a, i) => (
                <article
                  key={i}
                  className="ur-card p-4 flex items-start gap-4"
                >
                  {a.year && (
                    <div
                      className="shrink-0 w-16 h-16 rounded-xl ur-gradient-bg text-white font-extrabold text-xl flex items-center justify-center tabular-nums"
                      style={{ boxShadow: "var(--ur-shadow-sm)" }}
                    >
                      {a.year}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base">{a.title}</h3>
                    {a.description && (
                      <p className="text-sm text-[color:var(--ur-fg-2)] mt-1">
                        {a.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ─── Training Programs ────────────────────────── */}
        {programs.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-5">
              <h2 className="text-2xl font-bold tracking-tight">
                📋 {t(loc, "programs.coachPrograms")}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((pr) => (
                <ProgramCard key={pr.id} program={pr} club={club} locale={loc} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Weekly schedule ───────────────────────────── */}
        {schedule.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-5">
              🗓️ {t(loc, "club.weekly")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {schedule.map((slot, i) => (
                <div key={i} className="ur-card p-4 flex items-start gap-4">
                  <div
                    className="shrink-0 w-12 h-12 rounded-xl ur-gradient-bg text-white flex flex-col items-center justify-center text-[10px] font-bold uppercase"
                  >
                    <div className="text-base leading-none">
                      {t(loc, `weekday.${slot.day}`)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm">{slot.title}</div>
                    <div className="text-xs text-[color:var(--ur-fg-3)] mt-0.5 tabular-nums">
                      ⏰ {slot.time}
                    </div>
                    {slot.meeting && (
                      <div className="text-xs text-[color:var(--ur-fg-3)]">
                        📍 {slot.meeting}
                      </div>
                    )}
                    {slot.pace && (
                      <div className="text-xs text-[color:var(--ur-fg-3)]">
                        ⏱ {slot.pace}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── Events ────────────────────────────────────── */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <h2 className="text-2xl font-bold tracking-tight">
              ✨ {t(loc, "club.events.upcoming")}
            </h2>
            {isAdmin && (
              <Link
                href={`/${loc}/clubs/${slug}/events/new`}
                className="ur-btn-primary rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wider"
              >
                + {t(loc, "club.events.create")}
              </Link>
            )}
          </div>
          {events.length === 0 ? (
            <div className="ur-card p-10 text-center text-[color:var(--ur-fg-3)] text-sm">
              {t(loc, "club.events.empty")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {events.map((e) => (
                <ClubEventCard key={e.id} event={e} locale={loc} />
              ))}
            </div>
          )}
        </section>

        {/* ─── Training sessions (members) ───────────────── */}
        {sessions.length > 0 && (
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <h2 className="text-2xl font-bold tracking-tight">
                🏃 {t(loc, "clubs.upcomingTrainings")}
              </h2>
              {isAdmin && user && (
                <TrainingSessionForm
                  clubId={club.id}
                  userId={user.id}
                  locale={loc}
                />
              )}
            </div>
            <div className="space-y-3">
              {sessions.map((s) => (
                <TrainingSessionCard key={s.id} session={s} locale={loc} />
              ))}
            </div>
          </section>
        )}

        {/* ─── Coaches ───────────────────────────────────── */}
        {coaches.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-5">
              🎯 {t(loc, "club.coaches")}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {coaches.map((c, i) => (
                <article key={i} className="ur-card p-5 text-center">
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-3 ur-gradient-bg text-white flex items-center justify-center text-2xl font-extrabold uppercase"
                  >
                    {c.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.photo_url}
                        alt=""
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      c.name.slice(0, 1)
                    )}
                  </div>
                  <h3 className="font-bold text-sm">{c.name}</h3>
                  {c.role && (
                    <div className="ur-eyebrow text-[color:var(--ur-fg-3)] mt-1">
                      {c.role}
                    </div>
                  )}
                  {c.bio && (
                    <p className="text-xs text-[color:var(--ur-fg-2)] mt-2 leading-snug">
                      {c.bio}
                    </p>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ─── Gallery ──────────────────────────────────── */}
        <ClubPhotoGallery
          clubId={club.id}
          initialPhotos={(photos as GalleryPhoto[])}
          locale={loc}
        />

        {/* ─── Testimonials ──────────────────────────────── */}
        {testimonials.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold tracking-tight mb-5">
              💬 {t(loc, "club.testimonials")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testimonials.map((tm, i) => (
                <article key={i} className="ur-card p-6">
                  {tm.rating && (
                    <div className="text-[color:var(--ur-red-500)] mb-2">
                      {"★".repeat(tm.rating)}
                      <span className="text-[color:var(--ur-fg-5)]">
                        {"★".repeat(5 - tm.rating)}
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-[color:var(--ur-fg-1)] leading-relaxed italic">
                    &ldquo;{tm.text}&rdquo;
                  </p>
                  <footer className="mt-3 ur-eyebrow text-[color:var(--ur-fg-3)]">
                    — {tm.author}
                  </footer>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ─── Members ──────────────────────────────────── */}
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-5">
            👟 {t(loc, "clubs.members")}{" "}
            <span className="ur-chip text-[10px] uppercase tracking-wider ms-2">
              {club.member_count}
            </span>
          </h2>
          {members.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {members.slice(0, 18).map((m) => {
                const display =
                  m.profile?.display_name ?? m.profile?.username ?? "Runner";
                return (
                  <Link
                    key={m.user_id}
                    href={`/${loc}/u/${m.user_id}`}
                    className="ur-card p-3 text-center hover:border-[color:var(--ur-surface-active-border)]"
                  >
                    <span
                      className="inline-flex w-12 h-12 rounded-full items-center justify-center ur-gradient-bg text-white font-bold uppercase mx-auto"
                    >
                      {display.slice(0, 1)}
                    </span>
                    <div className="text-xs font-semibold mt-2 truncate">
                      {display}
                    </div>
                    {m.role === "admin" && (
                      <div className="ur-eyebrow text-[color:var(--ur-red-500)] mt-1">
                        {t(loc, "clubs.admin")}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </section>

        {/* ─── Contact & links ──────────────────────────── */}
        <section className="ur-card p-6">
          <h2 className="ur-eyebrow text-[color:var(--ur-fg-3)] mb-4">
            {t(loc, "clubs.contact")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {club.website_url && (
              <a
                href={club.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ur-chip hover:bg-[color:var(--ur-surface-glass-hover)]"
              >
                🔗 {club.website_url.replace(/^https?:\/\//, "")}
              </a>
            )}
            {club.contact_email && (
              <a
                href={`mailto:${club.contact_email}`}
                className="ur-chip hover:bg-[color:var(--ur-surface-glass-hover)]"
              >
                ✉ {club.contact_email}
              </a>
            )}
            {club.social_links?.instagram && (
              <a
                href={club.social_links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="ur-chip"
              >
                📷 Instagram
              </a>
            )}
            {club.social_links?.facebook && (
              <a
                href={club.social_links.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="ur-chip"
              >
                Facebook
              </a>
            )}
            {club.social_links?.whatsapp && (
              <a
                href={club.social_links.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="ur-chip"
              >
                💬 WhatsApp
              </a>
            )}
            {club.social_links?.strava && (
              <a
                href={club.social_links.strava}
                target="_blank"
                rel="noopener noreferrer"
                className="ur-chip"
              >
                🏃 Strava
              </a>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

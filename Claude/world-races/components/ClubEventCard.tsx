"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { t, type Locale } from "@/lib/i18n";
import type { ClubEvent, EventRsvpStatus } from "@/lib/types";

const TYPE_EMOJI: Record<string, string> = {
  training: "🏃",
  race: "🏁",
  meet: "🤝",
  workshop: "🎓",
  social: "🎉",
  clinic: "👟",
  gear_swap: "♻",
  charity: "❤",
  other: "✨",
};

function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "he" ? "he-IL" : "en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function ClubEventCard({
  event,
  locale,
}: {
  event: ClubEvent;
  locale: Locale;
}) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<EventRsvpStatus | null>(null);
  const [count, setCount] = useState(event.rsvp_count);
  const [interestedCount, setInterestedCount] = useState(0);
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!alive) return;
      setUser(data.user);
      if (data.user) {
        const { data: row } = await supabase
          .from("event_rsvps")
          .select("status")
          .eq("event_id", event.id)
          .eq("user_id", data.user.id)
          .maybeSingle();
        setStatus((row?.status as EventRsvpStatus) ?? null);
      }
      const { data: rows } = await supabase
        .from("event_rsvps")
        .select("status")
        .eq("event_id", event.id)
        .in("status", ["maybe", "waitlist"]);
      if (alive && rows) {
        setInterestedCount(rows.filter((r) => r.status === "maybe").length);
        setWaitlistCount(rows.filter((r) => r.status === "waitlist").length);
      }
    })();
    return () => { alive = false; };
  }, [event.id, supabase]);

  const isPast = new Date(event.starts_at) < new Date();
  const isFull = event.capacity != null && count >= event.capacity;

  async function setTo(newStatus: EventRsvpStatus) {
    if (!user) return;
    const prev = status;
    setStatus(newStatus);
    if (prev === "going" && newStatus !== "going") setCount((c) => Math.max(0, c - 1));
    if (prev !== "going" && newStatus === "going") setCount((c) => c + 1);
    if (prev === "maybe" && newStatus !== "maybe") setInterestedCount((c) => Math.max(0, c - 1));
    if (prev !== "maybe" && newStatus === "maybe") setInterestedCount((c) => c + 1);
    if (prev === "waitlist" && newStatus !== "waitlist") setWaitlistCount((c) => Math.max(0, c - 1));
    if (prev !== "waitlist" && newStatus === "waitlist") setWaitlistCount((c) => c + 1);
    await supabase
      .from("event_rsvps")
      .upsert(
        { event_id: event.id, user_id: user.id, status: newStatus },
        { onConflict: "event_id,user_id" },
      );
    router.refresh();
  }

  return (
    <article className="ur-card overflow-hidden">
      <div className="relative aspect-[16/7]">
        <div
          className="absolute inset-0"
          style={{ background: "var(--ur-gradient-race)" }}
        />
        {event.cover_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.cover_url}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="absolute top-3 start-3 flex flex-wrap gap-2">
          <span className="ur-chip text-[10px] uppercase tracking-wider font-bold bg-black/50 border-white/20 text-white">
            {TYPE_EMOJI[event.event_type]} {t(locale, `event.type.${event.event_type}`)}
          </span>
          {event.sport && (
            <span className="ur-chip text-[10px] uppercase tracking-wider font-bold bg-black/50 border-white/20 text-white">
              {t(locale, `sport.${event.sport}`)}
            </span>
          )}
          {!event.open_to_non_members && (
            <span className="ur-chip text-[10px] uppercase tracking-wider font-bold bg-[color:var(--ur-warn)]/80 border-transparent text-black">
              {t(locale, "club.events.membersOnly")}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 start-3 end-3 text-white">
          <div className="ur-eyebrow text-white/85">
            {formatDateTime(event.starts_at, locale)}
          </div>
          <h3 className="font-bold text-xl tracking-tight mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,.6)]">
            {event.title}
          </h3>
        </div>
      </div>
      <div className="p-5">
        {event.description && (
          <p className="text-sm text-[color:var(--ur-fg-2)] whitespace-pre-wrap leading-relaxed mb-3">
            {event.description}
          </p>
        )}
        <dl className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
          {event.location && (
            <Item label="📍" value={[event.location, event.city].filter(Boolean).join(" · ")} />
          )}
          {event.price != null && (
            <Item label="💸" value={`${event.currency ?? ""} ${event.price}`} />
          )}
          {event.capacity != null && (
            <Item label="✅" value={`${count} / ${event.capacity}`} />
          )}
          {event.capacity == null && count > 0 && (
            <Item label="✅" value={`${count}`} />
          )}
          {interestedCount > 0 && (
            <Item label="🙋" value={`${interestedCount} ${t(locale, "club.events.interestedCount")}`} />
          )}
          {waitlistCount > 0 && (
            <Item label="⏳" value={`${waitlistCount} ${t(locale, "club.events.waitlistCount")}`} />
          )}
        </dl>

        <footer className="mt-4 pt-3 border-t border-[color:var(--ur-surface-glass-border)] flex flex-wrap items-center gap-2">
          {event.registration_url && (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ur-btn-ghost rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              {t(locale, "club.events.register")} ↗
            </a>
          )}
          {isPast ? (
            <span className="ur-chip text-[10px] text-[color:var(--ur-fg-4)]">
              {t(locale, "session.past")}
            </span>
          ) : !user ? (
            <Link
              href={`/${locale}/auth?next=${encodeURIComponent(pathname)}`}
              className="ur-btn-primary rounded-full px-5 py-1.5 text-xs font-semibold uppercase tracking-wider"
            >
              {t(locale, "club.events.rsvp")}
            </Link>
          ) : (
            <>
              {!isFull || status === "going" ? (
                <button
                  type="button"
                  onClick={() => setTo(status === "going" ? "declined" : "going")}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border ${
                    status === "going"
                      ? "ur-gradient-bg text-white border-transparent shadow-[var(--ur-glow-red)]"
                      : "border-[color:var(--ur-surface-glass-border)] hover:bg-[color:var(--ur-surface-glass-hover)]"
                  }`}
                >
                  {status === "going" ? `✓ ${t(locale, "club.events.rsvp")}` : t(locale, "club.events.rsvp")}
                </button>
              ) : (
                <span className="ur-chip text-[10px] text-[color:var(--ur-warn)] border border-[color:var(--ur-warn)]/50">
                  {t(locale, "club.events.full")}
                </span>
              )}
              <button
                type="button"
                onClick={() => setTo(status === "maybe" ? "declined" : "maybe")}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border ${
                  status === "maybe"
                    ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                    : "border-[color:var(--ur-surface-glass-border)] hover:bg-[color:var(--ur-surface-glass-hover)]"
                }`}
              >
                🙋 {t(locale, "club.events.maybe")}
              </button>
              {isFull && status !== "going" && (
                <button
                  type="button"
                  onClick={() => setTo(status === "waitlist" ? "declined" : "waitlist")}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border ${
                    status === "waitlist"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "border-[color:var(--ur-surface-glass-border)] hover:bg-[color:var(--ur-surface-glass-hover)]"
                  }`}
                >
                  ⏳ {status === "waitlist" ? t(locale, "club.events.onWaitlist") : t(locale, "club.events.waitlist")}
                </button>
              )}
            </>
          )}
        </footer>
      </div>
    </article>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span aria-hidden>{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

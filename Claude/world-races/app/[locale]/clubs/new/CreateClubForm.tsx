"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { t, type Locale } from "@/lib/i18n";
import type { Sport } from "@/lib/types";

const SPORTS: Sport[] = [
  "running",
  "cycling",
  "triathlon",
  "swimming",
  "trail",
  "multisport",
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function CreateClubForm({
  locale,
  userId,
  kind,
}: {
  locale: Locale;
  userId: string;
  kind: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sports, setSports] = useState<Set<Sport>>(new Set(["running"]));
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [meeting, setMeeting] = useState("");
  const [website, setWebsite] = useState("");
  const [contact, setContact] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isSecret, setIsSecret] = useState(false);
  const [level, setLevel] = useState<number>(2);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function toggleSport(s: Sport) {
    const next = new Set(sports);
    if (next.has(s)) next.delete(s);
    else next.add(s);
    setSports(next);
  }

  async function submit() {
    if (!name.trim()) return;
    setBusy(true);
    setErr(null);
    const slug = `${slugify(name)}-${Math.random().toString(36).slice(2, 7)}`;
    const { data, error } = await supabase
      .from("clubs")
      .insert({
        slug,
        name: name.trim(),
        description: description.trim() || null,
        sports: [...sports],
        country_code: country ? country.toUpperCase() : null,
        city: city.trim() || null,
        meeting_point: meeting.trim() || null,
        website_url: website.trim() || null,
        contact_email: contact.trim() || null,
        is_public: isPublic,
        is_secret: isSecret,
        kind,
        level,
        created_by: userId,
      })
      .select("slug")
      .single();
    setBusy(false);
    if (error) {
      setErr(error.message);
    } else {
      router.push(`/${locale}/clubs/${data.slug}`);
    }
  }

  const inputBase =
    "w-full rounded-lg border border-[color:var(--ur-surface-glass-border)] bg-[color:var(--ur-surface-item)] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--ur-red-500)]";
  const chipBase =
    "px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold border transition-colors";
  const chipOn =
    "ur-gradient-bg text-white border-transparent shadow-[var(--ur-glow-red)]";
  const chipOff =
    "border-[color:var(--ur-surface-glass-border)] text-[color:var(--ur-fg-2)] hover:bg-[color:var(--ur-surface-glass-hover)]";

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <div className="ur-eyebrow mb-2 text-[color:var(--ur-fg-3)]">CoachUp</div>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
        {t(locale, "clubs.create")}
      </h1>

      <div className="ur-card p-6 space-y-5">
        <Field label={t(locale, "clubs.form.name") + " *"}>
          <input value={name} onChange={(e) => setName(e.target.value)} required className={inputBase} />
        </Field>

        <Field label={t(locale, "clubs.form.description")}>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className={inputBase + " resize-y"}
          />
        </Field>

        <div>
          <span className="ur-eyebrow text-[color:var(--ur-fg-3)] block mb-2">
            {t(locale, "clubs.form.sports")}
          </span>
          <div className="flex flex-wrap gap-2">
            {SPORTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSport(s)}
                className={`${chipBase} ${sports.has(s) ? chipOn : chipOff}`}
              >
                {t(locale, `sport.${s}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label={t(locale, "clubs.form.country")}>
            <input
              maxLength={2}
              value={country}
              onChange={(e) => setCountry(e.target.value.toUpperCase())}
              placeholder="IL"
              className={inputBase}
            />
          </Field>
          <Field label={t(locale, "clubs.form.city")}>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inputBase} />
          </Field>
        </div>

        <Field label={t(locale, "clubs.form.meeting")}>
          <input value={meeting} onChange={(e) => setMeeting(e.target.value)} className={inputBase} />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label={t(locale, "clubs.form.website")}>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputBase} />
          </Field>
          <Field label={t(locale, "clubs.form.contact")}>
            <input type="email" value={contact} onChange={(e) => setContact(e.target.value)} className={inputBase} />
          </Field>
        </div>

        <div>
          <span className="ur-eyebrow text-[color:var(--ur-fg-3)] block mb-2">
            {t(locale, "clubs.form.level")}
          </span>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setLevel(n)}
                className={`rounded-lg p-2 text-center border transition-all ${
                  level === n
                    ? "ur-gradient-bg text-white border-transparent shadow-[var(--ur-glow-red)]"
                    : "border-[color:var(--ur-surface-glass-border)]"
                }`}
              >
                <div className="text-base font-bold tabular-nums">{n}</div>
                <div className="text-[9px] opacity-90 mt-0.5">
                  {t(locale, `settings.level.${n}`)}
                </div>
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4 accent-[color:var(--ur-red-500)]"
          />
          <span>{t(locale, "clubs.form.public")}</span>
        </label>

        {kind === "group" && (
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
              className="w-4 h-4 accent-[color:var(--ur-red-500)]"
            />
            <span>
              🔒 {locale === "he" ? "קבוצה סודית (לא תופיע בחיפוש)" : "Secret group (hidden from search)"}
            </span>
          </label>
        )}

        {err && <div className="text-sm text-red-500">{err}</div>}

        <button
          type="button"
          onClick={submit}
          disabled={busy || !name.trim()}
          className="ur-btn-primary w-full rounded-full py-3 text-sm font-semibold uppercase tracking-wider disabled:opacity-50"
        >
          {t(locale, "clubs.form.submit")}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="ur-eyebrow text-[color:var(--ur-fg-3)] block mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

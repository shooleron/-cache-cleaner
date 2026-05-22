"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { generatePlan } from "@/lib/aiPlanGenerator";
import type { Locale } from "@/lib/i18n";
import { t } from "@/lib/i18n";

type Step = "sport" | "goal" | "level" | "schedule" | "generating";

const SPORTS = [
  { key: "running",         icon: "🏃",  labelKey: "onboard.sport.running" },
  { key: "trail",           icon: "🏔️",  labelKey: "onboard.sport.trail" },
  { key: "cycling",         icon: "🚴",  labelKey: "onboard.sport.cycling" },
  { key: "swimming",        icon: "🏊",  labelKey: "onboard.sport.swimming" },
  { key: "triathlon",       icon: "🏅",  labelKey: "onboard.sport.triathlon" },
  { key: "hyrox",           icon: "⚡",  labelKey: "onboard.sport.hyrox" },
  { key: "strength",        icon: "🏋️",  labelKey: "onboard.sport.strength" },
  { key: "crossfit",        icon: "💥",  labelKey: "onboard.sport.crossfit" },
  { key: "boxing",          icon: "🥊",  labelKey: "onboard.sport.boxing" },
  { key: "climbing",        icon: "🧗",  labelKey: "onboard.sport.climbing" },
  { key: "yoga",            icon: "🧘",  labelKey: "onboard.sport.yoga" },
  { key: "tennis",          icon: "🎾",  labelKey: "onboard.sport.tennis" },
  { key: "pilates",         icon: "🤸",  labelKey: "onboard.sport.pilates" },
  { key: "football",        icon: "⚽",  labelKey: "onboard.sport.football" },
  { key: "general_fitness", icon: "💪",  labelKey: "onboard.sport.fitness" },
];

const GOALS: Record<string, { key: string; icon: string; labelKey: string }[]> = {
  running: [
    { key: "finish_5k",   icon: "5K",  labelKey: "onboard.goal.5k" },
    { key: "finish_10k",  icon: "10K", labelKey: "onboard.goal.10k" },
    { key: "finish_half", icon: "21K", labelKey: "onboard.goal.half" },
    { key: "finish_full", icon: "42K", labelKey: "onboard.goal.full" },
    { key: "lose_weight", icon: "⚖️",  labelKey: "onboard.goal.weight" },
  ],
  trail: [
    { key: "finish_trail_10k",  icon: "10K", labelKey: "onboard.goal.trail_10k" },
    { key: "finish_trail_half", icon: "21K", labelKey: "onboard.goal.trail_half" },
    { key: "finish_trail_ultra",icon: "50K", labelKey: "onboard.goal.trail_ultra" },
    { key: "general_fitness",   icon: "🏔️",  labelKey: "onboard.goal.fitness" },
  ],
  cycling:  [{ key: "general_fitness", icon: "🚴", labelKey: "onboard.goal.fitness" }],
  swimming: [{ key: "general_fitness", icon: "🏊", labelKey: "onboard.goal.fitness" }],
  triathlon:[{ key: "triathlon",        icon: "🏅", labelKey: "onboard.goal.triathlon" }],
  hyrox:    [{ key: "hyrox",            icon: "⚡", labelKey: "onboard.goal.hyrox" }],
  strength: [
    { key: "build_muscle",     icon: "💪", labelKey: "onboard.goal.build_muscle" },
    { key: "lose_fat",         icon: "⚖️", labelKey: "onboard.goal.lose_fat" },
    { key: "powerlifting",     icon: "🏋️", labelKey: "onboard.goal.powerlifting" },
    { key: "general_strength", icon: "🔥", labelKey: "onboard.goal.general_strength" },
  ],
  crossfit: [
    { key: "wod_fitness",     icon: "💥", labelKey: "onboard.goal.wod_fitness" },
    { key: "compete",         icon: "🏆", labelKey: "onboard.goal.compete" },
    { key: "general_fitness", icon: "💪", labelKey: "onboard.goal.fitness" },
  ],
  boxing: [
    { key: "boxing_fitness",  icon: "🥊", labelKey: "onboard.goal.boxing_fitness" },
    { key: "boxing_technique",icon: "🎯", labelKey: "onboard.goal.boxing_technique" },
    { key: "compete",         icon: "🏆", labelKey: "onboard.goal.compete" },
  ],
  climbing: [
    { key: "improve_grade",   icon: "📈", labelKey: "onboard.goal.improve_grade" },
    { key: "lead_climbing",   icon: "🧗", labelKey: "onboard.goal.lead_climbing" },
    { key: "general_fitness", icon: "💪", labelKey: "onboard.goal.fitness" },
  ],
  yoga: [
    { key: "flexibility",      icon: "🤸", labelKey: "onboard.goal.flexibility" },
    { key: "stress_relief",    icon: "🌿", labelKey: "onboard.goal.stress_relief" },
    { key: "advanced_practice",icon: "🧘", labelKey: "onboard.goal.advanced_practice" },
  ],
  tennis: [
    { key: "tennis_beginner", icon: "🎾", labelKey: "onboard.goal.tennis_beginner" },
    { key: "improve_game",    icon: "📈", labelKey: "onboard.goal.improve_game" },
    { key: "compete",         icon: "🏆", labelKey: "onboard.goal.compete" },
  ],
  pilates: [
    { key: "pilates_core",    icon: "💪", labelKey: "onboard.goal.pilates_core" },
    { key: "flexibility",     icon: "🤸", labelKey: "onboard.goal.flexibility" },
    { key: "pilates_rehab",   icon: "🌿", labelKey: "onboard.goal.pilates_rehab" },
  ],
  football: [
    { key: "football_fitness", icon: "⚽", labelKey: "onboard.goal.football_fitness" },
    { key: "improve_skills",   icon: "🎯", labelKey: "onboard.goal.improve_skills" },
    { key: "compete",          icon: "🏆", labelKey: "onboard.goal.compete" },
  ],
  general_fitness: [{ key: "general_fitness", icon: "💪", labelKey: "onboard.goal.fitness" }],
};

const LEVELS = [
  { key: "beginner",     icon: "🌱", labelKey: "onboard.level.beginner" },
  { key: "intermediate", icon: "🔥", labelKey: "onboard.level.intermediate" },
  { key: "advanced",     icon: "⚡", labelKey: "onboard.level.advanced" },
];

export function OnboardingClient({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("sport");
  const [sport, setSport] = useState("");
  const [goal, setGoal] = useState("");
  const [level, setLevel] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(5);
  const [raceDate, setRaceDate] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const goNext = (nextStep: Step) => setStep(nextStep);

  const handleFinish = () => {
    setStep("generating");
    startTransition(async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push(`/${locale}/auth?next=/${locale}/onboarding`);
          return;
        }

        // Save onboarding answers (upsert)
        const { data: ob, error: obErr } = await supabase
          .from("onboarding_answers")
          .upsert({ user_id: user.id, sport, goal, level, weekly_hours: weeklyHours, race_date: raceDate || null }, { onConflict: "user_id" })
          .select("id")
          .single();
        if (obErr) throw obErr;

        // Generate plan
        const { weeks, weeks_total } = generatePlan({ sport, goal, level, weekly_hours: weeklyHours, race_date: raceDate || undefined });

        // Save plan
        const { error: planErr } = await supabase
          .from("ai_training_plans")
          .upsert({ user_id: user.id, onboarding_id: ob.id, weeks, weeks_total, week_current: 1 }, { onConflict: "user_id" });
        if (planErr) throw planErr;

        router.push(`/${locale}/ai-coach`);
      } catch (e) {
        setError(String(e));
        setStep("schedule");
      }
    });
  };

  const card = "ur-card p-6 flex flex-col items-center gap-2 cursor-pointer hover:-translate-y-0.5 transition-all border-2";
  const activeCard = card + " border-[color:var(--ur-red-500)] bg-[color:var(--ur-surface-active)]";
  const idleCard = card + " border-transparent hover:border-[color:var(--ur-surface-active-border)]";

  if (step === "generating") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 rounded-full ur-gradient-bg animate-pulse" />
        <p className="text-lg font-semibold">{t(locale, "onboard.generating")}</p>
        <p className="text-sm text-[color:var(--ur-fg-3)]">{t(locale, "onboard.generating.sub")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      {/* Progress */}
      <div className="flex gap-1.5 mb-10">
        {(["sport","goal","level","schedule"] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              s === step ? "ur-gradient-bg" :
              (["sport","goal","level","schedule"].indexOf(step) > i) ? "bg-[color:var(--ur-red-500)]/60" :
              "bg-[color:var(--ur-surface-glass-border)]"
            }`}
          />
        ))}
      </div>

      {/* Step: sport */}
      {step === "sport" && (
        <>
          <div className="ur-eyebrow mb-2 text-[color:var(--ur-fg-3)]">CoachUp AI</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t(locale, "onboard.sport.title")}</h1>
          <p className="text-sm text-[color:var(--ur-fg-3)] mb-8">{t(locale, "onboard.sport.sub")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SPORTS.map((s) => (
              <button
                key={s.key}
                onClick={() => { setSport(s.key); setGoal(""); goNext("goal"); }}
                className={sport === s.key ? activeCard : idleCard}
              >
                <span className="text-3xl">{s.icon}</span>
                <span className="text-sm font-semibold">{t(locale, s.labelKey)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Step: goal */}
      {step === "goal" && (
        <>
          <div className="ur-eyebrow mb-2 text-[color:var(--ur-fg-3)]">CoachUp AI</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t(locale, "onboard.goal.title")}</h1>
          <p className="text-sm text-[color:var(--ur-fg-3)] mb-8">{t(locale, "onboard.goal.sub")}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
            {(GOALS[sport] ?? GOALS.general_fitness).map((g) => (
              <button
                key={g.key}
                onClick={() => { setGoal(g.key); goNext("level"); }}
                className={goal === g.key ? activeCard : idleCard}
              >
                <span className="text-2xl font-black">{g.icon}</span>
                <span className="text-sm font-semibold">{t(locale, g.labelKey)}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setStep("sport")} className="text-sm text-[color:var(--ur-fg-3)] hover:underline">
            ← {t(locale, "onboard.back")}
          </button>
        </>
      )}

      {/* Step: level */}
      {step === "level" && (
        <>
          <div className="ur-eyebrow mb-2 text-[color:var(--ur-fg-3)]">CoachUp AI</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t(locale, "onboard.level.title")}</h1>
          <p className="text-sm text-[color:var(--ur-fg-3)] mb-8">{t(locale, "onboard.level.sub")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            {LEVELS.map((l) => (
              <button
                key={l.key}
                onClick={() => { setLevel(l.key); goNext("schedule"); }}
                className={level === l.key ? activeCard : idleCard}
              >
                <span className="text-3xl">{l.icon}</span>
                <span className="text-sm font-semibold">{t(locale, l.labelKey)}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setStep("goal")} className="text-sm text-[color:var(--ur-fg-3)] hover:underline">
            ← {t(locale, "onboard.back")}
          </button>
        </>
      )}

      {/* Step: schedule */}
      {step === "schedule" && (
        <>
          <div className="ur-eyebrow mb-2 text-[color:var(--ur-fg-3)]">CoachUp AI</div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{t(locale, "onboard.schedule.title")}</h1>
          <p className="text-sm text-[color:var(--ur-fg-3)] mb-8">{t(locale, "onboard.schedule.sub")}</p>

          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-semibold mb-2">{t(locale, "onboard.hours.label")}</label>
              <div className="flex items-center gap-4">
                <input
                  type="range" min={2} max={20} step={1}
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  className="flex-1 accent-[color:var(--ur-red-500)]"
                />
                <span className="w-16 text-center font-bold text-lg">{weeklyHours}h</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                {t(locale, "onboard.racedate.label")}
                <span className="ms-2 text-xs font-normal text-[color:var(--ur-fg-3)]">{t(locale, "onboard.racedate.optional")}</span>
              </label>
              <input
                type="date"
                value={raceDate}
                onChange={(e) => setRaceDate(e.target.value)}
                min={new Date().toISOString().slice(0,10)}
                className="rounded-lg border border-[color:var(--ur-surface-glass-border)] bg-[color:var(--ur-surface-item)] px-4 py-2.5 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[color:var(--ur-red-500)]"
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <button
            onClick={handleFinish}
            disabled={isPending}
            className="ur-btn-primary w-full rounded-full py-3.5 text-sm font-semibold uppercase tracking-wider"
          >
            {t(locale, "onboard.generate")} →
          </button>
          <button onClick={() => setStep("level")} className="block mt-4 text-sm text-[color:var(--ur-fg-3)] hover:underline mx-auto">
            ← {t(locale, "onboard.back")}
          </button>
        </>
      )}
    </div>
  );
}

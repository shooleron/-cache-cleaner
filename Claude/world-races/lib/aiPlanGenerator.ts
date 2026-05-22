// AI Training Plan Generator
// Generates a structured week-by-week training plan based on onboarding answers.
// Pure function — no external API calls.

export type OnboardingAnswers = {
  sport: string;         // running | cycling | swimming | hyrox | triathlon | general_fitness
  goal: string;          // finish_5k | finish_10k | finish_half | finish_full | hyrox | lose_weight | general_fitness
  level: string;         // beginner | intermediate | advanced
  weekly_hours: number;  // available hours per week
  race_date?: string;    // ISO date string
};

export type SessionType =
  | "easy_run" | "tempo" | "long_run" | "intervals" | "rest" | "cross_train"
  | "strength" | "easy_ride" | "long_ride" | "swim" | "brick" | "hyrox_sim"
  | "walk_run" | "yoga" | "recovery"
  | "trail_run" | "hill_repeat" | "long_trail"
  | "push" | "pull" | "legs" | "full_body" | "deload"
  | "wod" | "conditioning" | "skill_work"
  | "bag_work" | "technique" | "sparring"
  | "bouldering" | "lead_climb" | "hangboard"
  | "yoga_flow" | "yin_yoga" | "meditation"
  | "tennis_drill" | "match_play"
  | "technical" | "tactical" | "match"
  | "pilates_mat" | "pilates_reformer";

export type DayPlan = {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sun
  session_type: SessionType;
  duration_min: number;
  distance_km?: number;
  description_key: string; // i18n key
  intensity: "easy" | "moderate" | "hard" | "rest";
};

export type WeekPlan = {
  week: number;
  theme_key: string; // i18n key e.g. "plan.theme.base"
  days: DayPlan[];
  total_km?: number;
  total_min: number;
};

// --- helpers ---

function weeksUntilRace(race_date?: string): number {
  if (!race_date) return 12;
  const diff = new Date(race_date).getTime() - Date.now();
  return Math.max(4, Math.min(24, Math.round(diff / (7 * 86_400_000))));
}

function clampWeeks(n: number, min = 4, max = 24) {
  return Math.max(min, Math.min(max, n));
}

// --- running plans ---

function runningPlan(a: OnboardingAnswers, totalWeeks: number): WeekPlan[] {
  const isBeginnerGoal = a.goal === "finish_5k" || a.goal === "lose_weight" || a.goal === "general_fitness";
  const isHalf = a.goal === "finish_half";
  const isFull = a.goal === "finish_full";

  const baseKmByLevel: Record<string, number> = {
    beginner: isBeginnerGoal ? 10 : 20,
    intermediate: isHalf ? 35 : isFull ? 40 : 25,
    advanced: isFull ? 60 : 45,
  };
  const baseKm = baseKmByLevel[a.level] ?? 20;
  const peakKm = isFull
    ? baseKm * 2.2
    : isHalf
    ? baseKm * 1.8
    : baseKm * 1.5;

  const weeks: WeekPlan[] = [];

  for (let w = 1; w <= totalWeeks; w++) {
    const phase = w / totalWeeks;
    const isTaper = phase > 0.85;
    const isPeak = phase > 0.65 && phase <= 0.85;

    let weekKm: number;
    if (isTaper) {
      weekKm = peakKm * (1 - (phase - 0.85) / 0.15 * 0.4);
    } else if (isPeak) {
      weekKm = peakKm;
    } else {
      weekKm = baseKm + (peakKm - baseKm) * (phase / 0.65);
    }
    // Every 4th week = recovery (80% volume)
    if (w % 4 === 0 && !isTaper) weekKm *= 0.8;

    weekKm = Math.round(weekKm);

    const theme = isTaper
      ? "plan.theme.taper"
      : isPeak
      ? "plan.theme.peak"
      : w % 4 === 0
      ? "plan.theme.recovery"
      : w <= totalWeeks * 0.33
      ? "plan.theme.base"
      : "plan.theme.build";

    const daysPerWeek = a.level === "beginner" ? 3 : a.level === "intermediate" ? 4 : 5;
    const days: DayPlan[] = buildRunningWeek(w, weekKm, daysPerWeek, a.level, a.goal);

    weeks.push({
      week: w,
      theme_key: theme,
      days,
      total_km: weekKm,
      total_min: days.reduce((s, d) => s + d.duration_min, 0),
    });
  }

  return weeks;
}

function buildRunningWeek(
  week: number,
  totalKm: number,
  daysPerWeek: number,
  level: string,
  goal: string,
): DayPlan[] {
  const longKm = Math.round(totalKm * (level === "beginner" ? 0.3 : 0.35));
  const tempoKm = Math.round(totalKm * 0.2);
  const easyKm = Math.max(4, Math.round((totalKm - longKm - tempoKm) / (daysPerWeek - 2)));

  const days: DayPlan[] = [];

  // Sun: easy or rest
  if (daysPerWeek >= 4) {
    days.push({ day: 0, session_type: "easy_run", duration_min: Math.round(easyKm * 6), distance_km: easyKm, description_key: "session.easy_run", intensity: "easy" });
  } else {
    days.push({ day: 0, session_type: "rest", duration_min: 0, description_key: "session.rest", intensity: "rest" });
  }

  // Mon: rest
  days.push({ day: 1, session_type: "rest", duration_min: 0, description_key: "session.rest", intensity: "rest" });

  // Tue: intervals or tempo
  const hasIntervals = level !== "beginner" && week > 3;
  days.push({
    day: 2,
    session_type: hasIntervals ? "intervals" : "tempo",
    duration_min: hasIntervals ? 45 : Math.round(tempoKm * 5.5),
    distance_km: hasIntervals ? undefined : tempoKm,
    description_key: hasIntervals ? "session.intervals" : "session.tempo",
    intensity: "hard",
  });

  // Wed: rest or easy
  if (daysPerWeek >= 5) {
    days.push({ day: 3, session_type: "easy_run", duration_min: Math.round(easyKm * 6), distance_km: easyKm, description_key: "session.easy_run", intensity: "easy" });
  } else {
    days.push({ day: 3, session_type: "rest", duration_min: 0, description_key: "session.rest", intensity: "rest" });
  }

  // Thu: easy
  days.push({ day: 4, session_type: "easy_run", duration_min: Math.round(easyKm * 6), distance_km: easyKm, description_key: "session.easy_run", intensity: "easy" });

  // Fri: rest
  days.push({ day: 5, session_type: "rest", duration_min: 0, description_key: "session.rest", intensity: "rest" });

  // Sat: long run
  days.push({
    day: 6,
    session_type: goal === "finish_5k" || goal === "lose_weight" ? "easy_run" : "long_run",
    duration_min: Math.round(longKm * 7),
    distance_km: longKm,
    description_key: "session.long_run",
    intensity: "easy",
  });

  return days;
}

// --- fitness/general plan ---

function fitnessPlan(a: OnboardingAnswers, totalWeeks: number): WeekPlan[] {
  const sessionsPerWeek = Math.min(5, Math.max(2, Math.round(a.weekly_hours / 1.2)));
  const weeks: WeekPlan[] = [];

  for (let w = 1; w <= totalWeeks; w++) {
    const phase = w / totalWeeks;
    const theme = w % 4 === 0 ? "plan.theme.recovery" : phase < 0.4 ? "plan.theme.base" : "plan.theme.build";
    const durationMin = Math.round(30 + phase * 30);
    const days: DayPlan[] = [];
    const pattern: SessionType[] = ["easy_run", "strength", "cross_train", "yoga", "easy_run", "strength", "recovery"];

    for (let d = 0; d < 7; d++) {
      const active = sessionsPerWeek >= 5 || (d !== 1 && d !== 5);
      days.push({
        day: d as DayPlan["day"],
        session_type: active ? pattern[d] : "rest",
        duration_min: active ? durationMin : 0,
        description_key: active ? `session.${pattern[d]}` : "session.rest",
        intensity: active ? (d === 1 || d === 3 ? "moderate" : "easy") : "rest",
      });
    }

    weeks.push({ week: w, theme_key: theme, days, total_min: days.reduce((s, d) => s + d.duration_min, 0) });
  }

  return weeks;
}

// --- template-based plan helper ---

type DayTpl = readonly [SessionType, number, string, "easy" | "moderate" | "hard" | "rest"];

function templatePlan(
  a: OnboardingAnswers,
  totalWeeks: number,
  base: DayTpl[],
  advanced: DayTpl[],
): WeekPlan[] {
  const pattern = a.level === "advanced" ? advanced : base;
  const weeks: WeekPlan[] = [];
  for (let w = 1; w <= totalWeeks; w++) {
    const phase = w / totalWeeks;
    const isDeload = w % 4 === 0;
    const scale = isDeload ? 0.7 : 0.75 + phase * 0.25;
    const theme = isDeload ? "plan.theme.recovery"
      : phase < 0.4 ? "plan.theme.base"
      : phase < 0.75 ? "plan.theme.build"
      : "plan.theme.peak";
    const days: DayPlan[] = pattern.map(([type, baseDur, descKey, intensity], i) => ({
      day: i as DayPlan["day"],
      session_type: type,
      duration_min: intensity === "rest" ? 0 : Math.round(baseDur * scale),
      description_key: descKey,
      intensity,
    }));
    weeks.push({ week: w, theme_key: theme, days, total_min: days.reduce((s, d) => s + d.duration_min, 0) });
  }
  return weeks;
}

// --- trail running ---

function trailPlan(a: OnboardingAnswers, totalWeeks: number): WeekPlan[] {
  const d = a.level === "beginner" ? 40 : 60;
  const BASE: DayTpl[] = [
    ["rest", 0, "session.rest", "rest"],
    ["trail_run", d, "session.trail_run", "easy"],
    ["rest", 0, "session.rest", "rest"],
    ["hill_repeat", 50, "session.hill_repeat", "hard"],
    ["trail_run", d, "session.trail_run", "moderate"],
    ["rest", 0, "session.rest", "rest"],
    ["long_trail", Math.round(d * 1.8), "session.long_trail", "easy"],
  ];
  const ADV: DayTpl[] = [
    ["trail_run", d, "session.trail_run", "easy"],
    ["strength", 40, "session.strength", "moderate"],
    ["hill_repeat", 60, "session.hill_repeat", "hard"],
    ["trail_run", d, "session.trail_run", "easy"],
    ["intervals", 50, "session.intervals", "hard"],
    ["rest", 0, "session.rest", "rest"],
    ["long_trail", Math.round(d * 2), "session.long_trail", "easy"],
  ];
  return templatePlan(a, totalWeeks, BASE, ADV);
}

// --- strength training ---

function strengthPlan(a: OnboardingAnswers, totalWeeks: number): WeekPlan[] {
  const d = a.level === "beginner" ? 45 : 60;
  const BASE: DayTpl[] = [
    ["rest", 0, "session.rest", "rest"],
    ["push", d, "session.push", "moderate"],
    ["rest", 0, "session.rest", "rest"],
    ["pull", d, "session.pull", "moderate"],
    ["rest", 0, "session.rest", "rest"],
    ["legs", d, "session.legs", "hard"],
    ["rest", 0, "session.rest", "rest"],
  ];
  const ADV: DayTpl[] = [
    ["push", d, "session.push", "moderate"],
    ["pull", d, "session.pull", "moderate"],
    ["legs", d, "session.legs", "hard"],
    ["rest", 0, "session.rest", "rest"],
    ["push", d, "session.push", "hard"],
    ["full_body", d, "session.full_body", "moderate"],
    ["rest", 0, "session.rest", "rest"],
  ];
  return templatePlan(a, totalWeeks, BASE, ADV);
}

// --- crossfit ---

function crossfitPlan(a: OnboardingAnswers, totalWeeks: number): WeekPlan[] {
  const d = a.level === "beginner" ? 45 : 60;
  const BASE: DayTpl[] = [
    ["rest", 0, "session.rest", "rest"],
    ["wod", d, "session.wod", "hard"],
    ["skill_work", 40, "session.skill_work", "moderate"],
    ["rest", 0, "session.rest", "rest"],
    ["wod", d, "session.wod", "hard"],
    ["conditioning", 45, "session.conditioning", "moderate"],
    ["rest", 0, "session.rest", "rest"],
  ];
  const ADV: DayTpl[] = [
    ["wod", d, "session.wod", "hard"],
    ["strength", d, "session.strength", "moderate"],
    ["wod", d, "session.wod", "hard"],
    ["skill_work", 45, "session.skill_work", "moderate"],
    ["wod", d, "session.wod", "hard"],
    ["conditioning", 50, "session.conditioning", "moderate"],
    ["rest", 0, "session.rest", "rest"],
  ];
  return templatePlan(a, totalWeeks, BASE, ADV);
}

// --- boxing / martial arts ---

function boxingPlan(a: OnboardingAnswers, totalWeeks: number): WeekPlan[] {
  const d = a.level === "beginner" ? 45 : 60;
  const BASE: DayTpl[] = [
    ["rest", 0, "session.rest", "rest"],
    ["technique", d, "session.technique", "moderate"],
    ["conditioning", 40, "session.conditioning", "moderate"],
    ["rest", 0, "session.rest", "rest"],
    ["bag_work", d, "session.bag_work", "hard"],
    ["rest", 0, "session.rest", "rest"],
    ["sparring", d, "session.sparring", "hard"],
  ];
  const ADV: DayTpl[] = [
    ["technique", d, "session.technique", "moderate"],
    ["conditioning", 50, "session.conditioning", "hard"],
    ["bag_work", d, "session.bag_work", "hard"],
    ["rest", 0, "session.rest", "rest"],
    ["technique", d, "session.technique", "moderate"],
    ["sparring", d, "session.sparring", "hard"],
    ["recovery", 30, "session.recovery", "easy"],
  ];
  return templatePlan(a, totalWeeks, BASE, ADV);
}

// --- climbing ---

function climbingPlan(a: OnboardingAnswers, totalWeeks: number): WeekPlan[] {
  const d = a.level === "beginner" ? 60 : 90;
  const BASE: DayTpl[] = [
    ["rest", 0, "session.rest", "rest"],
    ["bouldering", d, "session.bouldering", "moderate"],
    ["rest", 0, "session.rest", "rest"],
    ["hangboard", 30, "session.hangboard", "hard"],
    ["rest", 0, "session.rest", "rest"],
    ["lead_climb", d, "session.lead_climb", "hard"],
    ["rest", 0, "session.rest", "rest"],
  ];
  const ADV: DayTpl[] = [
    ["bouldering", d, "session.bouldering", "hard"],
    ["hangboard", 40, "session.hangboard", "hard"],
    ["rest", 0, "session.rest", "rest"],
    ["lead_climb", d, "session.lead_climb", "hard"],
    ["hangboard", 30, "session.hangboard", "moderate"],
    ["bouldering", d, "session.bouldering", "moderate"],
    ["rest", 0, "session.rest", "rest"],
  ];
  return templatePlan(a, totalWeeks, BASE, ADV);
}

// --- yoga / wellness ---

function yogaPlan(a: OnboardingAnswers, totalWeeks: number): WeekPlan[] {
  const BASE: DayTpl[] = [
    ["yoga_flow", 45, "session.yoga_flow", "easy"],
    ["rest", 0, "session.rest", "rest"],
    ["yin_yoga", 50, "session.yin_yoga", "easy"],
    ["rest", 0, "session.rest", "rest"],
    ["yoga_flow", 45, "session.yoga_flow", "moderate"],
    ["meditation", 20, "session.meditation", "easy"],
    ["rest", 0, "session.rest", "rest"],
  ];
  const ADV: DayTpl[] = [
    ["yoga_flow", 60, "session.yoga_flow", "moderate"],
    ["meditation", 20, "session.meditation", "easy"],
    ["yin_yoga", 60, "session.yin_yoga", "easy"],
    ["yoga_flow", 60, "session.yoga_flow", "hard"],
    ["meditation", 20, "session.meditation", "easy"],
    ["yin_yoga", 50, "session.yin_yoga", "easy"],
    ["rest", 0, "session.rest", "rest"],
  ];
  return templatePlan(a, totalWeeks, BASE, ADV);
}

// --- pilates ---

function pilatesPlan(a: OnboardingAnswers, totalWeeks: number): WeekPlan[] {
  const d = a.level === "beginner" ? 40 : 55;
  const BASE: DayTpl[] = [
    ["rest", 0, "session.rest", "rest"],
    ["pilates_mat", d, "session.pilates_mat", "moderate"],
    ["rest", 0, "session.rest", "rest"],
    ["pilates_reformer", d, "session.pilates_reformer", "moderate"],
    ["pilates_mat", d, "session.pilates_mat", "easy"],
    ["rest", 0, "session.rest", "rest"],
    ["recovery", 20, "session.recovery", "easy"],
  ];
  const ADV: DayTpl[] = [
    ["pilates_mat", d, "session.pilates_mat", "moderate"],
    ["pilates_reformer", d, "session.pilates_reformer", "hard"],
    ["rest", 0, "session.rest", "rest"],
    ["pilates_mat", d, "session.pilates_mat", "hard"],
    ["pilates_reformer", d, "session.pilates_reformer", "moderate"],
    ["pilates_mat", d, "session.pilates_mat", "moderate"],
    ["recovery", 20, "session.recovery", "easy"],
  ];
  return templatePlan(a, totalWeeks, BASE, ADV);
}

// --- tennis ---

function tennisPlan(a: OnboardingAnswers, totalWeeks: number): WeekPlan[] {
  const d = a.level === "beginner" ? 60 : 90;
  const BASE: DayTpl[] = [
    ["rest", 0, "session.rest", "rest"],
    ["tennis_drill", d, "session.tennis_drill", "moderate"],
    ["conditioning", 40, "session.conditioning", "moderate"],
    ["rest", 0, "session.rest", "rest"],
    ["tennis_drill", d, "session.tennis_drill", "hard"],
    ["rest", 0, "session.rest", "rest"],
    ["match_play", 90, "session.match_play", "hard"],
  ];
  const ADV: DayTpl[] = [
    ["conditioning", 45, "session.conditioning", "moderate"],
    ["tennis_drill", d, "session.tennis_drill", "hard"],
    ["rest", 0, "session.rest", "rest"],
    ["tennis_drill", d, "session.tennis_drill", "moderate"],
    ["conditioning", 45, "session.conditioning", "hard"],
    ["match_play", 90, "session.match_play", "hard"],
    ["rest", 0, "session.rest", "rest"],
  ];
  return templatePlan(a, totalWeeks, BASE, ADV);
}

// --- football / soccer ---

function footballPlan(a: OnboardingAnswers, totalWeeks: number): WeekPlan[] {
  const d = a.level === "beginner" ? 60 : 90;
  const BASE: DayTpl[] = [
    ["rest", 0, "session.rest", "rest"],
    ["technical", d, "session.technical", "moderate"],
    ["conditioning", 45, "session.conditioning", "moderate"],
    ["rest", 0, "session.rest", "rest"],
    ["tactical", d, "session.tactical", "moderate"],
    ["rest", 0, "session.rest", "rest"],
    ["match", 90, "session.match", "hard"],
  ];
  const ADV: DayTpl[] = [
    ["conditioning", 50, "session.conditioning", "moderate"],
    ["technical", d, "session.technical", "hard"],
    ["tactical", d, "session.tactical", "moderate"],
    ["rest", 0, "session.rest", "rest"],
    ["technical", d, "session.technical", "hard"],
    ["conditioning", 45, "session.conditioning", "moderate"],
    ["match", 90, "session.match", "hard"],
  ];
  return templatePlan(a, totalWeeks, BASE, ADV);
}

// --- main export ---

export function generatePlan(a: OnboardingAnswers): { weeks: WeekPlan[]; weeks_total: number } {
  const totalWeeks = clampWeeks(weeksUntilRace(a.race_date));

  let weeks: WeekPlan[];
  if (a.sport === "running" || a.goal.startsWith("finish_")) {
    weeks = runningPlan(a, totalWeeks);
  } else if (a.sport === "trail") {
    weeks = trailPlan(a, totalWeeks);
  } else if (a.sport === "strength") {
    weeks = strengthPlan(a, totalWeeks);
  } else if (a.sport === "crossfit") {
    weeks = crossfitPlan(a, totalWeeks);
  } else if (a.sport === "boxing") {
    weeks = boxingPlan(a, totalWeeks);
  } else if (a.sport === "climbing") {
    weeks = climbingPlan(a, totalWeeks);
  } else if (a.sport === "yoga") {
    weeks = yogaPlan(a, totalWeeks);
  } else if (a.sport === "tennis") {
    weeks = tennisPlan(a, totalWeeks);
  } else if (a.sport === "football") {
    weeks = footballPlan(a, totalWeeks);
  } else if (a.sport === "pilates") {
    weeks = pilatesPlan(a, totalWeeks);
  } else {
    weeks = fitnessPlan(a, totalWeeks);
  }

  return { weeks, weeks_total: totalWeeks };
}

import { clamp } from "./utils.js";

export function bmi(weightKg, heightCm) {
  const h = (Number(heightCm) || 0) / 100;
  const w = Number(weightKg) || 0;
  if (!h || !w) return { value: 0, category: "" };
  const v = w / (h * h);
  const value = Math.round(v * 10) / 10;
  const category =
    value < 18.5
      ? "Underweight"
      : value < 25
        ? "Normal"
        : value < 30
          ? "Overweight"
          : "Obese";
  return { value, category };
}

export function bmrMifflin({ gender, weightKg, heightCm, age }) {
  const W = Number(weightKg) || 0;
  const H = Number(heightCm) || 0;
  const A = Number(age) || 0;
  if (!W || !H || !A) return 0;
  const base = 10 * W + 6.25 * H - 5 * A;
  const g = (gender || "male").toLowerCase();
  return Math.round(base + (g === "female" ? -161 : 5));
}

export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  lightlyActive: 1.375,
  active: 1.55,
  veryActive: 1.725
};

export function tdee(bmr, activityLevel) {
  const mult = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round((Number(bmr) || 0) * mult);
}

export const LOSS_DELTAS = {
  0.25: -275,
  0.5: -550,
  0.75: -825,
  1.0: -1100
};

export const GAIN_DELTAS = {
  0.1: 110,
  0.25: 275,
  0.5: 550
};

export function calorieTargetFromGoal({ goal, speedKgPerWeek, tdeeKcal, gender }) {
  const g = goal || "lose";
  const t = Number(tdeeKcal) || 0;
  const s = Number(speedKgPerWeek) || 0;
  const delta = g === "gain" ? (GAIN_DELTAS[s] ?? 0) : g === "lose" ? (LOSS_DELTAS[s] ?? 0) : -275;
  const raw = t + delta;
  const floor = (gender || "male") === "female" ? 1400 : 1600;
  const calories = Math.max(floor, Math.round(raw));
  const warning = g === "lose" && s >= 1.0 ? "Very aggressive deficit. Expect fatigue/hunger; consider 0.5–0.75 kg/week." : "";
  return { calories, floor, warning, delta };
}

export function macroTargets({ calories, goal, weightKg, targetWeightKg, advancedMacros = true }) {
  const cals = Number(calories) || 0;
  const w = Number(weightKg) || 0;
  const tw = Number(targetWeightKg) || 0;
  const baseWeight = tw > 0 ? tw : w;

  const proteinPerKg = goal === "gain" ? 1.6 : 1.8;
  const proteinG = Math.round(clamp(baseWeight * proteinPerKg, 90, 260));

  if (!advancedMacros) {
    return { calories: cals, proteinG, fatG: 0, carbsG: 0 };
  }

  const fatG = Math.round(clamp(baseWeight * 0.8, 40, 120));
  const proteinCals = proteinG * 4;
  const fatCals = fatG * 9;
  const carbsCals = Math.max(0, cals - proteinCals - fatCals);
  const carbsG = Math.round(carbsCals / 4);
  return { calories: cals, proteinG, fatG, carbsG };
}

export function computeTargetsFromSettings(settings) {
  const p = settings?.profile || {};
  const goal = settings?.goal || {};
  const lifestyle = settings?.lifestyle || {};
  const bmiOut = bmi(p.weightKg || p.startWeightKg, p.heightCm);
  const bmr = bmrMifflin({ gender: p.gender, weightKg: p.weightKg || p.startWeightKg, heightCm: p.heightCm, age: p.age });
  const tdeeKcal = tdee(bmr, lifestyle.activityLevel || "sedentary");
  const { calories, warning, delta } = calorieTargetFromGoal({
    goal: goal.type || "lose",
    speedKgPerWeek: goal.speedKgPerWeek || 0.5,
    tdeeKcal,
    gender: p.gender || "male"
  });
  const macros = macroTargets({
    calories,
    goal: goal.type || "lose",
    weightKg: p.weightKg || p.startWeightKg,
    targetWeightKg: goal.targetWeightKg || p.targetWeightKg,
    advancedMacros: Boolean(goal.advancedMacros)
  });
  return {
    bmi: bmiOut,
    bmr,
    tdee: tdeeKcal,
    delta,
    warning,
    ...macros
  };
}

export function expectedWeightSeries({ startWeightKg, startDateISO, dates, goal }) {
  const startW = Number(startWeightKg) || 0;
  const type = goal?.type || "lose";
  const s = Number(goal?.speedKgPerWeek || 0.5);
  const sign = type === "gain" ? 1 : type === "lose" ? -1 : -0.5;
  return (dates || []).map((dISO) => {
    const days = Math.round((new Date(dISO).getTime() - new Date(startDateISO).getTime()) / 86400000);
    const weeks = days / 7;
    const w = startW + sign * s * weeks;
    return Math.round(w * 10) / 10;
  });
}

// Simple moving average over N days (based on available samples). Returns array of {date,value}
export function movingAverage(points, windowDays = 7) {
  if (!Array.isArray(points) || points.length === 0) return [];
  const out = [];
  for (let i = 0; i < points.length; i++) {
    const end = new Date(points[i].date).getTime();
    const start = end - windowDays * 86400000;
    const inWindow = points.filter((p) => {
      const t = new Date(p.date).getTime();
      return t >= start && t <= end;
    });
    const avg = inWindow.reduce((a, p) => a + Number(p.value || 0), 0) / Math.max(1, inWindow.length);
    out.push({ date: points[i].date, value: Math.round(avg * 10) / 10 });
  }
  return out;
}

export function plateauSuggestion(weights, goal) {
  if (!Array.isArray(weights) || weights.length < 4) return null;
  const type = goal?.type || "lose";
  if (type === "gain") return null;
  // plateau if last 14-21 days show no drop
  const last = weights[weights.length - 1];
  const lastT = new Date(last.date).getTime();
  const recent = weights.filter((w) => lastT - new Date(w.date).getTime() <= 21 * 86400000);
  if (recent.length < 3) return null;
  const first = recent[0];
  const delta = last.value - first.value;
  if (delta > -0.2) {
    return "Plateau signal (≈2–3 weeks). If adherence is solid, adjust: -100 kcal/day OR +2000 steps/day.";
  }
  return null;
}

export function adherenceScore(logs) {
  if (!Array.isArray(logs) || logs.length === 0) return { score: 0, label: "" };
  const recent = logs.slice(-14);
  let total = 0;
  let done = 0;
  for (const l of recent) {
    const w = l.workoutChecks || [];
    const m = l.mealChecks || [];
    const h = l.habitChecks ? Object.values(l.habitChecks) : [];
    total += w.length + m.length + h.length;
    done += w.filter((x) => x.done).length + m.filter((x) => x.done).length + h.filter(Boolean).length;
  }
  const pct = total ? Math.round((done / total) * 100) : 0;
  const label = pct >= 85 ? "Strong" : pct >= 70 ? "Okay" : "Low";
  return { score: pct, label };
}

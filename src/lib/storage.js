import { build8WeekPlan, buildPlan, buildDailyLogFromPlan, defaultStrengthTemplate, recommendedSauceForTemplateKey } from "./plan.js";
import { isoDate, parseISO, uid } from "./utils.js";
import { defaultPricingState } from "./pricing.js";
import { computeTargetsFromSettings } from "./calculations.js";

const KEY = "mfd_v1";

function migrateState(state) {
  state.meta = state.meta || {};
  if (!state.meta.schemaVersion) state.meta.schemaVersion = 1;

  // Backward-compatible migration: ensure new fields exist without breaking old users.
  if (!state || typeof state !== "object") return state;

  // Pricing model added in 2026-01.
  if (!state.pricing) {
    state.pricing = defaultPricingState();
  } else {
    // Ensure nested defaults
    const d = defaultPricingState();
    state.pricing.productsByKey = state.pricing.productsByKey || d.productsByKey;
    state.pricing.selectedProductIdByKey = state.pricing.selectedProductIdByKey || d.selectedProductIdByKey;
    state.pricing.settings = { ...d.settings, ...(state.pricing.settings || {}) };
  }

  // Previous versions stored groceryBought under settings; keep it.
  state.settings.groceryBought = state.settings.groceryBought || {};

  // Setup wizard (schema v2): make sure settings buckets exist.
  state.settings.profile = state.settings.profile || {};
  // Keep legacy startWeightKg for old installs; also create weightKg.
  if (!state.settings.profile.weightKg) state.settings.profile.weightKg = state.settings.profile.startWeightKg;

  state.settings.goal = state.settings.goal || {
    type: "lose",
    targetWeightKg: state.settings.profile.targetWeightKg || 0,
    speedKgPerWeek: 0.5,
    advancedMacros: false
  };
  state.settings.lifestyle = state.settings.lifestyle || {
    activityLevel: "sedentary",
    jobType: "desk",
    sleepHours: 7,
    stress: "medium",
    stepsAvg: 0
  };
  state.settings.training = state.settings.training || {
    hasDumbbells: true,
    timePerSession: 45,
    daysPerWeek: 4,
    experience: "beginner",
    injuries: []
  };
  state.settings.nutrition = state.settings.nutrition || {
    budget: "low",
    mealsPerDay: 5,
    restrictions: "none",
    dislikes: "",
    typicalFoods: []
  };

  state.settings.groceryScale = state.settings.groceryScale || { eatOutDaysPerWeek: 0 };

  // Targets auto-computed from wizard. Keep existing manual targets intact.
  state.settings.targetsAuto = state.settings.targetsAuto || computeTargetsFromSettings(state.settings);

  // First-run gate: existing users shouldn't be forced.
  if (state.meta.setupCompleted === undefined) {
    state.meta.setupCompleted = true;
  }

  // Upgrade schemaVersion
  state.meta.schemaVersion = 2;

  // Sauce recommendations added (informational). Attach to existing planDays safely.
  // This keeps old users compatible without requiring a plan rebuild.
  try {
    for (const d of state.planDays || []) {
      for (const m of d.meals || []) {
        if (m && m.templateKey && !m.sauce) {
          const s = recommendedSauceForTemplateKey(m.templateKey);
          if (s) {
            m.sauce = { id: s.id, name: s.name, portionRule: s.portionRule, lowCalNote: s.lowCalNote };
          }
        }
      }
    }
  } catch {
    // ignore migration errors
  }

  return state;
}

export function defaultSettings() {
  // Monday=0..Sunday=6
  return {
    profile: {
      gender: "male",
      age: 25,
      heightCm: 170,
      startWeightKg: 95,
      weightKg: 95,
      targetWeightKg: 74
    },
    goal: { type: "lose", targetWeightKg: 74, speedKgPerWeek: 0.5, advancedMacros: false },
    lifestyle: { activityLevel: "sedentary", jobType: "desk", sleepHours: 7, stress: "medium", stepsAvg: 0 },
    training: { hasDumbbells: true, timePerSession: 45, daysPerWeek: 4, experience: "beginner", injuries: [] },
    nutrition: { budget: "low", mealsPerDay: 5, restrictions: "none", dislikes: "", typicalFoods: [] },
    units: { weight: "kg", length: "cm" },
    startDate: isoDate(new Date()),
    targets: {
      calories: 2100,
      proteinG: 150,
      waterL: 2.5,
      steps: 6000,
      sleepH: 7.5
    },
    targetsAuto: null,
    mealTiming: {
      breakfast: "09:00",
      snack1: "11:30",
      lunch: "14:30",
      snack2: "17:30",
      dinner: "20:30"
    },
    workoutWeekdays: {
      // Defaults: A Tue+Fri, B Mon+Thu, C Sat optional
      A: [1, 4],
      B: [0, 3],
      C: [5]
    },
    groceryScale: { eatOutDaysPerWeek: 0 },
    theme: "dark"
  };
}

export function ensureBootstrapped() {
  const existing = localStorage.getItem(KEY);
  if (existing) return;

  const settings = defaultSettings();
  settings.targetsAuto = computeTargetsFromSettings(settings);
  const planDays = buildPlan(settings.startDate, settings.workoutWeekdays, {
    weeks: 12,
    mealsPerDay: settings.nutrition.mealsPerDay,
    targets: settings.targetsAuto
  });
  const logs = planDays.map((d) => buildDailyLogFromPlan(d));

  const measurements = [
    // Prefill start weight at startDate
    {
      id: uid("m"),
      date: settings.startDate,
      type: "weight",
      value: settings.profile.startWeightKg
    }
  ];

  const data = {
    settings,
    planDays,
    logs,
    measurements,
    pricing: defaultPricingState(),
    meta: { createdAt: new Date().toISOString(), schemaVersion: 2, setupCompleted: false }
  };
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function loadState() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return migrateState(parsed);
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function exportJSON() {
  return localStorage.getItem(KEY) || "{}";
}

export function importJSON(jsonString) {
  const parsed = JSON.parse(jsonString);
  // minimal validation
  if (!parsed.settings || !parsed.planDays || !parsed.logs || !parsed.measurements) {
    throw new Error("Invalid backup: missing required fields.");
  }
  localStorage.setItem(KEY, JSON.stringify(migrateState(parsed)));
}

export function rebuildPlan(state) {
  // Rebuild planDays + logs but keep measurements
  const settings = state.settings;
  // Recompute targetsAuto from current settings (wizard)
  settings.targetsAuto = computeTargetsFromSettings(settings);
  const planDays = buildPlan(settings.startDate, settings.workoutWeekdays, {
    weeks: 12,
    mealsPerDay: settings?.nutrition?.mealsPerDay || 5,
    targets: settings.targetsAuto
  });
  const logs = planDays.map((d) => buildDailyLogFromPlan(d));

  // Preserve any existing logs for matching dates (including notes/checks)
  const oldLogByDate = new Map(state.logs.map((l) => [l.date, l]));
  const mergedLogs = logs.map((nl) => {
    const old = oldLogByDate.get(nl.date);
    return old ? { ...nl, ...old } : nl;
  });

  return { ...state, planDays, logs: mergedLogs };
}

export function getDayX(settings, dateISO) {
  const start = parseISO(settings.startDate);
  const cur = parseISO(dateISO);
  const ms = cur.getTime() - start.getTime();
  return Math.floor(ms / 86400000) + 1;
}

export function getTodayISO() {
  return isoDate(new Date());
}

export function getLogByDate(state, dateISO) {
  return state.logs.find((l) => l.date === dateISO) || null;
}

export function upsertMeasurement(state, m) {
  const idx = state.measurements.findIndex((x) => x.id === m.id);
  if (idx >= 0) state.measurements[idx] = m;
  else state.measurements.push(m);
}

export function newStrengthEntry() {
  return defaultStrengthTemplate();
}

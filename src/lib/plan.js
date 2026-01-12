import { addDays, isoDate, weekdayIndexFromISO, uid } from "./utils.js";
import { pickMealsForDay, pickBalancedMealsForDay } from "./meals.js";

/**
 * Embedded plan from conversation (8+ weeks generator)
 * Male 25, 170cm, 95kg -> target 74kg
 * Calories 2100/day, Protein 150g/day
 */

export const WORKOUT_TEMPLATES = {
  warmup: [
    { id: "wu1", label: "Jumping jacks — 1 min" },
    { id: "wu2", label: "Arm circles — 30 sec" },
    { id: "wu3", label: "Hip circles — 30 sec" },
    { id: "wu4", label: "Bodyweight squats — 15 reps" },
    { id: "wu5", label: "Shoulder rolls + deep breathing — 60 sec" }
  ],
  cooldown: [
    { id: "cd1", label: "Hip flexor stretch — 45 sec/side" },
    { id: "cd2", label: "Hamstring stretch — 45 sec/side" },
    { id: "cd3", label: "Chest opener — 45 sec" },
    { id: "cd4", label: "Child’s pose breathing — 60 sec" }
  ],
  progression: [
    "If you hit the top reps with clean form → increase dumbbell weight next time.",
    "If you feel tired → keep weight, improve form + control.",
    "Low-energy day → do 2 sets only (do not skip entirely)."
  ],
  A: {
    name: "Day A — Lower + Core",
    steps: [
      { id: "a1", label: "Goblet squat — 4×10–12 (rest 60s)" },
      { id: "a2", label: "DB Romanian deadlift — 4×10 (rest 60–90s)" },
      { id: "a3", label: "Reverse lunges — 3×8/leg (rest 60s)" },
      { id: "a4", label: "Standing calf raises — 3×15 (rest 45s)" },
      { id: "a5", label: "Plank — 3×30–45s (rest 45–60s)" }
    ]
  },
  B: {
    name: "Day B — Upper",
    steps: [
      { id: "b1", label: "DB floor press — 4×8–10 (rest 60–90s)" },
      { id: "b2", label: "One-arm DB row — 4×10/arm (rest 60s)" },
      { id: "b3", label: "Standing shoulder press — 3×8–10 (rest 60–90s)" },
      { id: "b4", label: "Lateral raises — 3×12–15 (rest 45–60s)" },
      { id: "b5", label: "Curls + triceps extensions — 3×10–12 each (rest 60s)" }
    ]
  },
  C: {
    name: "Day C — Conditioning (Optional)",
    steps: [
      { id: "c1", label: "Farmer carries — 4 rounds × 30–40s (rest 60s)" },
      { id: "c2", label: "Bodyweight squats — 3×20 (rest 45–60s)" },
      { id: "c3", label: "Mountain climbers — 3×30s (rest 45–60s)" }
    ]
  }
};

export const MEAL_SLOTS = ["Breakfast", "Snack 1", "Lunch", "Snack 2", "Dinner"];

// --- Optional low-calorie Moroccan sauces (informational only; not counted in calories) ---
// Sauces are suggestions, not mandatory.
export const SAUCES = {
  yogurtGarlic: {
    id: "yogurtGarlic",
    name: "Yogurt–Garlic Sauce",
    portionRule: "1–2 tbsp max",
    lowCalNote: "Low-calorie flavor boost",
    ingredients: [
      // Purchase-oriented approximations per use (for weekly aggregation)
      { groceryKey: "garlic", qty: 0.15 },
      { groceryKey: "lemon", qty: 0.1 },
      { groceryKey: "spices", qty: 0.03 },
      { groceryKey: "herbs", qty: 0.05 }
    ],
    displayIngredients: [
      "Yogurt / lben",
      "Garlic",
      "Lemon or vinegar",
      "Cumin",
      "Black pepper",
      "Salt",
      "Optional parsley/coriander"
    ],
    steps: [
      "Mix yogurt/lben with crushed garlic.",
      "Add lemon (or vinegar), cumin, black pepper, and a pinch of salt.",
      "Optional: add chopped parsley/coriander.",
      "Rest 5–10 minutes so the garlic flavor opens up."
    ],
    storage: "Fridge 2–3 days in a sealed container."
  },
  lightChermoula: {
    id: "lightChermoula",
    name: "Light Chermoula Sauce",
    portionRule: "Use lightly (no extra oil)",
    lowCalNote: "Spice-forward; max 1 tsp olive oil per batch",
    ingredients: [
      { groceryKey: "garlic", qty: 0.2 },
      { groceryKey: "lemon", qty: 0.15 },
      { groceryKey: "spices", qty: 0.05 },
      { groceryKey: "herbs", qty: 0.07 }
    ],
    displayIngredients: [
      "Garlic",
      "Cumin",
      "Paprika",
      "Coriander",
      "Lemon",
      "Salt",
      "Max 1 tsp olive oil per batch"
    ],
    steps: [
      "Crush garlic with cumin, paprika, coriander, salt, and lemon juice.",
      "Add herbs (coriander/parsley).",
      "Optional: add up to 1 tsp olive oil for the whole batch (not per serving).",
      "Marinate chicken/sardines 10–30 minutes or spoon over after cooking."
    ],
    storage: "Fridge 2–3 days. Keep oil minimal."
  },
  tomatoOnion: {
    id: "tomatoOnion",
    name: "Tomato–Onion Reduction",
    portionRule: "2 tbsp max",
    lowCalNote: "Cooked-down flavor; max 1 tsp olive oil",
    ingredients: [
      { groceryKey: "onion", qty: 0.15 }, // kg
      { groceryKey: "tomato", qty: 0.25 }, // kg
      { groceryKey: "garlic", qty: 0.1 },
      { groceryKey: "spices", qty: 0.04 }
    ],
    displayIngredients: [
      "Onion",
      "Tomato",
      "Garlic",
      "Paprika",
      "Black pepper",
      "Salt",
      "Max 1 tsp olive oil"
    ],
    steps: [
      "Slice onion, grate tomato, mince garlic.",
      "Cook onion with max 1 tsp olive oil until soft.",
      "Add tomato + spices; reduce until thick (water evaporates).",
      "Use as a topping for vegetables/tagine-style plates."
    ],
    storage: "Fridge 2–3 days. Reheat gently."
  }
};

function sauceForMealTemplate(templateKey) {
  // 0–1 recommended sauce per meal (suggestion only)
  if (templateKey === "lunchTagine") return SAUCES.lightChermoula;
  if (templateKey === "breakfast") return SAUCES.yogurtGarlic;
  if (templateKey === "snackEggs") return SAUCES.yogurtGarlic;
  if (templateKey === "dinnerNoBread") return SAUCES.tomatoOnion;
  return null;
}

// Exported helper for migrations / UI that needs to attach sauce recommendations
export function recommendedSauceForTemplateKey(templateKey) {
  return sauceForMealTemplate(templateKey);
}

export const MEAL_TEMPLATES = {
  // Low/medium budget Moroccan-friendly, portion rules embedded
  breakfast: {
    title: "Protein breakfast",
    items: [
      { name: "Eggs", portion: "3 eggs", grams: 150, groceryKey: "eggs", qty: 3, note: "Boiled or omelet" },
      { name: "Khobz", portion: "¼–⅓ small loaf", grams: 60, groceryKey: "khobz", qty: 0.3, note: "Control portion" },
      { name: "Tomato + onion", portion: "1–2 cups", grams: 250, groceryKey: "veg_mix", qty: 1, note: "Add cumin/salt" },
      { name: "Tea", portion: "No sugar", grams: 0, groceryKey: "tea", qty: 1, note: "Allowed, no sugar" }
    ]
  },
  snackYogurt: {
    title: "Fruit + dairy",
    items: [
      { name: "Yogurt / Lben", portion: "1 cup", grams: 250, groceryKey: "yogurt", qty: 1, note: "Plain if possible" },
      { name: "Fruit", portion: "1 piece", grams: 150, groceryKey: "fruit", qty: 1, note: "Apple/banana/orange" }
    ]
  },
  lunchTagine: {
    title: "Tagine-based lunch",
    items: [
      { name: "Chicken thighs OR sardines", portion: "150–200g cooked", grams: 180, groceryKey: "protein_main", qty: 1, note: "Chicken thighs = budget friendly" },
      { name: "Vegetables", portion: "2–3 cups", grams: 400, groceryKey: "veg_mix", qty: 1.5, note: "Tomatoes/onions/carrots/zucchini" },
      { name: "Olive oil", portion: "1 tbsp max", grams: 14, groceryKey: "olive_oil", qty: 0.07, note: "Measure it. Don’t guess." },
      { name: "Khobz", portion: "¼ loaf max", grams: 50, groceryKey: "khobz", qty: 0.25, note: "Optional if hungry" }
    ]
  },
  snackEggs: {
    title: "Simple protein snack",
    items: [
      { name: "Boiled eggs", portion: "2 eggs", grams: 100, groceryKey: "eggs", qty: 2, note: "" },
      { name: "Peanuts (optional)", portion: "small handful", grams: 20, groceryKey: "peanuts", qty: 0.2, note: "Optional; keep small" }
    ]
  },
  dinnerNoBread: {
    title: "Light dinner (no khobz rule)",
    items: [
      { name: "Tuna OR lentils/chickpeas", portion: "1 can or 1–1.5 cups", grams: 180, groceryKey: "protein_alt", qty: 1, note: "Dinner rule: no khobz" },
      { name: "Salad / cooked vegetables", portion: "2 cups", grams: 300, groceryKey: "veg_mix", qty: 1, note: "Add lemon + spices" }
    ]
  }
};

export const HABITS = [
  { key: "water", label: "Water 2–3L" },
  { key: "sleep", label: "Sleep 7–8h" },
  { key: "teaNoSugar", label: "Tea no sugar" },
  { key: "noSoda", label: "No soda" },
  { key: "lateNightControl", label: "Late-night eating controlled" }
];

export function defaultStrengthTemplate() {
  return {
    squat: { label: "Goblet squat", weightKg: 0, reps: 0 },
    rdl: { label: "DB RDL", weightKg: 0, reps: 0 },
    press: { label: "Shoulder press", weightKg: 0, reps: 0 },
    row: { label: "DB row", weightKg: 0, reps: 0 }
  };
}

function makeMealsForDay() {
  // 5 slots
  return [
    { slot: "Breakfast", templateKey: "breakfast" },
    { slot: "Snack 1", templateKey: "snackYogurt" },
    { slot: "Lunch", templateKey: "lunchTagine" },
    { slot: "Snack 2", templateKey: "snackEggs" },
    { slot: "Dinner", templateKey: "dinnerNoBread" }
  ].map((m) => ({
    id: uid("meal"),
    slot: m.slot,
    templateKey: m.templateKey,
    title: MEAL_TEMPLATES[m.templateKey].title,
    items: MEAL_TEMPLATES[m.templateKey].items,
    sauce: (() => {
      const s = sauceForMealTemplate(m.templateKey);
      if (!s) return null;
      return {
        id: s.id,
        name: s.name,
        portionRule: s.portionRule,
        lowCalNote: s.lowCalNote
      };
    })()
  }));
}

function makeWorkoutSteps(type) {
  if (!type) return null;
  const t = WORKOUT_TEMPLATES[type];
  return {
    type,
    title: t.name,
    warmup: WORKOUT_TEMPLATES.warmup.map((s) => ({ ...s })),
    main: t.steps.map((s) => ({ ...s })),
    cooldown: WORKOUT_TEMPLATES.cooldown.map((s) => ({ ...s })),
    progression: [...WORKOUT_TEMPLATES.progression]
  };
}

export function buildPlan(startDateISO, workoutWeekdays, options = {}) {
  // workoutWeekdays: { A:[0..6], B:[0..6], C:[0..6] } where Monday=0
  const weeks = Number(options.weeks || 12);
  const mealsPerDay = Number(options.mealsPerDay || 5);
  const targets = options.targets || null;

  const days = [];
  const start = new Date(startDateISO + "T00:00:00");
  const totalDays = weeks * 7;

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(start, i);
    const iso = isoDate(date);
    const wd = weekdayIndexFromISO(iso);

    let workoutType = null;
    if (workoutWeekdays?.A?.includes(wd)) workoutType = "A";
    if (workoutWeekdays?.B?.includes(wd)) workoutType = "B";
    if (!workoutType && workoutWeekdays?.C?.includes(wd)) workoutType = "C";

    const rotateIndex = Math.floor(i / 1);
    const mealsPicked = (targets ? pickBalancedMealsForDay({ mealsPerDay, rotateIndex, targets }) : pickMealsForDay({ mealsPerDay, rotateIndex }));
    const meals = mealsPicked.map(({ slot, meal }) => ({
      id: uid("meal"),
      slot,
      templateKey: meal.templateKey,
      title: meal.name,
      items: (meal.display || []).map((x) => ({ ...x })),
      ingredients: (meal.ingredients || []).map((x) => ({ ...x })),
      macros: { ...(meal.macros || {}) },
      sauce: (() => {
        const s = sauceForMealTemplate(meal.templateKey);
        if (!s) return null;
        return { id: s.id, name: s.name, portionRule: s.portionRule, lowCalNote: s.lowCalNote };
      })()
    }));

    const dayMacros = meals.reduce(
      (acc, m) => {
        const mm = m.macros || {};
        acc.calories += Number(mm.calories || 0);
        acc.proteinG += Number(mm.proteinG || 0);
        acc.fatG += Number(mm.fatG || 0);
        acc.carbsG += Number(mm.carbsG || 0);
        return acc;
      },
      { calories: 0, proteinG: 0, fatG: 0, carbsG: 0 }
    );

    days.push({
      id: uid("day"),
      date: iso,
      weekIndex: Math.floor(i / 7) + 1,
      dayIndex: i + 1,
      workoutType,
      workout: makeWorkoutSteps(workoutType),
      meals,
      dayMacros,
      targets: targets ? { ...targets } : null
    });
  }

  return days;
}

export function build8WeekPlan(startDateISO, workoutWeekdays) {
  return buildPlan(startDateISO, workoutWeekdays, { weeks: 8, mealsPerDay: 5 });
}

export function dayStatus(planDay, log) {
  // completed/partial/missed/none
  if (!log) return "none";
  const totalChecks =
    (log.workoutChecks?.length || 0) +
    (log.mealChecks?.length || 0) +
    (log.habitChecks ? Object.keys(log.habitChecks).length : 0);

  const doneChecks =
    (log.workoutChecks?.filter((x) => x.done).length || 0) +
    (log.mealChecks?.filter((x) => x.done).length || 0) +
    (log.habitChecks ? Object.values(log.habitChecks).filter(Boolean).length : 0);

  if (totalChecks === 0) return "none";
  if (doneChecks === 0) return "missed";
  if (doneChecks >= totalChecks * 0.9) return "completed";
  return "partial";
}

export function buildDailyLogFromPlan(planDay) {
  const workoutChecks = [];
  const mealChecks = [];
  if (planDay.workout) {
    const allSteps = [...planDay.workout.warmup, ...planDay.workout.main, ...planDay.workout.cooldown];
    for (const s of allSteps) workoutChecks.push({ id: uid("wck"), stepId: s.id, label: s.label, done: false });
  }
  for (const meal of planDay.meals) {
    mealChecks.push({ id: uid("mck"), mealId: meal.id, label: `${meal.slot}: ${meal.title}`, done: false });
  }
  const habitChecks = {};
  for (const h of HABITS) habitChecks[h.key] = false;

  return {
    id: uid("log"),
    date: planDay.date,
    notes: "",
    workoutChecks,
    mealChecks,
    habitChecks,
    steps: 0,
    waterL: 0,
    sleepH: 0,
    calories: 0,
    proteinG: 0,
    strength: null
  };
}

/**
 * Grocery generation from meals
 * Returns { items: [{key,name,qty,unit,note,bought}] }
 */
export function groceryFromPlanDays(planDaysForWeek, existingBoughtMap = {}) {
  // Grocery keys mapping to Moroccan items
  const map = {
    eggs: { name: "Eggs", unit: "pcs", note: "Cheap protein" },
    khobz: { name: "Khobz", unit: "loaves", note: "Portion control: ¼–⅓" },
    veg_mix: { name: "Vegetables (seasonal mix)", unit: "kg", note: "Buy seasonal for budget" },
    tomato: { name: "Tomato", unit: "kg", note: "Seasonal is cheaper" },
    onion: { name: "Onion", unit: "kg", note: "Base for salads/sauces" },
    lemon: { name: "Lemon", unit: "pcs", note: "Or vinegar" },
    tea: { name: "Tea", unit: "pack", note: "No sugar" },
    yogurt: { name: "Yogurt / Lben", unit: "L", note: "Plain if possible" },
    fruit: { name: "Fruits (apple/banana/orange)", unit: "pcs", note: "Pick affordable" },
    olive_oil: { name: "Olive oil", unit: "L", note: "Measure 1 tbsp" },
    peanuts: { name: "Peanuts", unit: "kg", note: "Optional; small portions" },
    chicken: { name: "Chicken thighs", unit: "kg", note: "Budget-friendly" },
    sardines: { name: "Sardines", unit: "kg", note: "Great protein + omega-3" },
    tuna: { name: "Tuna", unit: "cans", note: "Prefer plain (water/brine)" },
    lentils: { name: "Lentils", unit: "kg", note: "Dry weight" }
  };

  const totals = {};
  for (const d of planDaysForWeek) {
    for (const meal of d.meals) {
      // New model: use ingredients when available
      if (Array.isArray(meal.ingredients) && meal.ingredients.length > 0) {
        for (const ing of meal.ingredients) {
          const k = ing.groceryKey;
          if (!k) continue;
          const amt = Number(ing.amount || 0);
          const unit = ing.unit || "";
          // Normalize to purchase units
          let v = amt;
          let u = unit;
          if (unit === "g") {
            v = amt / 1000;
            u = "kg";
          }
          if (unit === "ml") {
            v = amt / 1000;
            u = "L";
          }
          // We store totals by key in *purchase* units we display.
          // For some keys we keep pcs/cans/loaf.
          totals[k] = totals[k] || { qty: 0, unit: u };
          totals[k].qty += v;
          totals[k].unit = totals[k].unit || u;
        }
      } else {
        // Legacy model: use rough qty mapping from item.qty
        for (const item of meal.items || []) {
          const k = item.groceryKey;
          if (!k) continue;
          totals[k] = totals[k] || { qty: 0, unit: "x" };
          totals[k].qty += Number(item.qty || 0);
        }
      }
    }
  }

  // Convert rough quantities to more human
  // veg_mix qty ~ 1 means ~0.7kg; protein_main 1 means ~0.25kg; protein_alt 1 means 1 unit; olive_oil 0.07 means ~0.07L (70ml)
  const normalized = [];
  for (const [k, obj] of Object.entries(totals)) {
    const v = typeof obj === "number" ? obj : Number(obj.qty || 0);
    const meta = map[k] || { name: k, unit: "x", note: "" };
    let qty = v;

    // Legacy rough key normalization
    if (k === "veg_mix") qty = v * 0.7;
    if (k === "peanuts" && (totals[k]?.unit === "x" || typeof totals[k] === "number")) qty = v * 0.1;

    // Normalize common units
    if (k === "khobz") qty = Math.max(1, Math.round(v));
    if (k === "fruit") qty = Math.max(1, Math.round(v));
    if (k === "eggs") qty = Math.max(1, Math.round(v));
    if (k === "tuna") qty = Math.max(1, Math.round(v));

    // Yogurt/Lben in L (cups were legacy)
    if (k === "yogurt" && (totals[k]?.unit === "x" || typeof totals[k] === "number")) {
      // Legacy: 1 cup ≈ 0.25L
      qty = Math.round(v * 0.25 * 10) / 10;
    }

    // If ingredient normalized already, keep.
    if (meta.unit === "kg" || meta.unit === "L") qty = Math.round(qty * 10) / 10;

    normalized.push({
      key: k,
      name: meta.name,
      unit: meta.unit,
      note: meta.note,
      qty: Math.round(qty * 10) / 10,
      bought: Boolean(existingBoughtMap[k])
    });
  }

  // Sort: proteins first, then veg, then others
  const order = ["chicken", "sardines", "tuna", "lentils", "eggs", "veg_mix", "tomato", "onion", "fruit", "yogurt", "khobz", "olive_oil", "lemon", "tea", "peanuts"];
  normalized.sort((a, b) => (order.indexOf(a.key) - order.indexOf(b.key)));

  return { items: normalized };
}

/**
 * Sauce ingredient grocery generation (auto from sauces used that week)
 * Returns { items: [{key,name,qty,unit,note,bought}] }
 *
 * Notes:
 * - Uses per-use approximations from SAUCES.ingredients
 * - Designed to be merged with the main grocery list (no duplicates by key)
 */
export function sauceGroceryFromPlanDays(planDaysForWeek, existingBoughtMap = {}) {
  const map = {
    garlic: { name: "Garlic", unit: "heads", note: "Flavor without calories" },
    lemon: { name: "Lemon", unit: "pcs", note: "Or vinegar" },
    onion: { name: "Onion", unit: "kg", note: "Base for reduction" },
    tomato: { name: "Tomato", unit: "kg", note: "Base for reduction" },
    spices: { name: "Spices", unit: "pack", note: "Cumin/paprika/pepper/salt" },
    herbs: { name: "Parsley/Coriander", unit: "bunch", note: "Optional" }
  };

  const totals = {};
  for (const d of planDaysForWeek) {
    for (const meal of d.meals) {
      const sauceId = meal?.sauce?.id;
      if (!sauceId) continue;
      const s = SAUCES[sauceId];
      if (!s?.ingredients) continue;
      for (const ing of s.ingredients) {
        const k = ing.groceryKey;
        totals[k] = (totals[k] || 0) + (ing.qty || 0);
      }
    }
  }

  const items = [];
  for (const [k, v] of Object.entries(totals)) {
    const meta = map[k];
    if (!meta) continue;
    let qty = v;

    // Light normalization so the list stays realistic
    if (k === "garlic") qty = Math.max(1, Math.round(v)); // heads
    if (k === "lemon") qty = Math.max(1, Math.round(v));
    if (k === "spices") qty = Math.max(1, Math.round(v));
    if (k === "herbs") qty = Math.max(1, Math.round(v));
    if (k === "onion" || k === "tomato") qty = Math.round(v * 10) / 10;

    items.push({
      key: k,
      name: meta.name,
      unit: meta.unit,
      note: meta.note,
      qty,
      bought: Boolean(existingBoughtMap[k])
    });
  }

  const order = ["garlic", "lemon", "onion", "tomato", "spices", "herbs"];
  items.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key));
  return { items };
}

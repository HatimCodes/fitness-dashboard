// Morocco-focused meal library with estimated macros and ingredients.
// Macros are estimates (good enough for planning; not medical advice).

// ingredient units:
// - g: grams (will be normalized to kg in groceries)
// - ml: milliliters (normalized to L)
// - pcs: pieces

export const MEAL_LIBRARY = {
  breakfast_eggs_khobz: {
    id: "breakfast_eggs_khobz",
    name: "Eggs + khobz + veg",
    tags: ["easy", "budget", "high-protein"],
    macros: { calories: 520, proteinG: 30, fatG: 22, carbsG: 42 },
    ingredients: [
      { groceryKey: "eggs", name: "Eggs", amount: 3, unit: "pcs" },
      { groceryKey: "khobz", name: "Khobz", amount: 0.3, unit: "loaf" },
      { groceryKey: "tomato", name: "Tomato", amount: 250, unit: "g" },
      { groceryKey: "onion", name: "Onion", amount: 80, unit: "g" },
      { groceryKey: "tea", name: "Tea", amount: 1, unit: "unit" }
    ],
    display: [
      { name: "Eggs", portion: "3 eggs" },
      { name: "Khobz", portion: "¼–⅓ loaf" },
      { name: "Tomato + onion", portion: "1–2 cups" },
      { name: "Tea", portion: "No sugar" }
    ],
    templateKey: "breakfast"
  },
  snack_yogurt_fruit: {
    id: "snack_yogurt_fruit",
    name: "Yogurt/lben + fruit",
    tags: ["easy", "budget"],
    macros: { calories: 240, proteinG: 12, fatG: 6, carbsG: 35 },
    ingredients: [
      { groceryKey: "yogurt", name: "Yogurt / Lben", amount: 250, unit: "ml" },
      { groceryKey: "fruit", name: "Fruit", amount: 1, unit: "pcs" }
    ],
    display: [
      { name: "Yogurt / Lben", portion: "1 cup" },
      { name: "Fruit", portion: "1 piece" }
    ],
    templateKey: "snackYogurt"
  },
  lunch_chicken_tagine: {
    id: "lunch_chicken_tagine",
    name: "Chicken tagine (veg heavy)",
    tags: ["budget", "high-protein"],
    macros: { calories: 650, proteinG: 45, fatG: 28, carbsG: 50 },
    ingredients: [
      { groceryKey: "chicken", name: "Chicken thighs", amount: 250, unit: "g" },
      { groceryKey: "tomato", name: "Tomato", amount: 250, unit: "g" },
      { groceryKey: "onion", name: "Onion", amount: 150, unit: "g" },
      { groceryKey: "veg_mix", name: "Mixed vegetables", amount: 350, unit: "g" },
      { groceryKey: "olive_oil", name: "Olive oil", amount: 5, unit: "ml" },
      { groceryKey: "khobz", name: "Khobz", amount: 0.25, unit: "loaf" }
    ],
    display: [
      { name: "Chicken thighs", portion: "150–200g cooked" },
      { name: "Vegetables", portion: "2–3 cups" },
      { name: "Olive oil", portion: "1 tsp–1 tbsp max" },
      { name: "Khobz", portion: "¼ loaf (optional)" }
    ],
    templateKey: "lunchTagine"
  },
  lunch_sardines_tomato: {
    id: "lunch_sardines_tomato",
    name: "Sardines + salad + khobz",
    tags: ["budget", "high-protein", "quick"],
    macros: { calories: 600, proteinG: 40, fatG: 30, carbsG: 40 },
    ingredients: [
      { groceryKey: "sardines", name: "Sardines", amount: 220, unit: "g" },
      { groceryKey: "tomato", name: "Tomato", amount: 300, unit: "g" },
      { groceryKey: "onion", name: "Onion", amount: 80, unit: "g" },
      { groceryKey: "olive_oil", name: "Olive oil", amount: 5, unit: "ml" },
      { groceryKey: "khobz", name: "Khobz", amount: 0.25, unit: "loaf" }
    ],
    display: [
      { name: "Sardines", portion: "200g" },
      { name: "Salad", portion: "2 cups" },
      { name: "Khobz", portion: "¼ loaf" }
    ],
    templateKey: "lunchTagine"
  },
  snack_eggs_peanuts: {
    id: "snack_eggs_peanuts",
    name: "Eggs + small peanuts",
    tags: ["easy"],
    macros: { calories: 280, proteinG: 18, fatG: 18, carbsG: 8 },
    ingredients: [
      { groceryKey: "eggs", name: "Eggs", amount: 2, unit: "pcs" },
      { groceryKey: "peanuts", name: "Peanuts", amount: 20, unit: "g" }
    ],
    display: [
      { name: "Boiled eggs", portion: "2 eggs" },
      { name: "Peanuts", portion: "small handful (optional)" }
    ],
    templateKey: "snackEggs"
  },
  dinner_tuna_salad: {
    id: "dinner_tuna_salad",
    name: "Tuna + big salad (no khobz)",
    tags: ["easy", "high-protein"],
    macros: { calories: 480, proteinG: 45, fatG: 12, carbsG: 45 },
    ingredients: [
      { groceryKey: "tuna", name: "Tuna", amount: 1, unit: "can" },
      { groceryKey: "tomato", name: "Tomato", amount: 250, unit: "g" },
      { groceryKey: "onion", name: "Onion", amount: 60, unit: "g" },
      { groceryKey: "veg_mix", name: "Mixed vegetables", amount: 250, unit: "g" },
      { groceryKey: "lemon", name: "Lemon", amount: 0.5, unit: "pcs" }
    ],
    display: [
      { name: "Tuna", portion: "1 can" },
      { name: "Salad / veggies", portion: "2–3 cups" },
      { name: "Lemon + spices", portion: "free" }
    ],
    templateKey: "dinnerNoBread"
  },
  dinner_lentils_plate: {
    id: "dinner_lentils_plate",
    name: "Lentils bowl + vegetables (no khobz)",
    tags: ["budget", "fiber"],
    macros: { calories: 520, proteinG: 28, fatG: 12, carbsG: 75 },
    ingredients: [
      { groceryKey: "lentils", name: "Lentils (dry)", amount: 90, unit: "g" },
      { groceryKey: "tomato", name: "Tomato", amount: 200, unit: "g" },
      { groceryKey: "onion", name: "Onion", amount: 100, unit: "g" },
      { groceryKey: "olive_oil", name: "Olive oil", amount: 5, unit: "ml" }
    ],
    display: [
      { name: "Lentils", portion: "1–1.5 cups cooked" },
      { name: "Veg", portion: "2 cups" }
    ],
    templateKey: "dinnerNoBread"
  }
};

export const SLOT_DEFAULTS = ["Breakfast", "Snack 1", "Lunch", "Snack 2", "Dinner"];

export function pickMealsForDay({ mealsPerDay = 5, rotateIndex = 0 }) {
  const keys = Object.keys(MEAL_LIBRARY);
  // simple rotation: step through library for main meals, snacks fixed.
  const breakfast = MEAL_LIBRARY.breakfast_eggs_khobz;
  const snack = MEAL_LIBRARY.snack_yogurt_fruit;
  const snack2 = MEAL_LIBRARY.snack_eggs_peanuts;
  const lunchPool = [MEAL_LIBRARY.lunch_chicken_tagine, MEAL_LIBRARY.lunch_sardines_tomato];
  const dinnerPool = [MEAL_LIBRARY.dinner_tuna_salad, MEAL_LIBRARY.dinner_lentils_plate];

  const lunch = lunchPool[rotateIndex % lunchPool.length];
  const dinner = dinnerPool[rotateIndex % dinnerPool.length];

  const base = [
    { slot: "Breakfast", meal: breakfast },
    { slot: "Lunch", meal: lunch },
    { slot: "Dinner", meal: dinner }
  ];

  if (mealsPerDay >= 4) base.splice(1, 0, { slot: "Snack 1", meal: snack });
  if (mealsPerDay >= 5) base.splice(3, 0, { slot: "Snack 2", meal: snack2 });

  return base;
}


// --- Advanced (but lightweight) balancing: choose lunch+dinner combo that best matches targets,
// then apply small "add-ons" (fruit/egg/yogurt/khobz/olive oil) to close remaining gaps.
function scoreMacros(total, targets) {
  if (!targets) return 0;
  const tc = Number(targets.calories || 0);
  const tp = Number(targets.proteinG || 0);
  const tf = Number(targets.fatG || 0);
  const tcarb = Number(targets.carbsG || 0);

  const c = Number(total.calories || 0);
  const p = Number(total.proteinG || 0);
  const f = Number(total.fatG || 0);
  const carb = Number(total.carbsG || 0);

  // balanced weighting: calories + protein slightly prioritized, but keep all in play.
  const dc = tc ? (c - tc) / tc : 0;
  const dp = tp ? (p - tp) / tp : 0;
  const df = tf ? (f - tf) / tf : 0;
  const dcarb = tcarb ? (carb - tcarb) / tcarb : 0;

  return (dc * dc) * 3 + (dp * dp) * 2 + (df * df) * 1 + (dcarb * dcarb) * 1;
}

function sumMacros(meals) {
  return meals.reduce(
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
}

function cloneMeal(meal) {
  return {
    ...meal,
    macros: { ...(meal.macros || {}) },
    ingredients: (meal.ingredients || []).map((x) => ({ ...x })),
    display: (meal.display || []).map((x) => ({ ...x }))
  };
}

function mergeAddon(intoMeal, addon) {
  const m = cloneMeal(intoMeal);
  const a = cloneMeal(addon);
  m.name = `${m.name} + ${a.name}`;
  m.macros = {
    calories: Number(m.macros?.calories || 0) + Number(a.macros?.calories || 0),
    proteinG: Number(m.macros?.proteinG || 0) + Number(a.macros?.proteinG || 0),
    fatG: Number(m.macros?.fatG || 0) + Number(a.macros?.fatG || 0),
    carbsG: Number(m.macros?.carbsG || 0) + Number(a.macros?.carbsG || 0)
  };
  m.ingredients = [...(m.ingredients || []), ...(a.ingredients || [])];
  m.display = [...(m.display || []), ...(a.display || [])];
  return m;
}

// Small add-ons (used ONLY to close gaps; they are portion-controlled).
const ADDONS = {
  extraFruit: {
    id: "addon_fruit",
    name: "Extra fruit",
    tags: ["easy", "budget"],
    macros: { calories: 80, proteinG: 1, fatG: 0, carbsG: 21 },
    ingredients: [{ groceryKey: "fruit", name: "Fruit", amount: 1, unit: "pcs" }],
    display: [{ name: "Fruit", portion: "1 piece (apple/banana/orange)" }],
    templateKey: "addon"
  },
  extraEgg: {
    id: "addon_egg",
    name: "Extra egg",
    tags: ["easy", "budget", "high-protein"],
    macros: { calories: 70, proteinG: 6, fatG: 5, carbsG: 0 },
    ingredients: [{ groceryKey: "eggs", name: "Eggs", amount: 1, unit: "pcs" }],
    display: [{ name: "Egg", portion: "1 egg" }],
    templateKey: "addon"
  },
  extraYogurt: {
    id: "addon_yogurt",
    name: "Extra yogurt/lben",
    tags: ["easy", "budget", "high-protein"],
    macros: { calories: 120, proteinG: 8, fatG: 4, carbsG: 12 },
    ingredients: [{ groceryKey: "yogurt", name: "Yogurt/Lben", amount: 250, unit: "ml" }],
    display: [{ name: "Yogurt/Lben", portion: "1 cup" }],
    templateKey: "addon"
  },
  extraKhobzQuarter: {
    id: "addon_khobz",
    name: "Extra khobz (¼)",
    tags: ["budget"],
    macros: { calories: 120, proteinG: 4, fatG: 1, carbsG: 24 },
    ingredients: [{ groceryKey: "khobz", name: "Khobz", amount: 0.25, unit: "loaf" }],
    display: [{ name: "Khobz", portion: "¼ loaf" }],
    templateKey: "addon"
  },
  oliveOilTsp: {
    id: "addon_oil",
    name: "Olive oil (1 tsp)",
    tags: ["easy"],
    macros: { calories: 40, proteinG: 0, fatG: 4.5, carbsG: 0 },
    ingredients: [{ groceryKey: "olive_oil", name: "Olive oil", amount: 5, unit: "ml" }],
    display: [{ name: "Olive oil", portion: "1 tsp" }],
    templateKey: "addon"
  }
};

export function pickBalancedMealsForDay({ mealsPerDay = 5, rotateIndex = 0, targets }) {
  // Base fixed meals/snacks (Morocco-friendly)
  const breakfast = MEAL_LIBRARY.breakfast_eggs_khobz;
  const snack1 = MEAL_LIBRARY.snack_yogurt_fruit;
  const snack2 = MEAL_LIBRARY.snack_eggs_peanuts;

  const lunchPool = [MEAL_LIBRARY.lunch_chicken_tagine, MEAL_LIBRARY.lunch_sardines_tomato];
  const dinnerPool = [MEAL_LIBRARY.dinner_tuna_salad, MEAL_LIBRARY.dinner_lentils_plate];

  // Try all combos (small library = brute force).
  let best = null;
  for (const lunch of lunchPool) {
    for (const dinner of dinnerPool) {
      const base = [
        { slot: "Breakfast", meal: breakfast },
        { slot: "Lunch", meal: lunch },
        { slot: "Dinner", meal: dinner }
      ];
      if (mealsPerDay >= 4) base.splice(1, 0, { slot: "Snack 1", meal: snack1 });
      if (mealsPerDay >= 5) base.splice(3, 0, { slot: "Snack 2", meal: snack2 });

      const total = sumMacros(base.map((x) => x.meal));
      const sc = scoreMacros(total, targets);
      if (!best || sc < best.score) best = { score: sc, meals: base, total };
    }
  }

  // Apply small add-ons to close remaining gaps (kept minimal).
  // We attach add-ons to Snack 2 first, then Dinner, to keep UX simple.
  let meals = best.meals.map((x) => ({ slot: x.slot, meal: x.meal }));
  let total = { ...best.total };

  function applyAddon(slotName, addonKey) {
    const idx = meals.findIndex((x) => x.slot === slotName);
    if (idx < 0) return;
    meals[idx] = { ...meals[idx], meal: mergeAddon(meals[idx].meal, ADDONS[addonKey]) };
    const a = ADDONS[addonKey].macros;
    total = {
      calories: total.calories + Number(a.calories || 0),
      proteinG: total.proteinG + Number(a.proteinG || 0),
      fatG: total.fatG + Number(a.fatG || 0),
      carbsG: total.carbsG + Number(a.carbsG || 0)
    };
  }

  if (targets) {
    const tc = Number(targets.calories || 0) || 0;
    const tp = Number(targets.proteinG || 0) || 0;
    const tf = Number(targets.fatG || 0) || 0;
    const tcarb = Number(targets.carbsG || 0) || 0;

    const within = (val, t) => (t ? Math.abs(val - t) / t <= 0.1 : true);

    // Only add if under targets (no "cut" logic—combos already minimize overshoot).
    // Max 2 add-ons/day.
    let addonsUsed = 0;

    const slotPref = mealsPerDay >= 5 ? "Snack 2" : (mealsPerDay >= 4 ? "Snack 1" : "Dinner");

    // Protein gap first if big
    if (addonsUsed < 2 && tp && total.proteinG < tp * 0.9) {
      applyAddon(slotPref, "extraEgg");
      addonsUsed++;
    }
    // Calories/carbs gap
    if (addonsUsed < 2 && tc && total.calories < tc * 0.92) {
      if (tcarb && total.carbsG < tcarb * 0.9) {
        applyAddon(slotPref, "extraFruit");
      } else if (tf && total.fatG < tf * 0.9) {
        applyAddon("Dinner", "oliveOilTsp");
      } else {
        applyAddon(slotPref, "extraYogurt");
      }
      addonsUsed++;
    }
    // Still low calories, small khobz quarter (daytime only; attach to lunch)
    if (addonsUsed < 2 && tc && total.calories < tc * 0.92) {
      applyAddon("Lunch", "extraKhobzQuarter");
      addonsUsed++;
    }

    // Re-score and if we accidentally made it worse, undo is overkill; keep simple.
  }

  return meals;
}


import { useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import { addDays, isoDate, parseISO } from "../lib/utils.js";
import { SAUCES, groceryFromPlanDays, sauceGroceryFromPlanDays } from "../lib/plan.js";
import { applyMonthly, computeCosts, formatMAD } from "../lib/pricing.js";

export default function Grocery({ state, setState }) {
  const [weekStartISO, setWeekStartISO] = useState(state.settings.startDate);
  const [showSauces, setShowSauces] = useState(false);

  const weekDays = useMemo(() => {
    const start = parseISO(weekStartISO);
    return Array.from({ length: 7 }, (_, i) => isoDate(addDays(start, i)));
  }, [weekStartISO]);

  const planDays = useMemo(() => {
    const byDate = new Map(state.planDays.map((d) => [d.date, d]));
    return weekDays.map((iso) => byDate.get(iso)).filter(Boolean);
  }, [state.planDays, weekDays]);

  // store bought toggles in state.settings (simple)
  const boughtMap = state.settings.groceryBought || {};
  const mainList = useMemo(() => groceryFromPlanDays(planDays, boughtMap), [planDays, boughtMap]);
  const sauceList = useMemo(() => sauceGroceryFromPlanDays(planDays, boughtMap), [planDays, boughtMap]);

  // Servings scale: if you eat out X days/week, reduce grocery demand.
  const eatOutDays = Number(state.settings.groceryScale?.eatOutDaysPerWeek || 0);
  const scaleFactor = Math.max(0, Math.min(1, (7 - eatOutDays) / 7));

  function scaleItems(items) {
    return (items || []).map((it) => ({
      ...it,
      qty: Math.round((Number(it.qty || 0) * scaleFactor) * 100) / 100
    }));
  }

  const merged = useMemo(() => {
    // Merge sauce ingredients into main list by key (no duplicates).
    const main = mainList.items.map((x) => ({ ...x }));
    const byKey = new Map(main.map((x) => [x.key, x]));

    const sauceOnly = [];
    for (const s of sauceList.items) {
      if (byKey.has(s.key)) {
        // Merge qty into existing item
        const t = byKey.get(s.key);
        t.qty = Math.round((Number(t.qty || 0) + Number(s.qty || 0)) * 10) / 10;
      } else {
        sauceOnly.push({ ...s });
      }
    }

    return { main, sauceOnly };
  }, [mainList.items, sauceList.items]);

  // Pricing settings
  const pricing = state.settings.pricing || { mode: "weekly", monthlyMultiplier: 4.3, priceByKey: {} };
  const mode = pricing.mode || "weekly";
  const multiplier = pricing.monthlyMultiplier || 4.3;
  const priceByKey = pricing.priceByKey || {};

  const mainCosts = useMemo(() => computeCosts(scaleItems(merged.main), priceByKey), [merged.main, priceByKey, scaleFactor]);
  const sauceCosts = useMemo(() => computeCosts(scaleItems(merged.sauceOnly), priceByKey), [merged.sauceOnly, priceByKey, scaleFactor]);

  const totalWeekly = Math.round((mainCosts.total + sauceCosts.total) * 100) / 100;
  const missingPrices = mainCosts.missing + sauceCosts.missing;
  const totalMonthly = applyMonthly(totalWeekly, multiplier);
  const displayTotal = mode === "monthly" ? totalMonthly : totalWeekly;

  function toggleBought(key) {
    const next = structuredClone(state);
    next.settings.groceryBought = {
      ...(next.settings.groceryBought || {}),
      [key]: !Boolean((next.settings.groceryBought || {})[key])
    };
    setState(next);
  }

  function shiftWeek(delta) {
    const d = parseISO(weekStartISO);
    const nd = addDays(d, delta * 7);
    setWeekStartISO(isoDate(nd));
  }

  function setMode(nextMode) {
    const next = structuredClone(state);
    next.settings.pricing = next.settings.pricing || { mode: "weekly", monthlyMultiplier: 4.3, priceByKey: {} };
    next.settings.pricing.mode = nextMode;
    setState(next);
  }

  function setMultiplier(v) {
    const next = structuredClone(state);
    next.settings.pricing = next.settings.pricing || { mode: "weekly", monthlyMultiplier: 4.3, priceByKey: {} };
    next.settings.pricing.monthlyMultiplier = v;
    setState(next);
  }

  function setEatOutDaysPerWeek(v) {
    const next = structuredClone(state);
    next.settings.groceryScale = next.settings.groceryScale || { eatOutDaysPerWeek: 0 };
    next.settings.groceryScale.eatOutDaysPerWeek = v;
    setState(next);
  }

  function setUnitPrice(key, v) {
    const next = structuredClone(state);
    next.settings.pricing = next.settings.pricing || { mode: "weekly", monthlyMultiplier: 4.3, priceByKey: {} };
    next.settings.pricing.priceByKey = next.settings.pricing.priceByKey || {};
    next.settings.pricing.priceByKey[key] = { ...(next.settings.pricing.priceByKey[key] || {}), unitPriceMAD: v };
    setState(next);
  }

  return (
    <div className="space-y-4">
      <Card title="Grocery budget" right="MAD totals + saved prices">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMode("weekly")}
              className={`px-3 py-2 rounded-xl border text-sm ${
                mode === "weekly"
                  ? "border-indigo-500/50 bg-indigo-500/10 text-slate-50"
                  : "border-slate-800/70 bg-slate-900/40 text-slate-300"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setMode("monthly")}
              className={`px-3 py-2 rounded-xl border text-sm ${
                mode === "monthly"
                  ? "border-indigo-500/50 bg-indigo-500/10 text-slate-50"
                  : "border-slate-800/70 bg-slate-900/40 text-slate-300"
              }`}
            >
              Monthly
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-300">
              Total ({mode === "monthly" ? "monthly" : "weekly"}):{" "}
              <span className="font-semibold text-slate-50">{formatMAD(displayTotal)}</span>
            </div>
            {missingPrices > 0 && (
              <div className="text-xs rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-200">
                Missing prices: {missingPrices}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Servings scale</div>
              <div className="text-xs text-slate-500">Eating out reduces groceries. Prices update automatically.</div>
            </div>
            <div className="text-xs text-slate-300">Eat out: <span className="font-semibold">{eatOutDays}</span>/7</div>
          </div>
          <input
            type="range"
            min="0"
            max="7"
            step="1"
            value={eatOutDays}
            onChange={(e) => setEatOutDaysPerWeek(Number(e.target.value))}
            className="mt-3 w-full"
          />
          <div className="mt-2 text-xs text-slate-500">Scale factor: {(scaleFactor * 100).toFixed(0)}% of groceries</div>
        </div>

        {mode === "monthly" && (
          <div className="mt-3 grid md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400">Monthly multiplier</div>
              <div className="mt-1 flex items-center gap-2">
                <input
                  value={multiplier}
                  onChange={(e) => setMultiplier(Number(e.target.value))}
                  className="w-28 rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
                  type="number"
                  step="0.1"
                  min="1"
                />
                <div className="text-xs text-slate-500">Default 4.3 ≈ weeks/month</div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400">Weekly (for reference)</div>
              <div className="text-lg font-semibold mt-1">{formatMAD(totalWeekly)}</div>
            </div>

            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400">Monthly estimate</div>
              <div className="text-lg font-semibold mt-1">{formatMAD(totalMonthly)}</div>
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-slate-500">
          How it works: set a <span className="text-slate-300">MAD per unit</span> for each item (MAD/kg, MAD/pcs, etc.).
          Totals update instantly and are saved automatically.
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button
            onClick={() => setShowSauces(true)}
            className="px-3 py-2 rounded-xl border border-slate-800/70 bg-slate-900/40 text-xs text-slate-200 hover:bg-slate-900/70"
          >
            How to make the sauces
          </button>
          <div className="text-xs text-slate-500">Optional • low-calorie • Moroccan-friendly</div>
        </div>
      </Card>

      <Card title="Weekly grocery list" right="Auto-generated from meals">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => shiftWeek(-1)} className="px-3 py-2 rounded-xl bg-slate-800/60 text-sm">
            ← Prev
          </button>
          <div className="text-sm text-slate-300">
            Week starting: <span className="font-semibold">{weekStartISO}</span>
          </div>
          <button onClick={() => shiftWeek(1)} className="px-3 py-2 rounded-xl bg-slate-800/60 text-sm">
            Next →
          </button>
        </div>

        <div className="space-y-2">
          {mainCosts.priced.length === 0 ? (
            <div className="text-sm text-slate-400">
              No plan days found for this week. Adjust start date or regenerate in Settings.
            </div>
          ) : (
            mainCosts.priced.map((it) => (
              <div
                key={it.key}
                className={`w-full rounded-2xl border px-3 py-3 transition ${
                  it.bought
                    ? "border-emerald-500/40 bg-emerald-500/10"
                    : "border-slate-800/70 bg-slate-950/30 hover:bg-slate-900/60"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{it.name}</div>
                    {it.note && <div className="text-xs text-slate-500 mt-0.5">{it.note}</div>}
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-slate-200">
                      {it.qty} {it.unit}
                    </div>
                    <div className="text-xs text-slate-400">
                      Line: <span className={it.missingPrice ? "text-amber-300" : "text-slate-200"}>{formatMAD(it.costMAD)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
                  <div className="flex gap-2 items-center">
                    <div className="text-xs text-slate-400 w-24">MAD / {it.unit}</div>
                    <input
                      value={it.unitPriceMAD || ""}
                      onChange={(e) => setUnitPrice(it.key, Number(e.target.value))}
                      placeholder="0"
                      className={`w-full rounded-xl border bg-slate-950/40 px-3 py-2 text-sm outline-none ${
                        it.missingPrice ? "border-amber-500/40 focus:border-amber-400/60" : "border-slate-800/70 focus:border-indigo-500/60"
                      }`}
                      type="number"
                      step="0.01"
                      min="0"
                    />
                    {it.missingPrice && <div className="text-xs text-amber-200">Missing</div>}
                  </div>

                  <button
                    onClick={() => toggleBought(it.key)}
                    className={`px-3 py-2 rounded-xl text-sm border ${
                      it.bought ? "border-emerald-500/40 bg-emerald-500/10" : "border-slate-800/70 bg-slate-900/40"
                    }`}
                  >
                    {it.bought ? "Bought" : "Mark bought"}
                  </button>

                  <div className="text-xs text-slate-500 text-right">
                    {it.unitPriceMAD > 0 ? `${formatMAD(it.unitPriceMAD)} / ${it.unit}` : "Set price"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {merged.sauceOnly.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold">🥣 Sauce Ingredients</div>
              <div className="text-xs text-slate-500">Auto-generated from sauces used this week</div>
            </div>
            <div className="space-y-2">
              {sauceCosts.priced.map((it) => (
                <div
                  key={it.key}
                  className={`w-full rounded-2xl border px-3 py-3 transition ${
                    it.bought
                      ? "border-emerald-500/40 bg-emerald-500/10"
                      : "border-slate-800/70 bg-slate-950/30 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold">{it.name}</div>
                      {it.note && <div className="text-xs text-slate-500 mt-0.5">{it.note}</div>}
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-slate-200">
                        {it.qty} {it.unit}
                      </div>
                      <div className="text-xs text-slate-400">
                        Line:{" "}
                        <span className={it.missingPrice ? "text-amber-300" : "text-slate-200"}>
                          {formatMAD(it.costMAD)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid sm:grid-cols-[1fr_auto_auto] gap-2 items-center">
                    <div className="flex gap-2 items-center">
                      <div className="text-xs text-slate-400 w-24">MAD / {it.unit}</div>
                      <input
                        value={it.unitPriceMAD || ""}
                        onChange={(e) => setUnitPrice(it.key, Number(e.target.value))}
                        placeholder="0"
                        className={`w-full rounded-xl border bg-slate-950/40 px-3 py-2 text-sm outline-none ${
                          it.missingPrice ? "border-amber-500/40 focus:border-amber-400/60" : "border-slate-800/70 focus:border-indigo-500/60"
                        }`}
                        type="number"
                        step="0.01"
                        min="0"
                      />
                      {it.missingPrice && <div className="text-xs text-amber-200">Missing</div>}
                    </div>

                    <button
                      onClick={() => toggleBought(it.key)}
                      className={`px-3 py-2 rounded-xl text-sm border ${
                        it.bought ? "border-emerald-500/40 bg-emerald-500/10" : "border-slate-800/70 bg-slate-900/40"
                      }`}
                    >
                      {it.bought ? "Bought" : "Mark bought"}
                    </button>

                    <div className="text-xs text-slate-500 text-right">
                      {it.unitPriceMAD > 0 ? `${formatMAD(it.unitPriceMAD)} / ${it.unit}` : "Set price"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-slate-500">
          Budget note: prioritize eggs + seasonal veg + chicken thighs + lentils/chickpeas. Tuna is useful but don’t rely on it daily if price is high.
        </div>
      </Card>

      {showSauces && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
          <button
            aria-label="Close"
            onClick={() => setShowSauces(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="relative w-full md:max-w-2xl rounded-t-3xl md:rounded-3xl border border-slate-800/70 bg-slate-950/95 p-4 md:p-6 max-h-[85vh] overflow-auto">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">How to make the sauces</div>
                <div className="text-xs text-slate-400 mt-0.5">Flavor is allowed. Excess is not.</div>
              </div>
              <button
                onClick={() => setShowSauces(false)}
                className="px-3 py-2 rounded-xl border border-slate-800/70 bg-slate-900/40 text-xs text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {Object.values(SAUCES).map((s) => (
                <div key={s.id} className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{s.name}</div>
                    <div className="text-[11px] rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                      Low-calorie
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">Portion: {s.portionRule}</div>

                  <div className="mt-3 grid md:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-400 mb-2">Ingredients</div>
                      <ul className="list-disc pl-5 text-sm text-slate-200 space-y-1">
                        {(s.displayIngredients || []).map((x) => (
                          <li key={x}>{x}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-xs text-slate-400 mb-2">Steps</div>
                      <ol className="list-decimal pl-5 text-sm text-slate-200 space-y-1">
                        {s.steps.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ol>
                      <div className="mt-3 text-xs text-slate-400">Storage: {s.storage}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

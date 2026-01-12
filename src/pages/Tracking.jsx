import { useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import Chart from "../components/Chart.jsx";
import { formatHumanDate, isoDate, uid } from "../lib/utils.js";
import { upsertMeasurement, newStrengthEntry } from "../lib/storage.js";
import { expectedWeightSeries, movingAverage, plateauSuggestion, adherenceScore } from "../lib/calculations.js";

export default function Tracking({ state, setState }) {
  const [weightVal, setWeightVal] = useState("");
  const [waistVal, setWaistVal] = useState("");

  const weights = useMemo(
    () => state.measurements.filter((m) => m.type === "weight").sort((a,b) => a.date.localeCompare(b.date)),
    [state.measurements]
  );
  const waists = useMemo(
    () => state.measurements.filter((m) => m.type === "waist").sort((a,b) => a.date.localeCompare(b.date)),
    [state.measurements]
  );

  const weightChart = weights.map((m) => ({ xLabel: m.date.slice(5), y: m.value }));
  const waistChart = waists.map((m) => ({ xLabel: m.date.slice(5), y: m.value }));

  const expected = useMemo(() => {
    if (weights.length < 2) return null;
    const startWeight = weights[0].value || state.settings.profile.weightKg || state.settings.profile.startWeightKg;
    return expectedWeightSeries({
      startDateISO: weights[0].date,
      startWeightKg: startWeight,
      dates: weights.map((w) => w.date),
      goal: state.settings.goal
    });
  }, [weights, state.settings.goal, state.settings.profile]);

  const weeklyAvg = useMemo(() => movingAverage(weights.map((w) => ({ date: w.date, value: w.value })), 7), [weights]);
  const plateau = useMemo(() => plateauSuggestion(weights, state.settings.goal), [weights, state.settings.goal]);
  const adherence = useMemo(() => adherenceScore(state.logs), [state.logs]);

  function addMeasurement(type) {
    const date = isoDate(new Date());
    const value = type === "weight" ? Number(weightVal) : Number(waistVal);
    if (!Number.isFinite(value) || value <= 0) return;

    const m = { id: uid("m"), date, type, value };
    const next = structuredClone(state);
    upsertMeasurement(next, m);
    setState(next);

    if (type === "weight") setWeightVal("");
    else setWaistVal("");
  }

  // Strength tracking uses today's log (optional)
  const todayISO = isoDate(new Date());
  const logIdx = state.logs.findIndex((l) => l.date === todayISO);
  const todayLog = logIdx >= 0 ? state.logs[logIdx] : null;
  const strength = todayLog?.strength || null;

  function ensureStrength() {
    if (!todayLog) return;
    const next = structuredClone(state);
    next.logs[logIdx].strength = todayLog.strength || newStrengthEntry();
    setState(next);
  }

  function setStrength(key, field, value) {
    const next = structuredClone(state);
    next.logs[logIdx].strength[key][field] = Number(value);
    setState(next);
  }

  return (
    <div className="space-y-4">
      <Card title="Measurements (track consistently)">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
            <div className="text-sm font-semibold mb-2">Weight (2×/week)</div>
            <div className="flex gap-2">
              <input
                value={weightVal}
                onChange={(e) => setWeightVal(e.target.value)}
                placeholder="kg"
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              />
              <button onClick={() => addMeasurement("weight")} className="px-3 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-sm">
                Add
              </button>
            </div>
            <div className="mt-3">
              <Chart data={weightChart} overlay={expected || null} label="Weight (kg)" overlayLabel="Expected" />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/20 p-2">
                <div className="text-[11px] text-slate-400">Adherence (14d)</div>
                <div className="text-sm font-semibold">{adherence.score}% — {adherence.label}</div>
              </div>
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/20 p-2">
                <div className="text-[11px] text-slate-400">Weekly avg (7d)</div>
                <div className="text-sm font-semibold">{weeklyAvg[weeklyAvg.length - 1]?.value || "—"}</div>
              </div>
            </div>
            {plateau && <div className="mt-2 text-xs text-amber-200">{plateau}</div>}
            <div className="mt-2 text-xs text-slate-500">
              Weigh same scale, same time. Don’t react to single-day water changes.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
            <div className="text-sm font-semibold mb-2">Waist (every 2 weeks)</div>
            <div className="flex gap-2">
              <input
                value={waistVal}
                onChange={(e) => setWaistVal(e.target.value)}
                placeholder="cm"
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              />
              <button onClick={() => addMeasurement("waist")} className="px-3 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-sm">
                Add
              </button>
            </div>
            <div className="mt-3">
              <Chart data={waistChart} label="Waist (cm)" />
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Measure at navel, relaxed, same posture.
            </div>
          </div>
        </div>
      </Card>

      <Card title="Strength (optional but recommended)" right={`Today: ${formatHumanDate(todayISO)}`}>
        {!todayLog ? (
          <div className="text-sm text-slate-400">Today is outside the generated plan range. Update start date or regenerate plan in Settings.</div>
        ) : (
          <div className="space-y-3">
            {!strength ? (
              <button onClick={ensureStrength} className="px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-sm">
                Enable strength tracking for today
              </button>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {Object.entries(strength).map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
                    <div className="text-sm font-semibold">{v.label}</div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-slate-400">Weight (kg)</div>
                        <input
                          value={v.weightKg}
                          onChange={(e) => setStrength(k, "weightKg", e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
                        />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Reps</div>
                        <input
                          value={v.reps}
                          onChange={(e) => setStrength(k, "reps", e.target.value)}
                          className="mt-1 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-slate-500">
              Progression rule: top reps clean → increase weight next time. Low energy → 2 sets only.
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

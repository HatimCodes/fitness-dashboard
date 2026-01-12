import Card from "../components/Card.jsx";
import Toggle from "../components/Toggle.jsx";
import { rebuildPlan } from "../lib/storage.js";

const WD = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]; // Monday=0

function WeekdayPicker({ label, value, onChange }) {
  function toggle(idx) {
    const set = new Set(value);
    if (set.has(idx)) set.delete(idx);
    else set.add(idx);
    onChange(Array.from(set).sort((a,b)=>a-b));
  }
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
      <div className="text-sm font-semibold mb-2">{label}</div>
      <div className="grid grid-cols-7 gap-2">
        {WD.map((d, idx) => (
          <button
            key={d}
            onClick={() => toggle(idx)}
            className={`rounded-xl py-2 text-xs border ${
              value.includes(idx) ? "border-indigo-500/50 bg-indigo-500/10" : "border-slate-800/70 bg-slate-900/40"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
      <div className="mt-2 text-xs text-slate-500">
        A/B are priority. C is optional (only used if day is not A/B).
      </div>
    </div>
  );
}

export default function Settings({ state, setState }) {
  const s = state.settings;

  function setTheme(nextTheme) {
    const next = structuredClone(state);
    next.settings.theme = nextTheme;
    setState(next);
  }

  function update(path, value) {
    const next = structuredClone(state);
    const parts = path.split(".");
    let cur = next.settings;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
    cur[parts[parts.length - 1]] = value;
    setState(next);
  }

  function regenPlan() {
    const next = rebuildPlan(structuredClone(state));
    setState(next);
  }

  return (
    <div className="space-y-4">
      <Card title="Personalization">
        <div className="grid md:grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
            <div className="text-sm font-semibold mb-2">Start date</div>
            <input
              type="date"
              value={s.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
            />
            <button onClick={regenPlan} className="mt-3 w-full px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-sm">
              Regenerate 12-week plan (keeps logs where dates match)
            </button>
            <div className="mt-2 text-xs text-slate-500">
              Use this if your plan “today” is outside the range.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
            <div className="text-sm font-semibold mb-2">Setup wizard</div>
            <div className="text-xs text-slate-400">Update profile, goal, lifestyle, and let the app recompute targets.</div>
            <button
              onClick={() => {
                const next = structuredClone(state);
                next.meta = next.meta || {};
                next.meta.setupCompleted = true; // not first-run, but wizard is accessible
                setState(next);
                // Route change happens in App via sidebar button; keep this here as optional.
              }}
              className="mt-3 w-full px-4 py-2 rounded-xl bg-slate-900/40 border border-slate-800/70 text-sm"
            >
              Use the “Setup” page in the sidebar
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
            <div className="text-sm font-semibold mb-2">Theme</div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setTheme("dark")} className={`px-3 py-2 rounded-xl border ${s.theme==="dark" ? "border-indigo-500/50 bg-indigo-500/10" : "border-slate-800/70 bg-slate-900/40"}`}>Dark</button>
              <button onClick={() => setTheme("light")} className={`px-3 py-2 rounded-xl border ${s.theme==="light" ? "border-indigo-500/50 bg-indigo-500/10" : "border-slate-800/70 bg-slate-900/40"}`}>Light</button>
            </div>
          </div>
        </div>
      </Card>

      <Card title="Targets">
        <div className="grid md:grid-cols-3 gap-3">
          {[
            ["targets.calories", "Calories", "number"],
            ["targets.proteinG", "Protein (g)", "number"],
            ["targets.waterL", "Water (L)", "number"],
            ["targets.steps", "Steps", "number"],
            ["targets.sleepH", "Sleep (h)", "number"]
          ].map(([key, label, type]) => (
            <div key={key} className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400">{label}</div>
              <input
                type={type}
                value={key.split(".").reduce((acc, k) => acc[k], s)}
                onChange={(e) => update(key, Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Workout schedule (choose weekdays)">
        <div className="grid lg:grid-cols-3 gap-3">
          <WeekdayPicker label="Day A (Lower + Core) — 2×/week" value={s.workoutWeekdays.A} onChange={(v)=>update("workoutWeekdays.A", v)} />
          <WeekdayPicker label="Day B (Upper) — 2×/week" value={s.workoutWeekdays.B} onChange={(v)=>update("workoutWeekdays.B", v)} />
          <WeekdayPicker label="Day C (Optional conditioning)" value={s.workoutWeekdays.C} onChange={(v)=>update("workoutWeekdays.C", v)} />
        </div>
      </Card>

      <Card title="Meal timing (for work schedule)">
        <div className="grid md:grid-cols-3 gap-3">
          {[
            ["mealTiming.breakfast", "Breakfast"],
            ["mealTiming.snack1", "Snack 1"],
            ["mealTiming.lunch", "Lunch"],
            ["mealTiming.snack2", "Snack 2"],
            ["mealTiming.dinner", "Dinner"]
          ].map(([key, label]) => (
            <div key={key} className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400">{label}</div>
              <input
                type="time"
                value={key.split(".").reduce((acc, k) => acc[k], s)}
                onChange={(e) => update(key, e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Units">
        <div className="grid md:grid-cols-2 gap-2">
          <Toggle
            checked={s.units.weight === "kg"}
            onChange={() => update("units.weight", s.units.weight === "kg" ? "lb" : "kg")}
            label={`Weight unit: ${s.units.weight}`}
          />
          <Toggle
            checked={s.units.length === "cm"}
            onChange={() => update("units.length", s.units.length === "cm" ? "in" : "cm")}
            label={`Length unit: ${s.units.length}`}
          />
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Units toggle is for display; your plan is tuned for kg/cm by default.
        </div>
      </Card>
    </div>
  );
}

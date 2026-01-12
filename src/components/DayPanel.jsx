import Card from "./Card.jsx";
import Toggle from "./Toggle.jsx";
import { HABITS } from "../lib/plan.js";

export default function DayPanel({ planDay, log, targets, onUpdateLog }) {
  if (!planDay || !log) return null;

  const mealChecks = log.mealChecks || [];
  const workoutChecks = log.workoutChecks || [];

  function setWorkoutDone(stepId, done) {
    const next = workoutChecks.map((x) => (x.stepId === stepId ? { ...x, done } : x));
    onUpdateLog({ ...log, workoutChecks: next });
  }
  function setMealDone(mealId, done) {
    const next = mealChecks.map((x) => (x.mealId === mealId ? { ...x, done } : x));
    onUpdateLog({ ...log, mealChecks: next });
  }
  function setHabit(key, val) {
    onUpdateLog({ ...log, habitChecks: { ...(log.habitChecks || {}), [key]: val } });
  }

  return (
    <div className="space-y-3">
      <Card title="Meals (planned)">
        {planDay.dayMacros && targets && (
          <div className="mb-3 rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-400">Daily macros (planned)</div>
              <div className="text-[11px] text-slate-400">±10% is fine</div>
            </div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/20 p-2">
                <div className="text-[11px] text-slate-400">Calories</div>
                <div className="text-sm font-semibold">{Math.round(planDay.dayMacros.calories)} / {targets.calories}</div>
              </div>
              <div className="rounded-xl border border-slate-800/70 bg-slate-950/20 p-2">
                <div className="text-[11px] text-slate-400">Protein</div>
                <div className="text-sm font-semibold">{Math.round(planDay.dayMacros.proteinG)}g / {targets.proteinG}g</div>
              </div>
              {targets.fatG ? (
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/20 p-2">
                  <div className="text-[11px] text-slate-400">Fat</div>
                  <div className="text-sm font-semibold">{Math.round(planDay.dayMacros.fatG)}g</div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/20 p-2">
                  <div className="text-[11px] text-slate-400">Mode</div>
                  <div className="text-sm font-semibold">Simple</div>
                </div>
              )}
              {targets.carbsG ? (
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/20 p-2">
                  <div className="text-[11px] text-slate-400">Carbs</div>
                  <div className="text-sm font-semibold">{Math.round(planDay.dayMacros.carbsG)}g</div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-800/70 bg-slate-950/20 p-2">
                  <div className="text-[11px] text-slate-400">Tip</div>
                  <div className="text-sm font-semibold">Hit protein</div>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="space-y-3">
          {planDay.meals.map((m) => {
            const ck = mealChecks.find((x) => x.mealId === m.id);
            const done = ck?.done || false;
            return (
              <div key={m.id} className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{m.slot}</div>
                    <div className="text-xs text-slate-400">{m.title}</div>
                  </div>
                  <button
                    onClick={() => setMealDone(m.id, !done)}
                    className={`px-3 py-1.5 rounded-xl text-xs border ${
                      done ? "border-emerald-500/40 bg-emerald-500/10" : "border-slate-800/70 bg-slate-900/40"
                    }`}
                  >
                    {done ? "Done" : "Mark"}
                  </button>
                </div>
                <div className="mt-2 space-y-2 text-sm text-slate-200">
                  {m.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between gap-3">
                      <span className="text-slate-300">{it.name}</span>
                      <span className="text-slate-400">{it.portion}</span>
                    </div>
                  ))}
                </div>

                {m.sauce && (
                  <div className="mt-3 rounded-xl border border-slate-800/70 bg-slate-950/20 p-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-slate-400">Recommended sauce</div>
                      <div className="text-[11px] rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-emerald-200">
                        Low-calorie
                      </div>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-200">{m.sauce.name}</div>
                    <div className="mt-0.5 text-xs text-slate-400">{m.sauce.portionRule}</div>
                  </div>
                )}
                <div className="mt-2 text-xs text-slate-500">
                  Rule: tea no sugar • dinner: no khobz • fried food max 1×/week
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Workout (planned)" right={planDay.workoutType ? planDay.workoutType : "Rest"}>
        {!planDay.workout ? (
          <div className="text-sm text-slate-400">No workout scheduled for this day.</div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm font-semibold">{planDay.workout.title}</div>

            <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400 mb-2">Warm-up</div>
              <div className="space-y-2">
                {planDay.workout.warmup.map((s) => {
                  const done = workoutChecks.find((x) => x.stepId === s.id)?.done || false;
                  return (
                    <Toggle key={s.id} checked={done} onChange={(v) => setWorkoutDone(s.id, v)} label={s.label} />
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400 mb-2">Main</div>
              <div className="space-y-2">
                {planDay.workout.main.map((s) => {
                  const done = workoutChecks.find((x) => x.stepId === s.id)?.done || false;
                  return (
                    <Toggle key={s.id} checked={done} onChange={(v) => setWorkoutDone(s.id, v)} label={s.label} />
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400 mb-2">Cool-down</div>
              <div className="space-y-2">
                {planDay.workout.cooldown.map((s) => {
                  const done = workoutChecks.find((x) => x.stepId === s.id)?.done || false;
                  return (
                    <Toggle key={s.id} checked={done} onChange={(v) => setWorkoutDone(s.id, v)} label={s.label} />
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400 mb-2">Progression rules</div>
              <ul className="list-disc pl-5 text-sm text-slate-300 space-y-1">
                {planDay.workout.progression.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
        )}
      </Card>

      <Card title="Targets + Habits">
        <div className="grid sm:grid-cols-2 gap-2">
          <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
            <div className="text-xs text-slate-400">Calories</div>
            <div className="text-lg font-semibold">{targets.calories}</div>
          </div>
          <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
            <div className="text-xs text-slate-400">Protein</div>
            <div className="text-lg font-semibold">{targets.proteinG}g</div>
          </div>
          <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
            <div className="text-xs text-slate-400">Steps</div>
            <div className="text-lg font-semibold">{targets.steps}</div>
          </div>
          <div className="rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
            <div className="text-xs text-slate-400">Water</div>
            <div className="text-lg font-semibold">{targets.waterL}L</div>
          </div>
        </div>

        <div className="mt-3 grid sm:grid-cols-2 gap-2">
          {HABITS.map((h) => (
            <Toggle
              key={h.key}
              checked={Boolean(log.habitChecks?.[h.key])}
              onChange={(v) => setHabit(h.key, v)}
              label={h.label}
            />
          ))}
        </div>

        <div className="mt-3">
          <label className="text-xs text-slate-400">Notes</label>
          <textarea
            value={log.notes || ""}
            onChange={(e) => onUpdateLog({ ...log, notes: e.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
            rows={3}
            placeholder="Sleep? cravings? stress? what worked today?"
          />
        </div>
      </Card>
    </div>
  );
}

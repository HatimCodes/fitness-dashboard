import Card from "../components/Card.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { formatHumanDate } from "../lib/utils.js";
import { dayStatus } from "../lib/plan.js";
import { getDayX, rebuildPlan } from "../lib/storage.js";

export default function Dashboard({ state, setState, setRoute, todayISO, onPickDate }) {
  const { settings, planDays, logs } = state;
  const planByDate = new Map(planDays.map((d) => [d.date, d]));
  const logByDate = new Map(logs.map((l) => [l.date, l]));
  const todayPlan = planByDate.get(todayISO);
  const todayLog = logByDate.get(todayISO);

  const dayX = getDayX(settings, todayISO);

  // streaks
  let workoutStreak = 0;
  let mealStreak = 0;
  for (let i = logs.length - 1; i >= 0; i--) {
    const l = logs[i];
    if (l.date > todayISO) continue;
    const pd = planByDate.get(l.date);
    if (!pd) continue;

    const wTotal = l.workoutChecks?.length || 0;
    const wDone = l.workoutChecks?.filter((x) => x.done).length || 0;
    const workoutComplete = wTotal === 0 ? true : wDone >= wTotal * 0.9;

    if (workoutComplete) workoutStreak++;
    else break;
  }
  for (let i = logs.length - 1; i >= 0; i--) {
    const l = logs[i];
    if (l.date > todayISO) continue;
    const mTotal = l.mealChecks?.length || 0;
    const mDone = l.mealChecks?.filter((x) => x.done).length || 0;
    const mealsComplete = mTotal === 0 ? true : mDone >= mTotal * 0.8;
    if (mealsComplete) mealStreak++;
    else break;
  }

  const targets = settings.targetsAuto || settings.targets;
  const cal = todayLog?.calories || 0;
  const prot = todayLog?.proteinG || 0;
  const water = todayLog?.waterL || 0;
  const sleep = todayLog?.sleepH || 0;
  const steps = todayLog?.steps || 0;

  const status = todayPlan ? dayStatus(todayPlan, todayLog) : "none";

  const nextWorkout = (() => {
    // next planned workout type from today onwards
    for (const d of planDays) {
      if (d.date < todayISO) continue;
      if (d.workoutType) return { date: d.date, type: d.workoutType };
    }
    return null;
  })();

  function regenPlan() {
    const next = rebuildPlan(structuredClone(state));
    setState(next);
  }

  return (
    <div className="space-y-4">
      <Card title={formatHumanDate(todayISO)} right={`Day ${dayX} of plan`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Today</div>
            <div className="text-sm text-slate-400">
              Status:{" "}
              <span className={
                status === "completed" ? "text-emerald-300" :
                status === "partial" ? "text-amber-300" :
                status === "missed" ? "text-rose-300" : "text-slate-400"
              }>
                {status}
              </span>
            </div>
          </div>
          <button
            onClick={() => onPickDate(todayISO)}
            className="px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-sm"
          >
            Open today
          </button>
        </div>
      </Card>

      <div className="grid md:grid-cols-3 gap-3">
        <Card title="Today’s targets">
          <div className="space-y-3">
            <ProgressBar value={cal} max={targets.calories} labelLeft="Calories" labelRight={`${cal}/${targets.calories}`} />
            <ProgressBar value={prot} max={targets.proteinG} labelLeft="Protein" labelRight={`${prot}g/${targets.proteinG}g`} />
            <ProgressBar value={water} max={targets.waterL} labelLeft="Water" labelRight={`${water}L/${targets.waterL}L`} />
            <ProgressBar value={steps} max={targets.steps} labelLeft="Steps" labelRight={`${steps}/${targets.steps}`} />
            <ProgressBar value={sleep} max={targets.sleepH} labelLeft="Sleep" labelRight={`${sleep}h/${targets.sleepH}h`} />
          </div>
        </Card>

        <Card title="Numbers">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">BMI</div>
              <div className="text-3xl font-semibold mt-1">{settings.targetsAuto?.bmi?.value || "—"}</div>
              <div className="text-xs text-slate-500">{settings.targetsAuto?.bmi?.category || ""}</div>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">TDEE</div>
              <div className="text-3xl font-semibold mt-1">{settings.targetsAuto?.tdee || "—"}</div>
              <div className="text-xs text-slate-500">kcal/day (est.)</div>
            </div>
            <div className="col-span-2 rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Goal calories</div>
                  <div className="text-lg font-semibold mt-1">{settings.targetsAuto?.calories || targets.calories} kcal</div>
                  <div className="text-xs text-slate-500">Protein: {settings.targetsAuto?.proteinG || targets.proteinG}g/day</div>
                </div>
                <button onClick={() => setRoute("setup")} className="px-3 py-2 rounded-xl border border-slate-800/70 bg-slate-900/40 text-xs">
                  Update setup
                </button>
              </div>
              {settings.targetsAuto?.warning && <div className="mt-2 text-xs text-amber-200">{settings.targetsAuto.warning}</div>}
            </div>
          </div>
        </Card>

        <Card title="Streaks">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">Workout streak</div>
              <div className="text-3xl font-semibold mt-1">{workoutStreak}</div>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
              <div className="text-xs text-slate-400">Meals streak</div>
              <div className="text-3xl font-semibold mt-1">{mealStreak}</div>
            </div>
            <div className="col-span-2 text-xs text-slate-500">
              Streaks reflect consistency. If you miss a day, simply continue the next day.
            </div>
          </div>
        </Card>

        <Card title="Quick check-in" right={nextWorkout ? `Next workout: ${nextWorkout.type}` : ""}>
          <div className="text-sm text-slate-300 space-y-2">
            <div>✅ Goal: fat loss + strength with dumbbells + Moroccan food.</div>
            <div>✅ Daily focus: protein, steps, sleep, and low-sugar drinks.</div>
            <div className="text-slate-500 text-xs">
              If energy is low: do fewer sets and keep the habit.
            </div>
            <button onClick={regenPlan} className="mt-2 px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-sm">
              Regenerate plan
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { useMemo, useState } from "react";
import Card from "../components/Card.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import { defaultSettings, rebuildPlan } from "../lib/storage.js";
import { computeTargetsFromSettings } from "../lib/calculations.js";

const STEPS = [
  { key: "profile", label: "Profile" },
  { key: "goal", label: "Goal" },
  { key: "lifestyle", label: "Lifestyle" },
  { key: "training", label: "Training" },
  { key: "nutrition", label: "Nutrition" },
  { key: "review", label: "Review" }
];

function Field({ label, children, hint }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1">{children}</div>
      {hint && <div className="mt-1 text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}

export default function Setup({ state, setState, setRoute }) {
  const step = state?.meta?.setupWizardStep ?? 0;
  const [localStep, setLocalStep] = useState(step);

  const s = state.settings;
  const p = s.profile;
  const g = s.goal;
  const l = s.lifestyle;
  const t = s.training;
  const n = s.nutrition;

  const targetsAuto = useMemo(() => computeTargetsFromSettings(s), [s]);

  function updateSettings(patch) {
    const next = structuredClone(state);
    next.settings = { ...next.settings, ...patch };
    next.settings.targetsAuto = computeTargetsFromSettings(next.settings);
    next.meta = next.meta || {};
    next.meta.setupWizardStep = localStep;
    setState(next);
  }

  function setWizardStep(nextStep) {
    setLocalStep(nextStep);
    const next = structuredClone(state);
    next.meta = next.meta || {};
    next.meta.setupWizardStep = nextStep;
    setState(next);
  }

  function validateCurrent() {
    const errs = [];
    if (localStep === 0) {
      if (!p.age || p.age < 14 || p.age > 80) errs.push("Age must be 14–80.");
      if (!p.heightCm || p.heightCm < 120 || p.heightCm > 230) errs.push("Height must be 120–230 cm.");
      if (!p.weightKg || p.weightKg < 35 || p.weightKg > 250) errs.push("Weight must be 35–250 kg.");
    }
    if (localStep === 1) {
      if (!g.type) errs.push("Choose a goal.");
      if (g.type === "lose" && ![0.25, 0.5, 0.75, 1.0].includes(Number(g.speedKgPerWeek))) errs.push("Choose a loss speed.");
      if (g.type === "gain" && ![0.1, 0.25, 0.5].includes(Number(g.speedKgPerWeek))) errs.push("Choose a gain speed.");
    }
    if (localStep === 3) {
      if (!t.hasDumbbells) errs.push("This app is built for 2 adjustable dumbbells + bodyweight.");
      if (!t.daysPerWeek || t.daysPerWeek < 3 || t.daysPerWeek > 6) errs.push("Training days must be 3–6.");
    }
    return errs;
  }

  function nextStep() {
    const errs = validateCurrent();
    if (errs.length) {
      const next = structuredClone(state);
      next.meta = next.meta || {};
      next.meta.setupErrors = errs;
      setState(next);
      return;
    }
    const next = structuredClone(state);
    next.meta = next.meta || {};
    next.meta.setupErrors = [];
    setState(next);
    setWizardStep(Math.min(STEPS.length - 1, localStep + 1));
  }

  function prevStep() {
    setWizardStep(Math.max(0, localStep - 1));
  }

  function generatePlan() {
    const next = structuredClone(state);
    next.settings.targetsAuto = computeTargetsFromSettings(next.settings);
    const rebuilt = rebuildPlan(next);
    rebuilt.meta = rebuilt.meta || {};
    rebuilt.meta.setupCompleted = true;
    rebuilt.meta.setupWizardStep = 0;
    rebuilt.meta.setupErrors = [];
    setState(rebuilt);
    setRoute("dashboard");
  }

  function resetAll() {
    if (!confirm("Reset all settings and start over? Your logs/measurements will remain, but the plan will be regenerated.")) return;
    const fresh = defaultSettings();
    fresh.targetsAuto = computeTargetsFromSettings(fresh);
    const next = structuredClone(state);
    next.settings = fresh;
    next.meta = next.meta || {};
    next.meta.setupCompleted = false;
    next.meta.setupWizardStep = 0;
    next.meta.setupErrors = [];
    const rebuilt = rebuildPlan(next);
    setState(rebuilt);
    setWizardStep(0);
  }

  const errors = state.meta?.setupErrors || [];

  return (
    <div className="space-y-4">
      <Card title="Setup" right={state.meta?.setupCompleted ? "Update anytime" : "First run"}>
        <ProgressBar value={localStep + 1} max={STEPS.length} labelLeft={STEPS[localStep].label} labelRight={`${localStep + 1}/${STEPS.length}`} />
        <div className="mt-3 flex flex-wrap gap-2">
          {STEPS.map((st, idx) => (
            <button
              key={st.key}
              onClick={() => setWizardStep(idx)}
              className={`px-3 py-2 rounded-xl border text-xs ${
                idx === localStep
                  ? "border-indigo-500/60 bg-indigo-500/10 text-slate-50"
                  : "border-slate-800/70 bg-slate-900/40 text-slate-300"
              }`}
            >
              {st.label}
            </button>
          ))}
          <div className="ml-auto" />
          <button
            onClick={resetAll}
            className="px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs text-rose-200"
          >
            Reset & start over
          </button>
        </div>

        {errors.length > 0 && (
          <div className="mt-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200">
            <div className="text-sm font-semibold">Fix these:</div>
            <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
              {errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {localStep === 0 && (
        <Card title="Profile">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Gender">
              <select
                value={p.gender}
                onChange={(e) => updateSettings({ profile: { ...p, gender: e.target.value } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>
            <Field label="Age">
              <input
                type="number"
                value={p.age}
                onChange={(e) => updateSettings({ profile: { ...p, age: Number(e.target.value) } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              />
            </Field>
            <Field label="Height (cm)">
              <input
                type="number"
                value={p.heightCm}
                onChange={(e) => updateSettings({ profile: { ...p, heightCm: Number(e.target.value) } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              />
            </Field>
            <Field label="Weight (kg)">
              <input
                type="number"
                value={p.weightKg}
                onChange={(e) => updateSettings({ profile: { ...p, weightKg: Number(e.target.value) } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              />
            </Field>
            <Field label="Body fat % (optional)" hint="Unknown is fine">
              <input
                type="number"
                value={p.bodyFatPct || ""}
                onChange={(e) => updateSettings({ profile: { ...p, bodyFatPct: Number(e.target.value) || 0 } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              />
            </Field>
          </div>
          <div className="mt-4 text-xs text-slate-500">BMI is a rough signal, not a diagnosis.</div>
        </Card>
      )}

      {localStep === 1 && (
        <Card title="Goal">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Goal type">
              <select
                value={g.type}
                onChange={(e) => updateSettings({ goal: { ...g, type: e.target.value } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                <option value="lose">Fat loss</option>
                <option value="gain">Weight gain</option>
                <option value="recomp">Recomposition</option>
              </select>
            </Field>
            <Field label="Target weight (kg)" hint="Optional but recommended">
              <input
                type="number"
                value={g.targetWeightKg || ""}
                onChange={(e) => updateSettings({ goal: { ...g, targetWeightKg: Number(e.target.value) || 0 } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              />
            </Field>
            <Field label="Goal speed">
              {g.type === "gain" ? (
                <select
                  value={g.speedKgPerWeek}
                  onChange={(e) => updateSettings({ goal: { ...g, speedKgPerWeek: Number(e.target.value) } })}
                  className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
                >
                  <option value={0.1}>+0.1 kg/week</option>
                  <option value={0.25}>+0.25 kg/week</option>
                  <option value={0.5}>+0.5 kg/week</option>
                </select>
              ) : (
                <select
                  value={g.speedKgPerWeek}
                  onChange={(e) => updateSettings({ goal: { ...g, speedKgPerWeek: Number(e.target.value) } })}
                  className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
                >
                  <option value={0.25}>-0.25 kg/week</option>
                  <option value={0.5}>-0.5 kg/week</option>
                  <option value={0.75}>-0.75 kg/week</option>
                  <option value={1.0}>-1.0 kg/week (aggressive)</option>
                </select>
              )}
            </Field>
            <Field label="Mode">
              <select
                value={g.advancedMacros ? "advanced" : "simple"}
                onChange={(e) => updateSettings({ goal: { ...g, advancedMacros: e.target.value === "advanced" } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                <option value="simple">Simple mode (calories + protein)</option>
                <option value="advanced">Advanced mode (full macros)</option>
              </select>
            </Field>
          </div>
          {targetsAuto.warning && (
            <div className="mt-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-3 text-amber-200 text-sm">
              {targetsAuto.warning}
            </div>
          )}
        </Card>
      )}

      {localStep === 2 && (
        <Card title="Lifestyle">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Activity level outside workouts">
              <select
                value={l.activityLevel}
                onChange={(e) => updateSettings({ lifestyle: { ...l, activityLevel: e.target.value } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                <option value="sedentary">Sedentary</option>
                <option value="lightlyActive">Lightly active</option>
                <option value="active">Active</option>
                <option value="veryActive">Very active</option>
              </select>
            </Field>
            <Field label="Job type">
              <select
                value={l.jobType}
                onChange={(e) => updateSettings({ lifestyle: { ...l, jobType: e.target.value } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                <option value="desk">Desk</option>
                <option value="standing">Standing</option>
                <option value="mixed">Mixed</option>
              </select>
            </Field>
            <Field label="Sleep hours average">
              <input
                type="number"
                value={l.sleepHours}
                onChange={(e) => updateSettings({ lifestyle: { ...l, sleepHours: Number(e.target.value) } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              />
            </Field>
            <Field label="Stress">
              <select
                value={l.stress}
                onChange={(e) => updateSettings({ lifestyle: { ...l, stress: e.target.value } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </Field>
            <Field label="Steps average (optional)">
              <input
                type="number"
                value={l.stepsAvg || ""}
                onChange={(e) => updateSettings({ lifestyle: { ...l, stepsAvg: Number(e.target.value) || 0 } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              />
            </Field>
          </div>
        </Card>
      )}

      {localStep === 3 && (
        <Card title="Training">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Equipment" hint="Home-only: 2 adjustable dumbbells up to 25kg + bodyweight">
              <label className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={Boolean(t.hasDumbbells)}
                  onChange={(e) => updateSettings({ training: { ...t, hasDumbbells: e.target.checked } })}
                />
                I confirm I have dumbbells
              </label>
            </Field>
            <Field label="Time per session">
              <select
                value={t.timePerSession}
                onChange={(e) => updateSettings({ training: { ...t, timePerSession: Number(e.target.value) } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                <option value={20}>20 min</option>
                <option value={30}>30 min</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
              </select>
            </Field>
            <Field label="Days per week">
              <select
                value={t.daysPerWeek}
                onChange={(e) => updateSettings({ training: { ...t, daysPerWeek: Number(e.target.value) } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                {[3, 4, 5, 6].map((v) => (
                  <option key={v} value={v}>
                    {v} days
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Experience">
              <select
                value={t.experience}
                onChange={(e) => updateSettings({ training: { ...t, experience: e.target.value } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </Field>
            <Field label="Injuries / limitations" hint="Select what applies">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["knees", "Knees"],
                  ["back", "Back"],
                  ["shoulder", "Shoulder"],
                  ["wrist", "Wrist"],
                  ["ankle", "Ankle"]
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={Array.isArray(t.injuries) ? t.injuries.includes(key) : false}
                      onChange={(e) => {
                        const cur = Array.isArray(t.injuries) ? t.injuries : [];
                        const nextArr = e.target.checked ? [...cur, key] : cur.filter((x) => x !== key);
                        updateSettings({ training: { ...t, injuries: nextArr } });
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </Card>
      )}

      {localStep === 4 && (
        <Card title="Nutrition preferences">
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="Budget">
              <select
                value={n.budget}
                onChange={(e) => updateSettings({ nutrition: { ...n, budget: e.target.value } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="flexible">Flexible</option>
              </select>
            </Field>
            <Field label="Meals per day">
              <select
                value={n.mealsPerDay}
                onChange={(e) => updateSettings({ nutrition: { ...n, mealsPerDay: Number(e.target.value) } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                {[3, 4, 5].map((v) => (
                  <option key={v} value={v}>
                    {v} meals
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Restrictions">
              <select
                value={n.restrictions}
                onChange={(e) => updateSettings({ nutrition: { ...n, restrictions: e.target.value } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
              >
                <option value="none">None</option>
                <option value="halal">Halal only (default)</option>
                <option value="noDairy">No dairy</option>
              </select>
            </Field>
            <Field label="Food dislikes (optional)">
              <input
                value={n.dislikes || ""}
                onChange={(e) => updateSettings({ nutrition: { ...n, dislikes: e.target.value } })}
                className="w-full rounded-xl border border-slate-800/70 bg-slate-950/40 px-3 py-2 text-sm outline-none focus:border-indigo-500/60"
                placeholder="e.g., sardines"
              />
            </Field>
            <Field label="Typical foods" hint="Used to personalize reminders (not strict)">
              <div className="grid grid-cols-2 gap-2">
                {[
                  ["khobz", "Khobz"],
                  ["tagine", "Tagine"],
                  ["rice", "Rice"],
                  ["pasta", "Pasta"],
                  ["sweets", "Sweets"],
                  ["teaSugar", "Tea with sugar"],
                  ["soda", "Soda"],
                  ["fried", "Fried food"]
                ].map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={Array.isArray(n.typicalFoods) ? n.typicalFoods.includes(k) : false}
                      onChange={(e) => {
                        const cur = Array.isArray(n.typicalFoods) ? n.typicalFoods : [];
                        const nextArr = e.target.checked ? [...cur, k] : cur.filter((x) => x !== k);
                        updateSettings({ nutrition: { ...n, typicalFoods: nextArr } });
                      }}
                    />
                    {label}
                  </label>
                ))}
              </div>
            </Field>
          </div>
        </Card>
      )}

      {localStep === 5 && (
        <Card title="Review & generate">
          <div className="grid md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400">BMI</div>
              <div className="text-lg font-semibold mt-1">{targetsAuto.bmi?.value || "—"}</div>
              <div className="text-xs text-slate-500">{targetsAuto.bmi?.category || ""}</div>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400">TDEE (est.)</div>
              <div className="text-lg font-semibold mt-1">{targetsAuto.tdee} kcal</div>
              <div className="text-xs text-slate-500">Based on activity level</div>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400">Goal calories</div>
              <div className="text-lg font-semibold mt-1">{targetsAuto.calories} kcal</div>
              <div className="text-xs text-slate-500">Delta: {targetsAuto.delta} /day</div>
            </div>
          </div>

          <div className="mt-3 grid md:grid-cols-3 gap-3">
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400">Protein</div>
              <div className="text-lg font-semibold mt-1">{targetsAuto.proteinG} g/day</div>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400">Fat</div>
              <div className="text-lg font-semibold mt-1">{targetsAuto.fatG || "—"}</div>
            </div>
            <div className="rounded-2xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-xs text-slate-400">Carbs</div>
              <div className="text-lg font-semibold mt-1">{targetsAuto.carbsG || "—"}</div>
            </div>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Generates a 12-week plan (meals + workouts + calendar + groceries). Existing logs stay.
            </div>
            <button
              onClick={generatePlan}
              className="px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-sm"
            >
              Generate plan
            </button>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={localStep === 0}
          className="px-4 py-2 rounded-xl border border-slate-800/70 bg-slate-900/40 text-sm disabled:opacity-40"
        >
          Back
        </button>
        {localStep < STEPS.length - 1 ? (
          <button
            onClick={nextStep}
            className="px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-sm"
          >
            Next
          </button>
        ) : (
          <button
            onClick={generatePlan}
            className="px-4 py-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-sm"
          >
            Generate plan
          </button>
        )}
      </div>
    </div>
  );
}

import Card from "./Card.jsx";

export default function Timeline({ planDay, log, timing }) {
  if (!planDay || !log) return null;

  const items = [];

  // Meals in timeline order using settings timing
  for (const meal of planDay.meals) {
    const key = meal.slot === "Breakfast" ? "breakfast" :
      meal.slot === "Snack 1" ? "snack1" :
      meal.slot === "Lunch" ? "lunch" :
      meal.slot === "Snack 2" ? "snack2" : "dinner";
    items.push({ time: timing[key], type: "meal", title: meal.slot, subtitle: meal.title });
  }

  // Workout: put around afternoon if scheduled
  if (planDay.workout) {
    items.push({ time: "18:00", type: "workout", title: planDay.workout.title, subtitle: "Warm-up → main → cool-down" });
  }

  items.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <Card title="Today timeline">
      <div className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="w-14 text-xs text-slate-400">{it.time}</div>
            <div className="flex-1 rounded-xl border border-slate-800/70 bg-slate-950/30 p-3">
              <div className="text-sm font-semibold">{it.title}</div>
              <div className="text-xs text-slate-400">{it.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-slate-500">
        Rules: no soda • tea no sugar • dinner no khobz • fried food max 1×/week
      </div>
    </Card>
  );
}

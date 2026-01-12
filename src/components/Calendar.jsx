import { addDays, endOfMonth, formatHumanDate, isoDate, startOfMonth } from "../lib/utils.js";

function monthGridDates(anchorDate) {
  const start = startOfMonth(anchorDate);
  const end = endOfMonth(anchorDate);

  const startDow = (start.getDay() + 6) % 7; // Monday=0
  const gridStart = addDays(start, -startDow);

  const endDow = (end.getDay() + 6) % 7;
  const gridEnd = addDays(end, (6 - endDow));

  const dates = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

export default function Calendar({ anchorISO, setAnchorISO, planDays, getStatus, onPickDate, selectedISO, todayISO }) {
  const anchor = new Date(anchorISO + "T00:00:00");
  const dates = monthGridDates(anchor);
  const monthLabel = anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const planByDate = new Map(planDays.map((d) => [d.date, d]));

  function shiftMonth(delta) {
    const d = new Date(anchor);
    d.setMonth(d.getMonth() + delta);
    setAnchorISO(isoDate(d));
  }

  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-3">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => shiftMonth(-1)} className="px-3 py-2 rounded-xl bg-slate-800/60 text-sm">←</button>
        <div className="text-sm font-semibold">{monthLabel}</div>
        <button onClick={() => shiftMonth(1)} className="px-3 py-2 rounded-xl bg-slate-800/60 text-sm">→</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-[11px] text-slate-400 mb-2">
        {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <div key={d} className="text-center">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {dates.map((d) => {
          const iso = isoDate(d);
          const inMonth = d.getMonth() === anchor.getMonth();
          const planDay = planByDate.get(iso);
          const status = planDay ? getStatus(planDay) : "none";
          const isSelected = iso === selectedISO;
          const isToday = iso === todayISO;

          const base =
            "rounded-xl border px-2 py-2 text-center text-sm transition active:scale-[0.98]";

          let cls = "border-slate-800/70 bg-slate-950/30 text-slate-300 hover:bg-slate-900/70";
          if (!inMonth) cls = "border-slate-900 bg-slate-950/10 text-slate-600";
          if (status === "completed") cls = "border-emerald-500/40 bg-emerald-500/10 text-slate-100";
          if (status === "partial") cls = "border-amber-500/40 bg-amber-500/10 text-slate-100";
          if (status === "missed") cls = "border-rose-500/40 bg-rose-500/10 text-slate-100";
          if (isSelected) cls += " ring-2 ring-indigo-500/50";
          if (isToday) cls += " outline outline-1 outline-indigo-400/40";

          return (
            <button
              key={iso}
              onClick={() => onPickDate(iso)}
              className={`${base} ${cls}`}
              title={formatHumanDate(iso)}
            >
              {d.getDate()}
              {planDay?.workoutType ? (
                <div className="mt-1 text-[10px] opacity-80">{planDay.workoutType}</div>
              ) : (
                <div className="mt-1 text-[10px] opacity-40">•</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

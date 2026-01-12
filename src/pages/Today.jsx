import Timeline from "../components/Timeline.jsx";
import DayPanel from "../components/DayPanel.jsx";

export default function Today({ state, todayISO, onUpdateLog }) {
  const planDay = state.planDays.find((d) => d.date === todayISO);
  const log = state.logs.find((l) => l.date === todayISO);

  return (
    <div className="space-y-4">
      <Timeline planDay={planDay} log={log} timing={state.settings.mealTiming} />
      <DayPanel planDay={planDay} log={log} targets={state.settings.targetsAuto || state.settings.targets} onUpdateLog={onUpdateLog} />
    </div>
  );
}

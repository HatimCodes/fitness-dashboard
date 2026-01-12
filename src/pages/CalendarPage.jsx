import { useMemo, useState } from "react";
import Calendar from "../components/Calendar.jsx";
import Modal from "../components/Modal.jsx";
import DayPanel from "../components/DayPanel.jsx";
import { dayStatus } from "../lib/plan.js";

export default function CalendarPage({ state, todayISO, onUpdateLog }) {
  const [anchorISO, setAnchorISO] = useState(todayISO);
  const [selectedISO, setSelectedISO] = useState(todayISO);
  const [open, setOpen] = useState(false);

  const planByDate = useMemo(() => new Map(state.planDays.map((d) => [d.date, d])), [state.planDays]);
  const logByDate = useMemo(() => new Map(state.logs.map((l) => [l.date, l])), [state.logs]);

  function getStatus(planDay) {
    const log = logByDate.get(planDay.date);
    return dayStatus(planDay, log);
  }

  function onPickDate(iso) {
    setSelectedISO(iso);
    setOpen(true);
  }

  const planDay = planByDate.get(selectedISO);
  const log = logByDate.get(selectedISO);

  return (
    <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
      <Calendar
        anchorISO={anchorISO}
        setAnchorISO={setAnchorISO}
        planDays={state.planDays}
        getStatus={getStatus}
        onPickDate={onPickDate}
        selectedISO={selectedISO}
        todayISO={todayISO}
      />

      <div className="hidden lg:block">
        <DayPanel planDay={planDay} log={log} targets={state.settings.targetsAuto || state.settings.targets} onUpdateLog={onUpdateLog} />
      </div>

      <Modal
        open={open}
        title={`Day details — ${selectedISO}`}
        onClose={() => setOpen(false)}
      >
        <DayPanel planDay={planDay} log={log} targets={state.settings.targetsAuto || state.settings.targets} onUpdateLog={onUpdateLog} />
      </Modal>
    </div>
  );
}

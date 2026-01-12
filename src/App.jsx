import { useEffect, useMemo, useState } from "react";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Today from "./pages/Today.jsx";
import CalendarPage from "./pages/CalendarPage.jsx";
import Tracking from "./pages/Tracking.jsx";
import Grocery from "./pages/Grocery.jsx";
import Settings from "./pages/Settings.jsx";
import Backup from "./pages/Backup.jsx";
import About from "./pages/About.jsx";
import Setup from "./pages/Setup.jsx";

import { loadState, saveState, getTodayISO } from "./lib/storage.js";
import Card from "./components/Card.jsx";

export default function App() {
  const [route, setRoute] = useState("dashboard");
  const [state, setState] = useState(() => loadState());
  const todayISO = getTodayISO();

  // First-run gating to Setup
  useEffect(() => {
    if (state?.meta?.setupCompleted === false && route !== "setup") {
      setRoute("setup");
    }
  }, [state?.meta?.setupCompleted, route]);

  // Theme apply
  useEffect(() => {
    const theme = state?.settings?.theme || "dark";
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
      document.body.classList.add("bg-slate-50");
      document.body.classList.remove("bg-slate-950");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      document.body.classList.add("bg-slate-950");
      document.body.classList.remove("bg-slate-50");
    }
  }, [state?.settings?.theme]);

  // Auto-save
  useEffect(() => {
    if (!state) return;
    saveState(state);
  }, [state]);

  const headerRight = useMemo(() => {
    return (
      <>
        <button
          onClick={() => setRoute("settings")}
          className="px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800/70 text-xs text-slate-200"
        >
          Settings
        </button>
      </>
    );
  }, []);

  if (!state) {
    return (
      <div className="p-6">
        <Card title="State missing">
          <div className="text-sm text-slate-400">
            No saved state found. Refresh to bootstrap again.
          </div>
        </Card>
      </div>
    );
  }

  // First run: force Setup
  useEffect(() => {
    if (state?.meta?.setupCompleted === false) {
      setRoute("setup");
    }
  }, [state?.meta?.setupCompleted]);

  function onUpdateLog(updatedLog) {
    const next = structuredClone(state);
    const idx = next.logs.findIndex((l) => l.date === updatedLog.date);
    if (idx >= 0) next.logs[idx] = updatedLog;
    else next.logs.push(updatedLog);
    setState(next);
  }

  function onPickDate(dateISO) {
    setRoute("calendar");
    // Calendar page opens modal when clicked there; dashboard just navigates.
    // You can still open by clicking date in calendar.
  }

  function reloadFromStorage() {
    setState(loadState());
  }

  const page = (() => {
    switch (route) {
      case "dashboard":
        return <Dashboard state={state} todayISO={todayISO} onPickDate={onPickDate} setState={setState} setRoute={setRoute} />;
      case "today":
        return <Today state={state} todayISO={todayISO} onUpdateLog={onUpdateLog} />;
      case "calendar":
        return <CalendarPage state={state} todayISO={todayISO} onUpdateLog={onUpdateLog} />;
      case "tracking":
        return <Tracking state={state} setState={setState} />;
      case "grocery":
        return <Grocery state={state} setState={setState} />;
      case "setup":
        return <Setup state={state} setState={setState} setRoute={setRoute} />;
      case "settings":
        return <Settings state={state} setState={setState} />;
      case "backup":
        return <Backup onReload={reloadFromStorage} />;
      case "about":
        return <About />;
      default:
        return <Dashboard state={state} todayISO={todayISO} onPickDate={onPickDate} setState={setState} setRoute={setRoute} />;
    }
  })();

  return (
    <Layout route={route} setRoute={setRoute} headerRight={headerRight}>
      {page}
    </Layout>
  );
}

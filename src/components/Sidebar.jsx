const items = [
  { key: "setup", label: "Setup" },
  { key: "dashboard", label: "Dashboard" },
  { key: "today", label: "Today" },
  { key: "calendar", label: "Calendar" },
  { key: "tracking", label: "Tracking" },
  { key: "grocery", label: "Grocery" },
  { key: "settings", label: "Settings" },
  { key: "backup", label: "Backup" },
  { key: "about", label: "About" }
];

export default function Sidebar({ route, setRoute }) {
  return (
    <div className="hidden md:flex flex-col w-64 p-4 gap-3 border-r border-slate-800/70 bg-slate-950/60">
      <div className="mb-2">
        <div className="text-lg font-semibold">Fat Loss</div>
        <div className="text-xs text-slate-400">Morocco • Dumbbells</div>
      </div>
      {items.map((it) => (
        <button
          key={it.key}
          onClick={() => setRoute(it.key)}
          className={`text-left px-3 py-2 rounded-xl border transition ${
            route === it.key
              ? "border-indigo-500/60 bg-indigo-500/10 text-slate-50"
              : "border-slate-800/70 bg-slate-900/40 text-slate-300 hover:bg-slate-900/70"
          }`}
        >
          {it.label}
        </button>
      ))}
      <div className="mt-auto text-xs text-slate-500">
        Offline-ready • Auto-save
      </div>
    </div>
  );
}

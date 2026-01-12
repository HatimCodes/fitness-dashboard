const items = [
  { key: "dashboard", label: "Home" },
  { key: "today", label: "Today" },
  { key: "calendar", label: "Calendar" },
  { key: "tracking", label: "Track" },
  { key: "grocery", label: "Grocery" }
];

export default function BottomNav({ route, setRoute }) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800/70 bg-slate-950/90 backdrop-blur px-2 py-2">
      <div className="grid grid-cols-5 gap-2">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => setRoute(it.key)}
            className={`rounded-xl py-2 text-xs ${
              route === it.key ? "bg-indigo-500/15 text-slate-50" : "text-slate-400"
            }`}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}

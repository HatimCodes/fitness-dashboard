export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 rounded-xl border border-slate-800/70 bg-slate-900/60 px-3 py-2 w-full"
    >
      <span
        className={`h-5 w-9 rounded-full transition relative ${checked ? "bg-indigo-500" : "bg-slate-700"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? "left-4" : "left-0.5"}`}
        />
      </span>
      <span className="text-sm text-slate-200">{label}</span>
    </button>
  );
}

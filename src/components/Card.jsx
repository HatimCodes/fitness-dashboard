export default function Card({ title, right, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-800/70 bg-slate-900/60 shadow-soft backdrop-blur px-4 py-4 ${className}`}>
      {(title || right) && (
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-200">{title}</div>
          <div className="text-xs text-slate-400">{right}</div>
        </div>
      )}
      {children}
    </div>
  );
}

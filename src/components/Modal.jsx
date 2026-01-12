export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full sm:w-[640px] rounded-t-3xl sm:rounded-3xl bg-slate-950 border border-slate-800 shadow-soft p-4 sm:p-5 max-h-[85vh] overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold">{title}</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-sm">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

import { clamp } from "../lib/utils.js";

export default function Chart({ data, overlay, height = 80, label, overlayLabel = "Expected" }) {
  // data: [{xLabel, y}]
  if (!data || data.length < 2) {
    return <div className="text-xs text-slate-400">Not enough data yet.</div>;
  }
  const ys = data.map((d) => d.y);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1;

  const w = 300;
  const h = height;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (w - 10) + 5;
    const y = h - 5 - ((d.y - min) / range) * (h - 10);
    return `${x},${y}`;
  });

  const overlayPts =
    overlay && overlay.length === data.length
      ? overlay.map((yVal, i) => {
          const x = (i / (overlay.length - 1)) * (w - 10) + 5;
          const y = h - 5 - ((yVal - min) / range) * (h - 10);
          return `${x},${y}`;
        })
      : null;

  const last = data[data.length - 1]?.y;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-slate-400">{label}</div>
        <div className="text-xs text-slate-300">Latest: {clamp(last, -99999, 99999)}</div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {overlayPts && <polyline fill="none" stroke="rgb(148 163 184)" strokeWidth="2" points={overlayPts.join(" ")} />}
        <polyline fill="none" stroke="rgb(99 102 241)" strokeWidth="3" points={pts.join(" ")} />
      </svg>
      <div className="mt-1 flex justify-between text-[11px] text-slate-500">
        <span>{data[0].xLabel}</span>
        <span>{data[data.length - 1].xLabel}</span>
      </div>
    </div>
  );
}

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

export function pad2(n) {
  return String(n).padStart(2, "0");
}

export function isoDate(d = new Date()) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

export function parseISO(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function diffDays(a, b) {
  // days between a and b (b - a)
  const ms = parseISO(isoDate(b)).getTime() - parseISO(isoDate(a)).getTime();
  return Math.round(ms / 86400000);
}

export function weekdayIndexFromISO(iso) {
  // Monday=0 ... Sunday=6
  const d = parseISO(iso);
  const js = d.getDay(); // 0 Sunday..6 Saturday
  return (js + 6) % 7;
}

export function formatHumanDate(iso) {
  const d = parseISO(iso);
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

export function deepClone(x) {
  return JSON.parse(JSON.stringify(x));
}

export function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

export function round1(n) {
  return Math.round(n * 10) / 10;
}

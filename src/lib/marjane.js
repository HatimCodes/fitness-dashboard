// Best-effort Marjane lookup.
// IMPORTANT: In many browsers Marjane pages may be blocked by CORS or use dynamic rendering.
// This module attempts a very light HTML fetch+parse. If it fails, the UI should fall back
// to manual price capture (paste product/price/size).

export function marjaneSearchUrl(query) {
  const q = encodeURIComponent(query || "");
  // Marjane uses a search UI; this URL may change, but opening it is still useful for manual capture.
  return `https://www.marjane.ma/search?q=${q}`;
}

export async function tryMarjaneSearch(query, { signal } = {}) {
  const url = marjaneSearchUrl(query);

  // Best-effort: fetch HTML and try to parse some product cards.
  // If blocked, throw an error so the UI can show the manual workflow.
  const res = await fetch(url, {
    method: "GET",
    mode: "cors",
    credentials: "omit",
    signal
  });

  if (!res.ok) throw new Error(`Marjane request failed (${res.status})`);
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // Extremely defensive parsing: try a few common selectors.
  const cards = Array.from(doc.querySelectorAll("a[href*='/product']")).slice(0, 12);
  const results = [];
  for (const a of cards) {
    const name = (a.textContent || "").trim().replace(/\s+/g, " ");
    const href = a.getAttribute("href") || "";
    if (!name || name.length < 3) continue;
    results.push({ name, url: href.startsWith("http") ? href : `https://www.marjane.ma${href}` });
  }

  return results;
}

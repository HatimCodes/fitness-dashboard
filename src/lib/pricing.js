export function formatMAD(n) {
  const v = Number(n) || 0;
  // Use Intl when available
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "MAD",
      maximumFractionDigits: 2
    }).format(v);
  } catch {
    return `${Math.round(v * 100) / 100} MAD`;
  }
}

export function computeCosts(items, priceByKey = {}) {
  let total = 0;
  let missing = 0;

  const priced = (items || []).map((it) => {
    const p = priceByKey?.[it.key] || {};
    const unitPriceMAD = Number(p.unitPriceMAD || 0);

    if (!Number.isFinite(unitPriceMAD) || unitPriceMAD <= 0) {
      missing++;
      return { ...it, unitPriceMAD: 0, costMAD: 0, missingPrice: true };
    }

    const costMAD = Math.round(it.qty * unitPriceMAD * 100) / 100;
    total += costMAD;
    return { ...it, unitPriceMAD, costMAD, missingPrice: false };
  });

  total = Math.round(total * 100) / 100;
  return { priced, total, missing };
}

export function applyMonthly(totalWeekly, multiplier = 4.3) {
  const w = Number(totalWeekly) || 0;
  const m = Number(multiplier) || 4.3;
  return Math.round(w * m * 100) / 100;
}

export function defaultPricingState() {
  return {
    mode: "weekly", // "weekly" | "monthly"
    monthlyMultiplier: 4.3,
    priceByKey: {}
  };
}

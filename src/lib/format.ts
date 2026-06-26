/** Formatting helpers shared by every calculator. */

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const USD_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function money(n: number, cents = false): string {
  if (!Number.isFinite(n)) return "—";
  return cents ? USD_CENTS.format(n) : USD.format(n);
}

export function percent(n: number, digits = 1): string {
  return `${n.toFixed(digits)}%`;
}

export function months(total: number): string {
  if (total <= 0) return "0 months";
  const y = Math.floor(total / 12);
  const m = total % 12;
  const parts: string[] = [];
  if (y) parts.push(`${y} year${y > 1 ? "s" : ""}`);
  if (m) parts.push(`${m} month${m > 1 ? "s" : ""}`);
  return parts.join(", ");
}

/** Parse a user-typed string that may include $ and commas. */
export function num(value: string | number, fallback = 0): number {
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : fallback;
}

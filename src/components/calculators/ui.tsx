/** @jsxImportSource preact */
import type { ComponentChildren } from "preact";
import { money } from "../../lib/format.ts";

export function Field({
  label,
  value,
  onInput,
  prefix,
  suffix,
  step = 1,
  min,
  max,
  help,
}: {
  label: string;
  value: number;
  onInput: (n: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  help?: string;
}) {
  return (
    <label class="block">
      <span class="field-label">{label}</span>
      <span class="relative flex items-center">
        {prefix && (
          <span class="pointer-events-none absolute left-3 text-slate-400">{prefix}</span>
        )}
        <input
          type="number"
          class="field"
          style={prefix ? "padding-left:1.6rem" : undefined}
          value={Number.isFinite(value) ? value : ""}
          step={step}
          min={min}
          max={max}
          onInput={(e) => onInput(parseFloat((e.target as HTMLInputElement).value))}
        />
        {suffix && <span class="absolute right-3 text-slate-400">{suffix}</span>}
      </span>
      {help && <span class="mt-1 block text-xs text-slate-400">{help}</span>}
    </label>
  );
}

export function Slider({
  label,
  value,
  onInput,
  min,
  max,
  step = 1,
  format,
  help,
}: {
  label: string;
  value: number;
  onInput: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (n: number) => string;
  help?: string;
}) {
  return (
    <label class="block">
      <span class="field-label flex items-center justify-between">
        <span>{label}</span>
        <span class="font-semibold text-slate-900 tnum">
          {format ? format(value) : value}
        </span>
      </span>
      <input
        type="range"
        class="w-full accent-brand-600"
        value={value}
        min={min}
        max={max}
        step={step}
        onInput={(e) => onInput(parseFloat((e.target as HTMLInputElement).value))}
      />
      {help && <span class="mt-1 block text-xs text-slate-400">{help}</span>}
    </label>
  );
}

export function Stat({
  label,
  value,
  accent = false,
  sub,
}: {
  label: string;
  value: string;
  accent?: boolean;
  sub?: string;
}) {
  return (
    <div class={`rounded-xl border p-4 ${accent ? "border-brand-200 bg-brand-50" : "border-slate-200 bg-white"}`}>
      <div class="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
      <div class={`mt-1 text-2xl font-extrabold tnum ${accent ? "text-brand-700" : "text-slate-900"}`}>
        {value}
      </div>
      {sub && <div class="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  );
}

export function Panel({ children }: { children: ComponentChildren }) {
  return <div class="grid gap-5 md:grid-cols-2">{children}</div>;
}

/** Stacked bar chart: contributions (base) + interest (top) per year. */
export function GrowthChart({
  years,
  contributions,
  totals,
}: {
  years: number[];
  contributions: number[];
  totals: number[];
}) {
  const w = 520;
  const h = 220;
  const pad = { l: 8, r: 8, t: 10, b: 22 };
  const max = Math.max(...totals, 1);
  const n = years.length;
  const bw = (w - pad.l - pad.r) / n;
  const barW = Math.max(bw * 0.62, 2);
  const y = (v: number) => pad.t + (h - pad.t - pad.b) * (1 - v / max);
  const labelEvery = Math.max(1, Math.round(n / 8));

  return (
    <svg viewBox={`0 0 ${w} ${h}`} class="w-full" role="img" aria-label="Growth over time">
      {years.map((yr, i) => {
        const x = pad.l + i * bw + (bw - barW) / 2;
        const yTop = y(totals[i]);
        const yMid = y(contributions[i]);
        return (
          <g>
            <rect x={x} y={yMid} width={barW} height={h - pad.b - yMid} fill="#a7f3d0" rx="1" />
            <rect x={x} y={yTop} width={barW} height={yMid - yTop} fill="#059669" rx="1" />
            {i % labelEvery === 0 && (
              <text x={x + barW / 2} y={h - 6} text-anchor="middle" class="fill-slate-400" font-size="9">
                {yr}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Simple line chart for a single declining/rising series (e.g. debt balance). */
export function LineChart({ series, color = "#059669" }: { series: number[]; color?: string }) {
  const w = 520;
  const h = 200;
  const pad = 8;
  const max = Math.max(...series, 1);
  const n = series.length;
  if (n < 2) return <div class="text-sm text-slate-400">Not enough data to chart.</div>;
  const x = (i: number) => pad + (w - 2 * pad) * (i / (n - 1));
  const y = (v: number) => pad + (h - 2 * pad) * (1 - v / max);
  const d = series.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${d} L${x(n - 1).toFixed(1)},${h - pad} L${x(0).toFixed(1)},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} class="w-full" role="img" aria-label="Balance over time">
      <path d={area} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} stroke-width="2.5" />
    </svg>
  );
}

/** Donut chart for a 3-way split (budget). */
export function Donut({ parts }: { parts: { label: string; value: number; color: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  const r = 60;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div class="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <svg viewBox="0 0 160 160" class="h-40 w-40 -rotate-90">
        {parts.map((p) => {
          const len = (p.value / total) * c;
          const seg = (
            <circle
              cx="80"
              cy="80"
              r={r}
              fill="none"
              stroke={p.color}
              stroke-width="22"
              stroke-dasharray={`${len} ${c - len}`}
              stroke-dashoffset={-offset}
            />
          );
          offset += len;
          return seg;
        })}
      </svg>
      <ul class="space-y-2 text-sm">
        {parts.map((p) => (
          <li class="flex items-center gap-2">
            <span class="h-3 w-3 rounded-sm" style={`background:${p.color}`} />
            <span class="text-slate-600">{p.label}</span>
            <span class="ml-auto font-semibold text-slate-900 tnum">{money(p.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const Legend = () => (
  <div class="mt-2 flex justify-center gap-5 text-xs text-slate-500">
    <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-brand-600"></span>Interest</span>
    <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-brand-200"></span>Contributions</span>
  </div>
);

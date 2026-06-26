/** @jsxImportSource preact */
import { useState, useMemo } from "preact/hooks";
import { budget5030020 } from "../../lib/finance.ts";
import { money } from "../../lib/format.ts";
import { Field, Slider, Donut } from "./ui.tsx";

export default function BudgetCalc() {
  const [income, setIncome] = useState(5000);
  const [needs, setNeeds] = useState(50);
  const [wants, setWants] = useState(30);
  const savings = Math.max(100 - needs - wants, 0);

  const r = useMemo(() => budget5030020(income || 0, needs, wants, savings), [income, needs, wants, savings]);

  return (
    <div class="grid gap-8 lg:grid-cols-2">
      <div class="card space-y-5">
        <Field label="Monthly take-home pay (after tax)" prefix="$" value={income} onInput={setIncome} step={100} min={0} />
        <Slider label="Needs" value={needs} onInput={(v) => setNeeds(Math.min(v, 100 - wants))} min={0} max={100} format={(n) => `${n}%`} />
        <Slider label="Wants" value={wants} onInput={(v) => setWants(Math.min(v, 100 - needs))} min={0} max={100} format={(n) => `${n}%`} />
        <div class="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Savings & debt payoff: <strong class="text-brand-700">{savings}%</strong> (whatever's left)
        </div>
        <button class="btn-ghost" onClick={() => { setNeeds(50); setWants(30); }}>Reset to 50 / 30 / 20</button>
      </div>

      <div class="card">
        <Donut
          parts={[
            { label: `Needs (${needs}%)`, value: r.needs, color: "#059669" },
            { label: `Wants (${wants}%)`, value: r.wants, color: "#34d399" },
            { label: `Savings (${savings}%)`, value: r.savings, color: "#a7f3d0" },
          ]}
        />
        <ul class="mt-6 space-y-2 text-sm">
          <li class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-600">Needs — rent, food, bills, minimum debt payments</span><span class="font-bold text-slate-900 tnum">{money(r.needs)}</span></li>
          <li class="flex justify-between border-b border-slate-100 pb-2"><span class="text-slate-600">Wants — dining, travel, subscriptions, hobbies</span><span class="font-bold text-slate-900 tnum">{money(r.wants)}</span></li>
          <li class="flex justify-between"><span class="text-slate-600">Savings — emergency fund, investing, extra debt</span><span class="font-bold text-brand-700 tnum">{money(r.savings)}</span></li>
        </ul>
      </div>
    </div>
  );
}

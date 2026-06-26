/** @jsxImportSource preact */
import { useState, useMemo } from "preact/hooks";
import { retirement } from "../../lib/finance.ts";
import { money } from "../../lib/format.ts";
import { Field, Slider, Stat, Panel, GrowthChart, Legend } from "./ui.tsx";

export default function RetirementCalc() {
  const [age, setAge] = useState(32);
  const [retireAge, setRetireAge] = useState(65);
  const [savings, setSavings] = useState(40000);
  const [monthly, setMonthly] = useState(800);
  const [ret, setRet] = useState(7);
  const [income, setIncome] = useState(60000);

  const r = useMemo(
    () =>
      retirement({
        currentAge: age,
        retirementAge: retireAge,
        currentSavings: savings || 0,
        monthlyContribution: monthly || 0,
        annualReturnPercent: ret || 0,
        desiredAnnualIncome: income || 0,
      }),
    [age, retireAge, savings, monthly, ret, income]
  );

  return (
    <div class="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
      <div class="card space-y-5">
        <Panel>
          <Slider label="Current age" value={age} onInput={setAge} min={18} max={70} />
          <Slider label="Retirement age" value={retireAge} onInput={(v) => setRetireAge(Math.max(v, age + 1))} min={40} max={75} />
        </Panel>
        <Panel>
          <Field label="Current savings" prefix="$" value={savings} onInput={setSavings} step={1000} min={0} />
          <Field label="Monthly contribution" prefix="$" value={monthly} onInput={setMonthly} step={50} min={0} />
        </Panel>
        <Slider label="Expected annual return" value={ret} onInput={setRet} min={1} max={12} step={0.1} format={(n) => `${n.toFixed(1)}%`} />
        <Field label="Income you'll want per year (today's $)" prefix="$" value={income} onInput={setIncome} step={1000} min={0} help="We adjust this for inflation to your retirement date." />
      </div>

      <div class="space-y-5">
        <div class={`rounded-2xl border p-5 ${r.onTrack ? "border-brand-300 bg-brand-50" : "border-amber-300 bg-amber-50"}`}>
          <div class="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {r.onTrack ? "You're on track 🎉" : "Projected shortfall"}
          </div>
          <div class={`mt-1 text-3xl font-extrabold tnum ${r.onTrack ? "text-brand-700" : "text-amber-700"}`}>
            {r.onTrack
              ? `+${money(r.surplusOrShortfall)}`
              : `${money(r.surplusOrShortfall)}`}
          </div>
          <p class="mt-1 text-sm text-slate-600">
            vs your FIRE target of <strong>{money(r.fireNumber)}</strong> at age {retireAge}.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Stat label="Projected nest egg" value={money(r.projectedBalance)} accent />
          <Stat label="FIRE number needed" value={money(r.fireNumber)} sub="Income ÷ 4% rule" />
          <Stat label="Sustainable income / yr" value={money(r.sustainableAnnualIncome)} sub="From your projected balance" />
          <Stat label="Target income at retirement" value={money(r.targetIncomeAtRetirement)} sub="Inflation-adjusted" />
        </div>

        <div class="card">
          <h3 class="mb-1 text-sm font-semibold text-slate-700">Nest egg growth</h3>
          <GrowthChart
            years={r.schedule.map((p) => age + p.year)}
            contributions={r.schedule.map((p) => p.totalContributions)}
            totals={r.schedule.map((p) => p.balance)}
          />
          <Legend />
        </div>
      </div>
    </div>
  );
}

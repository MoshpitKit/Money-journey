/** @jsxImportSource preact */
import { useState, useMemo } from "preact/hooks";
import { compoundInterest } from "../../lib/finance.ts";
import { money } from "../../lib/format.ts";
import { Field, Slider, Stat, Panel, GrowthChart, Legend } from "./ui.tsx";

export default function CompoundInterestCalc() {
  const [principal, setPrincipal] = useState(10000);
  const [contribution, setContribution] = useState(500);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(25);
  const [compounds, setCompounds] = useState(12);

  const r = useMemo(
    () =>
      compoundInterest({
        principal: principal || 0,
        annualRatePercent: rate || 0,
        years: years || 0,
        contribution: contribution || 0,
        contributionFrequency: "monthly",
        compoundsPerYear: compounds,
      }),
    [principal, contribution, rate, years, compounds]
  );

  return (
    <div class="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
      <div class="card space-y-5">
        <Panel>
          <Field label="Starting amount" prefix="$" value={principal} onInput={setPrincipal} step={500} min={0} />
          <Field label="Monthly contribution" prefix="$" value={contribution} onInput={setContribution} step={50} min={0} />
        </Panel>
        <Slider label="Annual return rate" value={rate} onInput={setRate} min={0} max={15} step={0.1} format={(n) => `${n.toFixed(1)}%`} />
        <Slider label="Years" value={years} onInput={setYears} min={1} max={50} format={(n) => `${n} yr`} />
        <label class="block">
          <span class="field-label">Compounding frequency</span>
          <select class="field" value={compounds} onChange={(e) => setCompounds(parseInt((e.target as HTMLSelectElement).value))}>
            <option value={365}>Daily</option>
            <option value={12}>Monthly</option>
            <option value={4}>Quarterly</option>
            <option value={1}>Annually</option>
          </select>
        </label>
      </div>

      <div class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-3">
          <Stat label="Future balance" value={money(r.futureValue)} accent />
          <Stat label="You put in" value={money(r.totalContributions)} />
          <Stat label="Interest earned" value={money(r.totalInterest)} />
        </div>
        <div class="card">
          <h3 class="mb-1 text-sm font-semibold text-slate-700">Growth over time</h3>
          <GrowthChart
            years={r.schedule.map((p) => p.year)}
            contributions={r.schedule.map((p) => p.totalContributions)}
            totals={r.schedule.map((p) => p.balance)}
          />
          <Legend />
          <p class="mt-3 text-sm text-slate-500">
            After {years} years, interest makes up{" "}
            <strong class="text-brand-700">
              {r.futureValue > 0 ? Math.round((r.totalInterest / r.futureValue) * 100) : 0}%
            </strong>{" "}
            of your balance. That's compounding doing the heavy lifting.
          </p>
        </div>
      </div>
    </div>
  );
}

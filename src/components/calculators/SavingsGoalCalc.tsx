/** @jsxImportSource preact */
import { useState, useMemo } from "preact/hooks";
import { savingsGoal } from "../../lib/finance.ts";
import { money } from "../../lib/format.ts";
import { Field, Slider, Stat } from "./ui.tsx";

export default function SavingsGoalCalc() {
  const [goal, setGoal] = useState(30000);
  const [current, setCurrent] = useState(5000);
  const [years, setYears] = useState(5);
  const [rate, setRate] = useState(4);

  const r = useMemo(
    () =>
      savingsGoal({
        goalAmount: goal || 0,
        currentSavings: current || 0,
        years: years || 0,
        annualRatePercent: rate || 0,
      }),
    [goal, current, years, rate]
  );

  return (
    <div class="grid gap-8 lg:grid-cols-2">
      <div class="card space-y-5">
        <Field label="Savings goal" prefix="$" value={goal} onInput={setGoal} step={1000} min={0} />
        <Field label="Already saved" prefix="$" value={current} onInput={setCurrent} step={500} min={0} />
        <Slider label="Time to reach it" value={years} onInput={setYears} min={1} max={40} format={(n) => `${n} yr`} />
        <Slider label="Interest / return rate" value={rate} onInput={setRate} min={0} max={12} step={0.1} format={(n) => `${n.toFixed(1)}%`} help="A high-yield savings account is ~4–5%." />
      </div>

      <div class="space-y-5">
        <Stat label="You need to save" value={`${money(r.requiredMonthly, true)}/mo`} accent />
        <div class="grid gap-4 sm:grid-cols-2">
          <Stat label="Total you'll contribute" value={money(r.totalContributed)} />
          <Stat label="Earned from interest" value={money(Math.max(r.interestEarned, 0))} />
        </div>
        {r.requiredMonthly === 0 && (
          <p class="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-slate-700">
            Good news — your current savings will grow past this goal on their own
            in {years} years at {rate}%. No new contributions required.
          </p>
        )}
        <p class="text-sm text-slate-500">
          Saving <strong class="text-brand-700">{money(r.requiredMonthly, true)}</strong> every
          month for {years} years gets you to <strong>{money(goal)}</strong>. Interest
          covers <strong>{goal > 0 ? Math.round((Math.max(r.interestEarned, 0) / goal) * 100) : 0}%</strong> of the goal.
        </p>
      </div>
    </div>
  );
}

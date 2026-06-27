/** @jsxImportSource preact */
import { useState, useMemo } from "preact/hooks";
import { coastFire } from "../../lib/finance.ts";
import { money } from "../../lib/format.ts";
import { Field, Slider, Stat, Panel } from "./ui.tsx";

/** Two overlaid lines: your projected balance vs the coast target by age. */
function CoastChart({
  ages,
  balance,
  target,
}: {
  ages: number[];
  balance: number[];
  target: number[];
}) {
  const w = 520;
  const h = 220;
  const pad = { l: 8, r: 8, t: 10, b: 22 };
  const max = Math.max(...balance, ...target, 1);
  const n = ages.length;
  if (n < 2) return null;
  const x = (i: number) => pad.l + (w - pad.l - pad.r) * (i / (n - 1));
  const y = (v: number) => pad.t + (h - pad.t - pad.b) * (1 - v / max);
  const line = (s: number[]) =>
    s.map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const labelEvery = Math.max(1, Math.round(n / 8));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} class="w-full" role="img" aria-label="Balance vs coast target">
      <path d={`${line(balance)} L${x(n - 1)},${h - pad.b} L${x(0)},${h - pad.b} Z`} fill="#059669" opacity="0.10" />
      <path d={line(target)} fill="none" stroke="#34d399" stroke-width="2" stroke-dasharray="5 4" />
      <path d={line(balance)} fill="none" stroke="#059669" stroke-width="2.5" />
      {ages.map((a, i) =>
        i % labelEvery === 0 ? (
          <text x={x(i)} y={h - 6} text-anchor="middle" class="fill-slate-400" font-size="9">{a}</text>
        ) : null
      )}
    </svg>
  );
}

export default function CoastFireCalc() {
  const [age, setAge] = useState(30);
  const [retireAge, setRetireAge] = useState(60);
  const [spending, setSpending] = useState(40000);
  const [invested, setInvested] = useState(75000);
  const [monthly, setMonthly] = useState(1000);
  const [realReturn, setRealReturn] = useState(5);
  const [withdrawal, setWithdrawal] = useState(4);

  const r = useMemo(
    () =>
      coastFire({
        currentAge: age,
        retirementAge: Math.max(retireAge, age + 1),
        annualSpending: spending || 0,
        currentInvested: invested || 0,
        realReturnPercent: realReturn || 0,
        monthlyContribution: monthly || 0,
        withdrawalRatePercent: withdrawal || 4,
      }),
    [age, retireAge, spending, invested, monthly, realReturn, withdrawal]
  );

  return (
    <div class="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
      <div class="card space-y-5">
        <Panel>
          <Slider label="Current age" value={age} onInput={setAge} min={18} max={60} />
          <Slider label="Retirement age" value={retireAge} onInput={(v) => setRetireAge(Math.max(v, age + 1))} min={45} max={75} />
        </Panel>
        <Field label="Annual spending in retirement (today's $)" prefix="$" value={spending} onInput={setSpending} step={1000} min={0} help="What your lifestyle costs per year, in today's money." />
        <Panel>
          <Field label="Currently invested" prefix="$" value={invested} onInput={setInvested} step={1000} min={0} />
          <Field label="Monthly contribution" prefix="$" value={monthly} onInput={setMonthly} step={50} min={0} help="Used to find your coast age." />
        </Panel>
        <Panel>
          <Slider label="Real return" value={realReturn} onInput={setRealReturn} min={1} max={9} step={0.1} format={(n) => `${n.toFixed(1)}%`} help="After inflation." />
          <Slider label="Withdrawal rate" value={withdrawal} onInput={setWithdrawal} min={3} max={5} step={0.1} format={(n) => `${n.toFixed(1)}%`} />
        </Panel>
      </div>

      <div class="space-y-5">
        <div class={`rounded-2xl border p-5 ${r.hasCoasted ? "border-brand-300 bg-brand-50" : "border-amber-300 bg-amber-50"}`}>
          <div class="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {r.hasCoasted ? "🎉 You've hit Coast FIRE" : "Not coasting yet"}
          </div>
          <div class={`mt-1 text-3xl font-extrabold tnum ${r.hasCoasted ? "text-brand-700" : "text-amber-700"}`}>
            {r.hasCoasted
              ? "You can stop contributing"
              : `${money(r.shortfallToday)} to go`}
          </div>
          <p class="mt-1 text-sm text-slate-600">
            {r.hasCoasted
              ? `Your investments alone should grow to ${money(r.projectedNoContrib)} by age ${Math.max(retireAge, age + 1)}.`
              : r.coastAge
                ? `At ${money(monthly)}/mo, you'll reach Coast FIRE around age ${r.coastAge}.`
                : `Increase contributions or time to reach your coast number.`}
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Stat label="Coast number (needed today)" value={money(r.coastNumberToday)} accent sub="Invest this now & you can coast" />
          <Stat label="Full FIRE number" value={money(r.fireNumber)} sub={`Spending ÷ ${withdrawal}% rule`} />
          <Stat label="Projected at retirement" value={money(r.projectedNoContrib)} sub="From today's balance, no new contributions" />
          <Stat label="Coast age" value={r.coastAge ? `${r.coastAge}` : "—"} sub={`At ${money(monthly)}/mo`} />
        </div>

        <div class="card">
          <h3 class="mb-1 text-sm font-semibold text-slate-700">Your balance vs the coast target</h3>
          <CoastChart
            ages={r.schedule.map((p) => p.age)}
            balance={r.schedule.map((p) => p.balance)}
            target={r.schedule.map((p) => p.coastTarget)}
          />
          <div class="mt-2 flex justify-center gap-5 text-xs text-slate-500">
            <span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-brand-600"></span>Your balance</span>
            <span class="flex items-center gap-1.5"><span class="h-0.5 w-3 bg-brand-400"></span>Coast target by age</span>
          </div>
          <p class="mt-3 text-sm text-slate-500">
            The coast target falls the earlier you are (more time to compound). Once
            your balance crosses it, you've reached Coast FIRE.
          </p>
        </div>
      </div>
    </div>
  );
}

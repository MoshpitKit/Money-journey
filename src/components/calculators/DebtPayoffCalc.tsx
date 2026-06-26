/** @jsxImportSource preact */
import { useState, useMemo } from "preact/hooks";
import { debtPayoff, type Debt } from "../../lib/finance.ts";
import { money, months } from "../../lib/format.ts";
import { Stat, LineChart } from "./ui.tsx";

type Strategy = "avalanche" | "snowball";

const START: Debt[] = [
  { name: "Credit card", balance: 6000, annualRatePercent: 22.9, minPayment: 150 },
  { name: "Car loan", balance: 12000, annualRatePercent: 7.5, minPayment: 280 },
  { name: "Personal loan", balance: 4000, annualRatePercent: 13, minPayment: 110 },
];

export default function DebtPayoffCalc() {
  const [debts, setDebts] = useState<Debt[]>(START);
  const [budget, setBudget] = useState(800);
  const [strategy, setStrategy] = useState<Strategy>("avalanche");

  const totalMin = debts.reduce((s, d) => s + (d.minPayment || 0), 0);

  const result = useMemo(() => debtPayoff(debts, budget, strategy), [debts, budget, strategy]);
  const other = useMemo(
    () => debtPayoff(debts, budget, strategy === "avalanche" ? "snowball" : "avalanche"),
    [debts, budget, strategy]
  );

  const update = (i: number, key: keyof Debt, value: string) =>
    setDebts((d) =>
      d.map((row, j) =>
        j === i ? { ...row, [key]: key === "name" ? value : parseFloat(value) || 0 } : row
      )
    );
  const addDebt = () =>
    setDebts((d) => [...d, { name: `Debt ${d.length + 1}`, balance: 1000, annualRatePercent: 15, minPayment: 50 }]);
  const removeDebt = (i: number) => setDebts((d) => d.filter((_, j) => j !== i));

  const savesVsOther = result.feasible && other.feasible ? other.totalInterest - result.totalInterest : 0;

  return (
    <div class="space-y-6">
      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-xs uppercase tracking-wide text-slate-500">
              <th class="pb-2">Debt</th>
              <th class="pb-2">Balance</th>
              <th class="pb-2">APR %</th>
              <th class="pb-2">Min / mo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {debts.map((d, i) => (
              <tr class="border-t border-slate-100">
                <td class="py-2 pr-2"><input class="field" value={d.name} onInput={(e) => update(i, "name", (e.target as HTMLInputElement).value)} /></td>
                <td class="py-2 pr-2"><input class="field w-28" type="number" value={d.balance} onInput={(e) => update(i, "balance", (e.target as HTMLInputElement).value)} /></td>
                <td class="py-2 pr-2"><input class="field w-20" type="number" step="0.1" value={d.annualRatePercent} onInput={(e) => update(i, "annualRatePercent", (e.target as HTMLInputElement).value)} /></td>
                <td class="py-2 pr-2"><input class="field w-24" type="number" value={d.minPayment} onInput={(e) => update(i, "minPayment", (e.target as HTMLInputElement).value)} /></td>
                <td class="py-2">
                  {debts.length > 1 && (
                    <button class="text-slate-400 hover:text-red-500" onClick={() => removeDebt(i)} aria-label="Remove">✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button class="btn-ghost mt-3" onClick={addDebt}>+ Add a debt</button>
      </div>

      <div class="card grid gap-5 sm:grid-cols-2">
        <label class="block">
          <span class="field-label">Total you can pay each month</span>
          <span class="relative flex items-center">
            <span class="pointer-events-none absolute left-3 text-slate-400">$</span>
            <input type="number" class="field" style="padding-left:1.6rem" value={budget} onInput={(e) => setBudget(parseFloat((e.target as HTMLInputElement).value) || 0)} />
          </span>
          <span class="mt-1 block text-xs text-slate-400">Your minimums total {money(totalMin)}/mo.</span>
        </label>
        <div>
          <span class="field-label">Strategy</span>
          <div class="grid grid-cols-2 gap-2">
            <button class={tab(strategy === "avalanche")} onClick={() => setStrategy("avalanche")}>
              Avalanche <span class="block text-[11px] font-normal opacity-80">Highest APR first · least interest</span>
            </button>
            <button class={tab(strategy === "snowball")} onClick={() => setStrategy("snowball")}>
              Snowball <span class="block text-[11px] font-normal opacity-80">Smallest balance first · fast wins</span>
            </button>
          </div>
        </div>
      </div>

      {!result.feasible ? (
        <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
          Your monthly budget of {money(budget)} is below your minimum payments ({money(totalMin)}).
          Increase the budget to see a payoff plan.
        </div>
      ) : (
        <>
          <div class="grid gap-4 sm:grid-cols-3">
            <Stat label="Debt-free in" value={months(result.months)} accent />
            <Stat label="Total interest paid" value={money(result.totalInterest)} />
            <Stat label="Total paid" value={money(result.totalPaid)} />
          </div>

          {savesVsOther > 0 && (
            <p class="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-slate-700">
              The <strong>{strategy}</strong> method saves you{" "}
              <strong class="text-brand-700">{money(savesVsOther)}</strong> in interest versus the{" "}
              {strategy === "avalanche" ? "snowball" : "avalanche"} method here.
            </p>
          )}

          <div class="card">
            <h3 class="mb-1 text-sm font-semibold text-slate-700">Total balance over time</h3>
            <LineChart series={result.balanceByMonth} />
            <div class="mt-4 flex flex-wrap gap-2 text-sm">
              {result.payoffOrder.map((p, i) => (
                <span class="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  {i + 1}. {p.name} — {months(p.payoffMonth)}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const tab = (active: boolean) =>
  `rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
    active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
  }`;

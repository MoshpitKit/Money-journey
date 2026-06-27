/** @jsxImportSource preact */
import { useState, useMemo } from "preact/hooks";
import { homeAffordability } from "../../lib/finance.ts";
import { money } from "../../lib/format.ts";
import { Field, Slider, Stat, Panel } from "./ui.tsx";

export default function HomeAffordabilityCalc() {
  const [income, setIncome] = useState(120000);
  const [debts, setDebts] = useState(400);
  const [down, setDown] = useState(60000);
  const [rate, setRate] = useState(6.5);
  const [term, setTerm] = useState(30);
  const [taxRate, setTaxRate] = useState(1.1);
  const [hoa, setHoa] = useState(0);

  const r = useMemo(
    () =>
      homeAffordability({
        annualIncome: income || 0,
        monthlyDebts: debts || 0,
        downPayment: down || 0,
        annualRatePercent: rate || 0,
        termYears: term,
        propertyTaxRatePercent: taxRate,
        hoaMonthly: hoa,
      }),
    [income, debts, down, rate, term, taxRate, hoa]
  );

  return (
    <div class="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
      <div class="card space-y-5">
        <Field label="Gross annual household income" prefix="$" value={income} onInput={setIncome} step={5000} min={0} />
        <Panel>
          <Field label="Monthly debt payments" prefix="$" value={debts} onInput={setDebts} step={50} min={0} help="Car, student loans, min. cards." />
          <Field label="Down payment" prefix="$" value={down} onInput={setDown} step={5000} min={0} />
        </Panel>
        <Panel>
          <Slider label="Interest rate" value={rate} onInput={setRate} min={1} max={12} step={0.05} format={(n) => `${n.toFixed(2)}%`} />
          <Slider label="Loan term" value={term} onInput={setTerm} min={10} max={30} step={5} format={(n) => `${n} yr`} />
        </Panel>
        <Panel>
          <Slider label="Property tax rate" value={taxRate} onInput={setTaxRate} min={0} max={3} step={0.1} format={(n) => `${n.toFixed(1)}%`} help="Annual, % of home value." />
          <Field label="HOA / mo" prefix="$" value={hoa} onInput={setHoa} step={25} min={0} />
        </Panel>
      </div>

      <div class="space-y-5">
        <div class="rounded-2xl border border-brand-200 bg-brand-50 p-5">
          <div class="text-sm font-semibold uppercase tracking-wide text-slate-500">Home you can afford</div>
          <div class="mt-1 text-4xl font-extrabold tnum text-brand-700">{money(r.maxHomePrice)}</div>
          <p class="mt-1 text-sm text-slate-600">
            With {money(down)} down ({r.downPaymentPercent}%), that's a {money(r.maxLoan)} loan.
            Limited by the <strong>{r.limitedBy === "front-end" ? "28% housing" : "36% total-debt"}</strong> rule.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <Stat label="Max total payment" value={money(r.maxMonthlyPayment, true)} accent sub="PITI ceiling at 28/36" />
          <Stat label="Estimated payment" value={money(r.totalMonthly, true)} sub="At the max price" />
        </div>

        <div class="card text-sm">
          <h3 class="mb-2 font-semibold text-slate-700">Estimated monthly breakdown</h3>
          <ul class="space-y-1.5 text-slate-600">
            <Row label="Principal & interest" v={money(r.principalAndInterest, true)} />
            <Row label="Property tax" v={money(r.monthlyTax, true)} />
            <Row label="Home insurance" v={money(r.monthlyInsurance, true)} />
            {r.monthlyPmi > 0 && <Row label="PMI (under 20% down)" v={money(r.monthlyPmi, true)} />}
            {r.hoaMonthly > 0 && <Row label="HOA" v={money(r.hoaMonthly, true)} />}
          </ul>
        </div>

        <p class="text-sm text-slate-500">
          The <strong>28/36 rule</strong> keeps housing under 28% of gross income and
          total debt under 36%. Lenders may allow more, but this is a sustainable
          ceiling. Clearing monthly debts often raises your budget more than a rate change.
        </p>
      </div>
    </div>
  );
}

const Row = ({ label, v }: { label: string; v: string }) => (
  <li class="flex items-center justify-between border-b border-slate-100 pb-1.5">
    <span>{label}</span>
    <span class="font-semibold text-slate-900 tnum">{v}</span>
  </li>
);

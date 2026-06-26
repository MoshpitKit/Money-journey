/** @jsxImportSource preact */
import { useState, useMemo } from "preact/hooks";
import { mortgage } from "../../lib/finance.ts";
import { money, months } from "../../lib/format.ts";
import { Field, Slider, Stat, Panel, GrowthChart, Legend } from "./ui.tsx";

export default function MortgageCalc() {
  const [price, setPrice] = useState(400000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(6.5);
  const [term, setTerm] = useState(30);
  const [taxAnnual, setTaxAnnual] = useState(4800);
  const [insAnnual, setInsAnnual] = useState(1500);
  const [hoa, setHoa] = useState(0);
  const [extra, setExtra] = useState(0);

  const down = (price * downPct) / 100;
  const principal = Math.max(price - down, 0);
  // PMI typically applies under 20% down (~0.5%/yr of loan).
  const pmiAnnual = downPct < 20 ? principal * 0.005 : 0;

  const r = useMemo(
    () =>
      mortgage({
        principal,
        annualRatePercent: rate || 0,
        termYears: term,
        propertyTaxAnnual: taxAnnual,
        insuranceAnnual: insAnnual,
        hoaMonthly: hoa,
        pmiAnnual,
        extraMonthly: extra,
      }),
    [principal, rate, term, taxAnnual, insAnnual, hoa, pmiAnnual, extra]
  );

  // Yearly snapshot of remaining balance for the chart.
  const yearly = r.schedule.filter((_, i) => (i + 1) % 12 === 0 || i === r.schedule.length - 1);

  return (
    <div class="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
      <div class="card space-y-5">
        <Field label="Home price" prefix="$" value={price} onInput={setPrice} step={5000} min={0} />
        <Slider label="Down payment" value={downPct} onInput={setDownPct} min={0} max={50} step={1} format={(n) => `${n}% · ${money((price * n) / 100)}`} />
        <Panel>
          <Slider label="Interest rate" value={rate} onInput={setRate} min={1} max={12} step={0.05} format={(n) => `${n.toFixed(2)}%`} />
          <Slider label="Loan term" value={term} onInput={setTerm} min={10} max={30} step={5} format={(n) => `${n} yr`} />
        </Panel>
        <Panel>
          <Field label="Property tax / yr" prefix="$" value={taxAnnual} onInput={setTaxAnnual} step={100} min={0} />
          <Field label="Home insurance / yr" prefix="$" value={insAnnual} onInput={setInsAnnual} step={100} min={0} />
        </Panel>
        <Panel>
          <Field label="HOA / mo" prefix="$" value={hoa} onInput={setHoa} step={25} min={0} />
          <Field label="Extra payment / mo" prefix="$" value={extra} onInput={setExtra} step={50} min={0} help="Cuts your interest & payoff time." />
        </Panel>
      </div>

      <div class="space-y-5">
        <div class="grid gap-4 sm:grid-cols-2">
          <Stat label="Total monthly payment" value={money(r.totalMonthly, true)} accent sub="Principal, interest, taxes, insurance + more" />
          <Stat label="Principal & interest" value={money(r.principalAndInterest, true)} />
          <Stat label="Loan amount" value={money(principal)} sub={`${downPct}% down = ${money(down)}`} />
          <Stat label="Total interest" value={money(r.totalInterest)} sub={extra > 0 ? `Paid off in ${months(r.payoffMonths)}` : `Over ${term} years`} />
        </div>

        <div class="card text-sm">
          <h3 class="mb-2 font-semibold text-slate-700">Monthly breakdown</h3>
          <ul class="space-y-1.5 text-slate-600">
            <Row label="Principal & interest" v={money(r.principalAndInterest, true)} />
            <Row label="Property tax" v={money(r.monthlyTax, true)} />
            <Row label="Home insurance" v={money(r.monthlyInsurance, true)} />
            {r.monthlyPmi > 0 && <Row label="PMI (under 20% down)" v={money(r.monthlyPmi, true)} />}
            {r.hoaMonthly > 0 && <Row label="HOA" v={money(r.hoaMonthly, true)} />}
          </ul>
        </div>

        <div class="card">
          <h3 class="mb-1 text-sm font-semibold text-slate-700">Loan balance over time</h3>
          <GrowthChart
            years={yearly.map((_, i) => i + 1)}
            contributions={yearly.map(() => 0)}
            totals={yearly.map((p) => p.balance)}
          />
          <Legend />
        </div>
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

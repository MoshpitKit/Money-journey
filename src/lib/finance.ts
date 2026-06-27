/**
 * finance.ts — Pure, well-tested financial math.
 *
 * Every function here is deterministic and side-effect free so it can be
 * unit-tested (see finance.test.ts) and reused on server or client.
 * Rates are passed as PERCENTAGES (e.g. 5 for 5%) at the public boundary
 * and converted to decimals internally — this matches what users type.
 */

const asRate = (percent: number) => percent / 100;

/** Convert a nominal annual rate compounded `m` times/yr into a monthly growth factor. */
function monthlyGrowthFactor(annualPercent: number, compoundsPerYear: number): number {
  const r = asRate(annualPercent);
  if (r === 0) return 1;
  if (compoundsPerYear <= 0) return Math.pow(1 + r, 1 / 12); // continuous-ish fallback
  const ear = Math.pow(1 + r / compoundsPerYear, compoundsPerYear) - 1;
  return Math.pow(1 + ear, 1 / 12);
}

// ---------------------------------------------------------------------------
// Compound interest / investment growth
// ---------------------------------------------------------------------------

export interface CompoundInput {
  principal: number;
  /** Annual interest rate as a percentage, e.g. 7 for 7%. */
  annualRatePercent: number;
  years: number;
  /** Recurring contribution amount. Default 0. */
  contribution?: number;
  /** "monthly" | "annual". Default "monthly". */
  contributionFrequency?: "monthly" | "annual";
  /** Contribute at the start of each period (annuity due). Default false. */
  contributeAtStart?: boolean;
  /** Times interest compounds per year (1,2,4,12,365). Default 12. */
  compoundsPerYear?: number;
}

export interface YearPoint {
  year: number;
  balance: number;
  totalContributions: number;
  totalInterest: number;
}

export interface CompoundResult {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
  schedule: YearPoint[];
}

/**
 * Future value of a principal plus recurring contributions.
 * Simulated month-by-month for transparency and exactness with extra payments.
 */
export function compoundInterest(input: CompoundInput): CompoundResult {
  const {
    principal,
    annualRatePercent,
    years,
    contribution = 0,
    contributionFrequency = "monthly",
    contributeAtStart = false,
    compoundsPerYear = 12,
  } = input;

  const g = monthlyGrowthFactor(annualRatePercent, compoundsPerYear);
  const months = Math.round(years * 12);
  let balance = principal;
  let totalContributions = principal;
  const schedule: YearPoint[] = [];

  for (let m = 1; m <= months; m++) {
    const isContribMonth =
      contributionFrequency === "monthly" ? true : m % 12 === 1;
    const monthlyContribution = isContribMonth ? contribution : 0;

    if (contributeAtStart) {
      balance += monthlyContribution;
      totalContributions += monthlyContribution;
    }
    balance *= g; // apply growth
    if (!contributeAtStart) {
      balance += monthlyContribution;
      totalContributions += monthlyContribution;
    }

    if (m % 12 === 0 || m === months) {
      schedule.push({
        year: Math.ceil(m / 12),
        balance: round2(balance),
        totalContributions: round2(totalContributions),
        totalInterest: round2(balance - totalContributions),
      });
    }
  }

  if (months === 0) {
    schedule.push({
      year: 0,
      balance: round2(balance),
      totalContributions: round2(totalContributions),
      totalInterest: 0,
    });
  }

  return {
    futureValue: round2(balance),
    totalContributions: round2(totalContributions),
    totalInterest: round2(balance - totalContributions),
    schedule,
  };
}

// ---------------------------------------------------------------------------
// Amortizing loans (mortgage, auto, personal)
// ---------------------------------------------------------------------------

export interface LoanInput {
  principal: number;
  annualRatePercent: number;
  termYears: number;
  /** Optional extra payment applied to principal each month. */
  extraMonthly?: number;
}

export interface AmortRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface LoanResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  /** Months actually taken (shorter than term if extra payments are made). */
  payoffMonths: number;
  schedule: AmortRow[];
}

/** Standard fixed-rate amortizing payment: P·i / (1 − (1+i)^−N). */
export function monthlyLoanPayment(
  principal: number,
  annualRatePercent: number,
  termYears: number
): number {
  const i = asRate(annualRatePercent) / 12;
  const n = Math.round(termYears * 12);
  if (n <= 0) return 0;
  if (i === 0) return principal / n;
  return (principal * i) / (1 - Math.pow(1 + i, -n));
}

export function amortize(input: LoanInput): LoanResult {
  const { principal, annualRatePercent, termYears, extraMonthly = 0 } = input;
  const i = asRate(annualRatePercent) / 12;
  const basePayment = monthlyLoanPayment(principal, annualRatePercent, termYears);
  const maxMonths = Math.round(termYears * 12);

  let balance = principal;
  let totalInterest = 0;
  let totalPaid = 0;
  const schedule: AmortRow[] = [];
  let month = 0;

  // Guard against pathological inputs that never amortize.
  while (balance > 0.005 && month < maxMonths + 1) {
    month++;
    const interest = balance * i;
    let principalPart = basePayment - interest + extraMonthly;
    if (principalPart > balance) principalPart = balance;
    const payment = principalPart + interest;
    balance -= principalPart;
    totalInterest += interest;
    totalPaid += payment;
    schedule.push({
      month,
      payment: round2(payment),
      principal: round2(principalPart),
      interest: round2(interest),
      balance: round2(Math.max(balance, 0)),
    });
    if (basePayment <= interest && extraMonthly === 0) break; // never pays down
  }

  return {
    monthlyPayment: round2(basePayment),
    totalPaid: round2(totalPaid),
    totalInterest: round2(totalInterest),
    payoffMonths: month,
    schedule,
  };
}

export interface MortgageInput extends LoanInput {
  /** Annual property tax in currency. */
  propertyTaxAnnual?: number;
  /** Annual homeowners insurance. */
  insuranceAnnual?: number;
  /** Monthly HOA dues. */
  hoaMonthly?: number;
  /** Annual PMI (often required under 20% down). */
  pmiAnnual?: number;
}

export interface MortgageResult extends LoanResult {
  principalAndInterest: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyPmi: number;
  hoaMonthly: number;
  totalMonthly: number;
}

/** Full PITI + HOA monthly housing cost. */
export function mortgage(input: MortgageInput): MortgageResult {
  const loan = amortize(input);
  const monthlyTax = (input.propertyTaxAnnual ?? 0) / 12;
  const monthlyInsurance = (input.insuranceAnnual ?? 0) / 12;
  const monthlyPmi = (input.pmiAnnual ?? 0) / 12;
  const hoaMonthly = input.hoaMonthly ?? 0;
  const totalMonthly =
    loan.monthlyPayment + monthlyTax + monthlyInsurance + monthlyPmi + hoaMonthly;
  return {
    ...loan,
    principalAndInterest: loan.monthlyPayment,
    monthlyTax: round2(monthlyTax),
    monthlyInsurance: round2(monthlyInsurance),
    monthlyPmi: round2(monthlyPmi),
    hoaMonthly: round2(hoaMonthly),
    totalMonthly: round2(totalMonthly),
  };
}

// ---------------------------------------------------------------------------
// Debt payoff — snowball vs avalanche
// ---------------------------------------------------------------------------

export interface Debt {
  name: string;
  balance: number;
  annualRatePercent: number;
  minPayment: number;
}

export interface DebtPayoffResult {
  strategy: "snowball" | "avalanche";
  months: number;
  totalInterest: number;
  totalPaid: number;
  payoffOrder: { name: string; payoffMonth: number }[];
  /** Monthly total balance across all debts, for charting. */
  balanceByMonth: number[];
  feasible: boolean;
}

/**
 * Simulate paying down multiple debts with a fixed monthly budget.
 * "snowball" targets the smallest balance first (motivational);
 * "avalanche" targets the highest APR first (mathematically optimal).
 */
export function debtPayoff(
  debts: Debt[],
  monthlyBudget: number,
  strategy: "snowball" | "avalanche"
): DebtPayoffResult {
  const working = debts.map((d) => ({ ...d, paidMonth: 0 }));
  const totalMin = working.reduce((s, d) => s + d.minPayment, 0);
  const balanceByMonth: number[] = [];
  const payoffOrder: { name: string; payoffMonth: number }[] = [];

  // If budget can't even cover minimums, the plan is infeasible.
  if (monthlyBudget < totalMin) {
    return {
      strategy,
      months: 0,
      totalInterest: 0,
      totalPaid: 0,
      payoffOrder: [],
      balanceByMonth: [working.reduce((s, d) => s + d.balance, 0)],
      feasible: false,
    };
  }

  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;
  const MAX_MONTHS = 1200; // 100-year safety valve

  const remaining = () => working.filter((d) => d.balance > 0.005);

  while (remaining().length > 0 && month < MAX_MONTHS) {
    month++;
    // 1. Accrue monthly interest.
    for (const d of working) {
      if (d.balance <= 0) continue;
      const interest = d.balance * (asRate(d.annualRatePercent) / 12);
      d.balance += interest;
      totalInterest += interest;
    }

    // 2. Budget available this month = full budget minus nothing; we pay
    //    minimums on everything, then dump the leftover on the target.
    let budget = monthlyBudget;

    // Pay minimums first.
    for (const d of working) {
      if (d.balance <= 0) continue;
      const pay = Math.min(d.minPayment, d.balance, budget);
      d.balance -= pay;
      budget -= pay;
      totalPaid += pay;
    }

    // 3. Order the still-open debts by strategy and throw leftover at #1.
    const open = remaining().sort((a, b) =>
      strategy === "snowball"
        ? a.balance - b.balance
        : b.annualRatePercent - a.annualRatePercent
    );
    for (const target of open) {
      if (budget <= 0) break;
      const pay = Math.min(budget, target.balance);
      target.balance -= pay;
      budget -= pay;
      totalPaid += pay;
    }

    // 4. Record payoffs this month.
    for (const d of working) {
      if (d.balance <= 0.005 && d.paidMonth === 0) {
        d.paidMonth = month;
        payoffOrder.push({ name: d.name, payoffMonth: month });
      }
    }
    balanceByMonth.push(round2(working.reduce((s, d) => s + Math.max(d.balance, 0), 0)));
  }

  return {
    strategy,
    months: month,
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    payoffOrder,
    balanceByMonth,
    feasible: true,
  };
}

// ---------------------------------------------------------------------------
// Retirement / FIRE
// ---------------------------------------------------------------------------

export interface RetirementInput {
  currentAge: number;
  retirementAge: number;
  currentSavings: number;
  monthlyContribution: number;
  /** Expected nominal annual return %. */
  annualReturnPercent: number;
  /** Annual spending you'll want in retirement (today's dollars). */
  desiredAnnualIncome: number;
  /** Safe withdrawal rate %, default 4. */
  withdrawalRatePercent?: number;
  /** Inflation % to express the target in future dollars, default 2.5. */
  inflationPercent?: number;
}

export interface RetirementResult {
  /** Projected nest egg at retirement. */
  projectedBalance: number;
  /** Target nest egg = inflation-adjusted income / withdrawal rate. */
  fireNumber: number;
  /** Inflation-adjusted desired income at retirement. */
  targetIncomeAtRetirement: number;
  onTrack: boolean;
  surplusOrShortfall: number;
  /** Estimated sustainable annual income from the projected balance. */
  sustainableAnnualIncome: number;
  schedule: YearPoint[];
}

export function retirement(input: RetirementInput): RetirementResult {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    monthlyContribution,
    annualReturnPercent,
    desiredAnnualIncome,
    withdrawalRatePercent = 4,
    inflationPercent = 2.5,
  } = input;

  const years = Math.max(retirementAge - currentAge, 0);
  const growth = compoundInterest({
    principal: currentSavings,
    annualRatePercent: annualReturnPercent,
    years,
    contribution: monthlyContribution,
    contributionFrequency: "monthly",
  });

  const targetIncomeAtRetirement =
    desiredAnnualIncome * Math.pow(1 + asRate(inflationPercent), years);
  const fireNumber = targetIncomeAtRetirement / asRate(withdrawalRatePercent);
  const sustainableAnnualIncome =
    growth.futureValue * asRate(withdrawalRatePercent);

  return {
    projectedBalance: growth.futureValue,
    fireNumber: round2(fireNumber),
    targetIncomeAtRetirement: round2(targetIncomeAtRetirement),
    onTrack: growth.futureValue >= fireNumber,
    surplusOrShortfall: round2(growth.futureValue - fireNumber),
    sustainableAnnualIncome: round2(sustainableAnnualIncome),
    schedule: growth.schedule,
  };
}

// ---------------------------------------------------------------------------
// Savings goal — required monthly contribution
// ---------------------------------------------------------------------------

export interface SavingsGoalInput {
  goalAmount: number;
  currentSavings: number;
  years: number;
  annualRatePercent: number;
}

export interface SavingsGoalResult {
  requiredMonthly: number;
  totalContributed: number;
  interestEarned: number;
}

/** Monthly deposit needed to hit a goal: solves the annuity FV formula for PMT. */
export function savingsGoal(input: SavingsGoalInput): SavingsGoalResult {
  const { goalAmount, currentSavings, years, annualRatePercent } = input;
  const n = Math.round(years * 12);
  const i = asRate(annualRatePercent) / 12;
  if (n <= 0) {
    const required = Math.max(goalAmount - currentSavings, 0);
    return { requiredMonthly: round2(required), totalContributed: round2(required), interestEarned: 0 };
  }

  const fvOfCurrent = currentSavings * Math.pow(1 + i, n);
  const needFromContributions = goalAmount - fvOfCurrent;

  let requiredMonthly: number;
  if (needFromContributions <= 0) {
    requiredMonthly = 0; // current savings already grows past the goal
  } else if (i === 0) {
    requiredMonthly = needFromContributions / n;
  } else {
    requiredMonthly = (needFromContributions * i) / (Math.pow(1 + i, n) - 1);
  }

  const totalContributed = currentSavings + requiredMonthly * n;
  return {
    requiredMonthly: round2(Math.max(requiredMonthly, 0)),
    totalContributed: round2(totalContributed),
    interestEarned: round2(goalAmount - totalContributed),
  };
}

// ---------------------------------------------------------------------------
// Budget — 50/30/20 rule
// ---------------------------------------------------------------------------

export interface BudgetResult {
  needs: number;
  wants: number;
  savings: number;
}

/** Split monthly take-home pay into needs/wants/savings (50/30/20 default). */
export function budget5030020(
  monthlyTakeHome: number,
  needsPct = 50,
  wantsPct = 30,
  savingsPct = 20
): BudgetResult {
  return {
    needs: round2(monthlyTakeHome * asRate(needsPct)),
    wants: round2(monthlyTakeHome * asRate(wantsPct)),
    savings: round2(monthlyTakeHome * asRate(savingsPct)),
  };
}

// ---------------------------------------------------------------------------
// Coast FIRE
// ---------------------------------------------------------------------------

export interface CoastFireInput {
  currentAge: number;
  retirementAge: number;
  /** Annual spending you want in retirement, in today's dollars. */
  annualSpending: number;
  /** What you already have invested. */
  currentInvested: number;
  /** Real (inflation-adjusted) annual return %, e.g. 5. Keeps everything in today's dollars. */
  realReturnPercent: number;
  /** Optional ongoing monthly contribution to find the "coast age". Default 0. */
  monthlyContribution?: number;
  /** Safe withdrawal rate %, default 4. */
  withdrawalRatePercent?: number;
}

export interface CoastFireResult {
  /** Nest egg target at retirement (today's dollars). */
  fireNumber: number;
  /** Amount you'd need invested TODAY to coast (no more contributions) to FIRE. */
  coastNumberToday: number;
  /** Your current invested balance grown to retirement with no further contributions. */
  projectedNoContrib: number;
  /** True if you've already hit Coast FIRE and could stop contributing today. */
  hasCoasted: boolean;
  /** How much more you'd need invested today to coast (0 if already coasting). */
  shortfallToday: number;
  /** With monthlyContribution, the age you can stop contributing and still coast. Null if never within range. */
  coastAge: number | null;
  /** Yearly series for charting: your balance vs the coast target at each age. */
  schedule: { age: number; balance: number; coastTarget: number }[];
}

/**
 * Coast FIRE: the point where your invested money is enough to grow into your
 * full retirement number on its own, without any further contributions.
 * Works in today's (real) dollars by using a real return rate.
 */
export function coastFire(input: CoastFireInput): CoastFireResult {
  const {
    currentAge,
    retirementAge,
    annualSpending,
    currentInvested,
    realReturnPercent,
    monthlyContribution = 0,
    withdrawalRatePercent = 4,
  } = input;

  const r = asRate(realReturnPercent);
  const yearsToRetire = Math.max(retirementAge - currentAge, 0);
  const fireNumber = annualSpending / asRate(withdrawalRatePercent);
  const grow = (years: number) => Math.pow(1 + r, years);

  const coastNumberToday = fireNumber / grow(yearsToRetire);
  const projectedNoContrib = currentInvested * grow(yearsToRetire);
  const hasCoasted = projectedNoContrib >= fireNumber;

  // Simulate monthly with contributions to find the first age at which the
  // balance, left to coast to retirement, would reach the FIRE number.
  const g = Math.pow(1 + r, 1 / 12);
  let balance = currentInvested;
  let coastAge: number | null = null;
  const totalMonths = Math.round(yearsToRetire * 12);
  for (let m = 0; m <= totalMonths; m++) {
    const age = currentAge + m / 12;
    const remainingYears = retirementAge - age;
    if (balance * grow(remainingYears) >= fireNumber - 0.005) {
      coastAge = Math.round(age * 10) / 10;
      break;
    }
    balance = balance * g + monthlyContribution;
  }

  // Yearly schedule for the chart.
  const schedule: CoastFireResult["schedule"] = [];
  let bal = currentInvested;
  for (let y = 0; y <= yearsToRetire; y++) {
    const age = currentAge + y;
    schedule.push({
      age,
      balance: round2(bal),
      coastTarget: round2(fireNumber / grow(retirementAge - age)),
    });
    // advance one year with monthly contributions
    for (let m = 0; m < 12; m++) bal = bal * g + monthlyContribution;
  }

  return {
    fireNumber: round2(fireNumber),
    coastNumberToday: round2(coastNumberToday),
    projectedNoContrib: round2(projectedNoContrib),
    hasCoasted,
    shortfallToday: round2(Math.max(coastNumberToday - currentInvested, 0)),
    coastAge,
    schedule,
  };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

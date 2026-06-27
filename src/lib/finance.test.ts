import { describe, it, expect } from "vitest";
import {
  compoundInterest,
  monthlyLoanPayment,
  amortize,
  mortgage,
  debtPayoff,
  retirement,
  savingsGoal,
  budget5030020,
  coastFire,
} from "./finance.ts";

const near = (a: number, b: number, tol = 1) => Math.abs(a - b) <= tol;

describe("compoundInterest", () => {
  it("grows a lump sum with annual compounding (textbook case)", () => {
    // $1,000 at 10% compounded annually for 10y = 1000 * 1.1^10 = 2593.74
    const r = compoundInterest({
      principal: 1000,
      annualRatePercent: 10,
      years: 10,
      compoundsPerYear: 1,
    });
    expect(near(r.futureValue, 2593.74, 1)).toBe(true);
    expect(r.totalContributions).toBe(1000);
  });

  it("handles zero interest as pure contributions", () => {
    const r = compoundInterest({
      principal: 0,
      annualRatePercent: 0,
      years: 5,
      contribution: 100,
    });
    expect(r.futureValue).toBe(6000); // 100 * 60 months
    expect(r.totalInterest).toBe(0);
  });

  it("adds monthly contributions (annuity)", () => {
    // $500/mo at 6%/yr (monthly compounding) for 30y ≈ $502,810
    const r = compoundInterest({
      principal: 0,
      annualRatePercent: 6,
      years: 30,
      contribution: 500,
      compoundsPerYear: 12,
    });
    expect(near(r.futureValue, 502810, 2000)).toBe(true);
    expect(r.totalContributions).toBe(180000);
  });

  it("produces one schedule point per year", () => {
    const r = compoundInterest({ principal: 100, annualRatePercent: 5, years: 3 });
    expect(r.schedule).toHaveLength(3);
    expect(r.schedule.at(-1)!.year).toBe(3);
  });
});

describe("monthlyLoanPayment / amortize", () => {
  it("matches the standard mortgage payment formula", () => {
    // $300k, 6%, 30y → ~$1,798.65/mo
    const p = monthlyLoanPayment(300000, 6, 30);
    expect(near(p, 1798.65, 0.5)).toBe(true);
  });

  it("handles 0% loans as straight division", () => {
    expect(monthlyLoanPayment(12000, 0, 1)).toBeCloseTo(1000, 5);
  });

  it("fully amortizes to a zero balance", () => {
    const r = amortize({ principal: 20000, annualRatePercent: 5, termYears: 5 });
    expect(r.schedule.at(-1)!.balance).toBeLessThanOrEqual(0.01);
    expect(r.payoffMonths).toBe(60);
    // total interest is positive and sensible
    expect(r.totalInterest).toBeGreaterThan(2000);
    expect(r.totalInterest).toBeLessThan(3000);
  });

  it("extra payments shorten the term and cut interest", () => {
    const base = amortize({ principal: 300000, annualRatePercent: 6, termYears: 30 });
    const extra = amortize({
      principal: 300000,
      annualRatePercent: 6,
      termYears: 30,
      extraMonthly: 200,
    });
    expect(extra.payoffMonths).toBeLessThan(base.payoffMonths);
    expect(extra.totalInterest).toBeLessThan(base.totalInterest);
  });
});

describe("mortgage (PITI)", () => {
  it("adds taxes, insurance, PMI and HOA to P&I", () => {
    const m = mortgage({
      principal: 300000,
      annualRatePercent: 6,
      termYears: 30,
      propertyTaxAnnual: 3600,
      insuranceAnnual: 1200,
      hoaMonthly: 150,
      pmiAnnual: 1800,
    });
    expect(near(m.principalAndInterest, 1798.65, 0.5)).toBe(true);
    expect(m.monthlyTax).toBe(300);
    expect(m.monthlyInsurance).toBe(100);
    expect(m.monthlyPmi).toBe(150);
    expect(near(m.totalMonthly, 1798.65 + 300 + 100 + 150 + 150, 0.5)).toBe(true);
  });
});

describe("debtPayoff", () => {
  const debts = [
    { name: "Card A", balance: 5000, annualRatePercent: 22, minPayment: 100 },
    { name: "Card B", balance: 2000, annualRatePercent: 12, minPayment: 50 },
    { name: "Loan C", balance: 10000, annualRatePercent: 8, minPayment: 200 },
  ];

  it("avalanche pays no more interest than snowball", () => {
    const av = debtPayoff(debts, 800, "avalanche");
    const sn = debtPayoff(debts, 800, "snowball");
    expect(av.feasible).toBe(true);
    expect(av.totalInterest).toBeLessThanOrEqual(sn.totalInterest + 0.01);
  });

  it("snowball clears the smallest balance first", () => {
    const sn = debtPayoff(debts, 800, "snowball");
    expect(sn.payoffOrder[0].name).toBe("Card B"); // smallest balance
  });

  it("avalanche targets the highest APR first", () => {
    const av = debtPayoff(debts, 800, "avalanche");
    expect(av.payoffOrder[0].name).toBe("Card A"); // highest APR (22%)
  });

  it("flags an infeasible plan when budget < minimums", () => {
    const r = debtPayoff(debts, 100, "avalanche");
    expect(r.feasible).toBe(false);
  });

  it("eventually pays everything off", () => {
    const r = debtPayoff(debts, 800, "avalanche");
    expect(r.balanceByMonth.at(-1)).toBeLessThanOrEqual(0.01);
    expect(r.payoffOrder).toHaveLength(3);
  });
});

describe("retirement", () => {
  it("projects a growing balance and a FIRE number", () => {
    const r = retirement({
      currentAge: 30,
      retirementAge: 65,
      currentSavings: 50000,
      monthlyContribution: 1000,
      annualReturnPercent: 7,
      desiredAnnualIncome: 60000,
      withdrawalRatePercent: 4,
      inflationPercent: 2.5,
    });
    expect(r.projectedBalance).toBeGreaterThan(50000);
    // FIRE number = inflation-adjusted income / 4%
    expect(r.fireNumber).toBeGreaterThan(60000 / 0.04);
    expect(typeof r.onTrack).toBe("boolean");
    expect(r.schedule.length).toBe(35);
  });

  it("a heavy saver is on track", () => {
    const r = retirement({
      currentAge: 25,
      retirementAge: 65,
      currentSavings: 100000,
      monthlyContribution: 3000,
      annualReturnPercent: 8,
      desiredAnnualIncome: 50000,
    });
    expect(r.onTrack).toBe(true);
    expect(r.surplusOrShortfall).toBeGreaterThan(0);
  });
});

describe("savingsGoal", () => {
  it("solves for the monthly deposit needed", () => {
    // Reaching $10k in 2y at 0% = ~$416.67/mo
    const r = savingsGoal({
      goalAmount: 10000,
      currentSavings: 0,
      years: 2,
      annualRatePercent: 0,
    });
    expect(near(r.requiredMonthly, 416.67, 0.5)).toBe(true);
  });

  it("returns 0 when current savings already exceed the goal at maturity", () => {
    const r = savingsGoal({
      goalAmount: 1000,
      currentSavings: 5000,
      years: 5,
      annualRatePercent: 5,
    });
    expect(r.requiredMonthly).toBe(0);
  });

  it("interest reduces the required contribution vs 0%", () => {
    const zero = savingsGoal({ goalAmount: 50000, currentSavings: 0, years: 10, annualRatePercent: 0 });
    const seven = savingsGoal({ goalAmount: 50000, currentSavings: 0, years: 10, annualRatePercent: 7 });
    expect(seven.requiredMonthly).toBeLessThan(zero.requiredMonthly);
  });
});

describe("budget5030020", () => {
  it("splits take-home pay by the rule", () => {
    const b = budget5030020(5000);
    expect(b.needs).toBe(2500);
    expect(b.wants).toBe(1500);
    expect(b.savings).toBe(1000);
  });
});

describe("coastFire", () => {
  it("computes the FIRE number from spending and withdrawal rate", () => {
    const r = coastFire({
      currentAge: 30,
      retirementAge: 60,
      annualSpending: 40000,
      currentInvested: 0,
      realReturnPercent: 5,
      withdrawalRatePercent: 4,
    });
    expect(r.fireNumber).toBe(1000000); // 40k / 0.04
  });

  it("coast number today is the FIRE number discounted by the real return", () => {
    // 1,000,000 / 1.05^30 ≈ 231,377
    const r = coastFire({
      currentAge: 30,
      retirementAge: 60,
      annualSpending: 40000,
      currentInvested: 0,
      realReturnPercent: 5,
    });
    expect(near(r.coastNumberToday, 231377, 50)).toBe(true);
  });

  it("flags someone who has already coasted", () => {
    const r = coastFire({
      currentAge: 30,
      retirementAge: 60,
      annualSpending: 40000,
      currentInvested: 300000, // above the ~231k coast number
      realReturnPercent: 5,
    });
    expect(r.hasCoasted).toBe(true);
    expect(r.shortfallToday).toBe(0);
    expect(r.coastAge).toBe(30); // already there now
    expect(r.projectedNoContrib).toBeGreaterThan(r.fireNumber);
  });

  it("reports a shortfall and a future coast age for someone behind", () => {
    const r = coastFire({
      currentAge: 30,
      retirementAge: 60,
      annualSpending: 40000,
      currentInvested: 50000,
      realReturnPercent: 5,
      monthlyContribution: 1000,
    });
    expect(r.hasCoasted).toBe(false);
    expect(r.shortfallToday).toBeGreaterThan(0);
    expect(r.coastAge).not.toBeNull();
    expect(r.coastAge!).toBeGreaterThan(30);
    expect(r.coastAge!).toBeLessThan(60);
  });

  it("builds a schedule from current age to retirement", () => {
    const r = coastFire({
      currentAge: 40,
      retirementAge: 65,
      annualSpending: 50000,
      currentInvested: 100000,
      realReturnPercent: 5,
    });
    expect(r.schedule[0].age).toBe(40);
    expect(r.schedule.at(-1)!.age).toBe(65);
    // coast target rises toward the FIRE number as you approach retirement
    expect(r.schedule.at(-1)!.coastTarget).toBeCloseTo(r.fireNumber, 0);
  });
});

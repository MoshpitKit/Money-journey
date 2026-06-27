/** Single source of truth for the calculator catalog (nav, homepage, SEO). */

export interface CalcMeta {
  slug: string;
  title: string;
  short: string; // nav label
  blurb: string; // homepage card text
  icon: string; // inline SVG path data (Heroicons-style, 24x24, stroke)
  keywords: string[];
}

export const CALCULATORS: CalcMeta[] = [
  {
    slug: "compound-interest",
    title: "Compound Interest Calculator",
    short: "Compound Interest",
    blurb:
      "See how savings and investments snowball over time with monthly contributions.",
    icon: "M3 17l6-6 4 4 8-8M21 7v6h-6",
    keywords: [
      "compound interest calculator",
      "investment growth calculator",
      "savings growth",
    ],
  },
  {
    slug: "mortgage",
    title: "Mortgage Calculator",
    short: "Mortgage",
    blurb:
      "Estimate your full monthly payment — principal, interest, taxes, insurance and HOA.",
    icon: "M3 12l9-9 9 9M5 10v10h14V10",
    keywords: ["mortgage calculator", "home loan payment", "PITI calculator"],
  },
  {
    slug: "home-affordability",
    title: "Home Affordability Calculator",
    short: "Home Affordability",
    blurb:
      "Find the most expensive home you can afford on your income using the 28/36 rule.",
    icon: "M3 12l9-9 9 9M5 10v10h14V10M9 21v-6h6v6",
    keywords: [
      "how much house can i afford",
      "home affordability calculator",
      "house affordability calculator",
    ],
  },
  {
    slug: "debt-payoff",
    title: "Debt Payoff Calculator",
    short: "Debt Payoff",
    blurb:
      "Compare the snowball vs avalanche methods and find your debt-free date.",
    icon: "M20 12a8 8 0 11-8-8m8 8h-5m5 0V7",
    keywords: [
      "debt payoff calculator",
      "debt snowball calculator",
      "debt avalanche calculator",
    ],
  },
  {
    slug: "retirement",
    title: "Retirement & FIRE Calculator",
    short: "Retirement",
    blurb:
      "Project your nest egg, find your FIRE number, and see if you're on track.",
    icon: "M12 3v18m0 0c-4 0-7-2-7-5m7 5c4 0 7-2 7-5M5 8a7 7 0 0114 0",
    keywords: ["retirement calculator", "FIRE calculator", "401k calculator"],
  },
  {
    slug: "coast-fire",
    title: "Coast FIRE Calculator",
    short: "Coast FIRE",
    blurb:
      "Find out if you've saved enough to stop contributing and still retire on time.",
    icon: "M5 19l7-14 7 14M5 19l7-4 7 4",
    keywords: [
      "coast fire calculator",
      "coast fi calculator",
      "barista fire calculator",
    ],
  },
  {
    slug: "savings-goal",
    title: "Savings Goal Calculator",
    short: "Savings Goal",
    blurb:
      "Find out exactly how much to set aside each month to hit any goal on time.",
    icon: "M12 8v8m-4-4h8M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    keywords: ["savings goal calculator", "how much to save", "savings planner"],
  },
  {
    slug: "budget",
    title: "50/30/20 Budget Calculator",
    short: "Budget",
    blurb:
      "Split your take-home pay into needs, wants and savings in one click.",
    icon: "M11 3.05A9 9 0 1020.95 13H11V3.05zM13 3v8h8a8 8 0 00-8-8z",
    keywords: ["budget calculator", "50 30 20 rule", "monthly budget"],
  },
];

export function calcBySlug(slug: string): CalcMeta | undefined {
  return CALCULATORS.find((c) => c.slug === slug);
}

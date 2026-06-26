/**
 * affiliates.ts — Your money-makers.
 *
 * Each offer renders as an "AffiliateCard" inside the most relevant
 * calculator (e.g. a high-yield savings offer appears under the compound
 * interest + savings-goal results, where intent is highest).
 *
 * 👉 HOW TO EARN:
 *   1. Sign up for the affiliate programs below (all free; links in README).
 *   2. Replace each `url: "#"` with YOUR referral link.
 *   3. Set `live: true` on the offer. That's it — it goes live on next build.
 *
 * Offers with `live: false` (or url "#") are hidden from visitors, so the
 * site never shows a dead/placeholder link. No slop ships.
 */

export interface Offer {
  id: string;
  /** Where this offer should appear. */
  placements: Placement[];
  headline: string;
  body: string;
  /** Button text. */
  cta: string;
  /** Your referral/affiliate URL. */
  url: string;
  /** A short, honest highlight, e.g. "4.40% APY". */
  badge?: string;
  /** Flip to true once you've added your real link. */
  live: boolean;
}

export type Placement =
  | "compound-interest"
  | "savings-goal"
  | "retirement"
  | "mortgage"
  | "debt-payoff"
  | "loan"
  | "budget";

/**
 * Curated, evergreen finance offer types. The copy is honest and generic;
 * fill in the specific partner + rate when you apply. Nothing here makes a
 * claim until YOU set the real numbers.
 */
export const OFFERS: Offer[] = [
  {
    id: "high-yield-savings",
    placements: ["compound-interest", "savings-goal", "budget"],
    headline: "Put your savings in a high-yield account",
    body: "Most big-bank savings accounts pay almost nothing. A top high-yield savings account can pay many times more on the exact same balance — with no fees and full FDIC insurance.",
    cta: "Compare high-yield savings",
    url: "#",
    badge: "High APY",
    live: false,
  },
  {
    id: "brokerage-invest",
    placements: ["compound-interest", "retirement"],
    headline: "Start investing for the long term",
    body: "Index funds inside a low-cost brokerage or IRA are how most people actually hit numbers like the ones above. Many brokers charge $0 commissions and have no minimums.",
    cta: "Open an investing account",
    url: "#",
    badge: "$0 commissions",
    live: false,
  },
  {
    id: "debt-consolidation",
    placements: ["debt-payoff", "loan"],
    headline: "Could a lower rate speed this up?",
    body: "If your cards are above ~15% APR, a balance-transfer card or a fixed-rate consolidation loan can cut the interest you pay — sometimes to 0% for an intro period.",
    cta: "Check consolidation options",
    url: "#",
    badge: "Lower your APR",
    live: false,
  },
  {
    id: "mortgage-refi",
    placements: ["mortgage"],
    headline: "See today's mortgage & refi rates",
    body: "Even a small rate difference changes your payment and lifetime interest a lot. Comparing a few lenders takes minutes and is the single highest-value thing most buyers skip.",
    cta: "Compare mortgage rates",
    url: "#",
    badge: "Compare lenders",
    live: false,
  },
  {
    id: "budgeting-app",
    placements: ["budget"],
    headline: "Automate your budget",
    body: "A good budgeting app connects your accounts and tracks the 50/30/20 split for you, so you don't have to do it by hand each month.",
    cta: "Try a budgeting app",
    url: "#",
    badge: "Set & forget",
    live: false,
  },
];

/** Offers that are configured AND requested for a given calculator page. */
export function offersFor(placement: Placement): Offer[] {
  return OFFERS.filter(
    (o) => o.live && o.url !== "#" && o.placements.includes(placement)
  );
}

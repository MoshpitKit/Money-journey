/**
 * Central site configuration.
 *
 * ⚙️  THE ONLY FILE YOU NORMALLY NEED TO EDIT.
 *  1. Set `url` to your real domain once you have one.
 *  2. Paste your ad / analytics IDs.
 *  3. Fill in your real affiliate links in `src/lib/affiliates.ts`.
 */

export const SITE = {
  name: "Money Journey",
  /** Production URL. Change to your real domain (no trailing slash). */
  url: "https://moneyjourney.pages.dev",
  tagline: "Free, accurate money calculators — no fluff, no sign-up.",
  description:
    "Free personal-finance calculators for compound interest, mortgages, debt payoff, retirement, and more. Accurate math, instant results, clear explanations.",
  author: "Money Journey",
  locale: "en_US",
  /** Used in JSON-LD + footer. */
  email: "hello@moneyjourney.pages.dev",
};

/**
 * Monetization switches.
 * Everything is OFF by default so the site is clean until YOU plug in
 * real accounts. Nothing fake ships to visitors.
 */
export const MONETIZATION = {
  /** Google AdSense publisher id, e.g. "ca-pub-1234567890123456". Leave "" to hide ads. */
  adsensePublisherId: "",
  /** Show affiliate cards (uses links from src/lib/affiliates.ts). */
  affiliatesEnabled: true,
  /** Plausible analytics domain (privacy-friendly, no cookie banner). Leave "" to disable. */
  plausibleDomain: "",
  /** Google Analytics 4 id, e.g. "G-XXXXXXX". Leave "" to disable. */
  ga4Id: "",
};

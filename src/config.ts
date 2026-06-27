/**
 * Central site configuration.
 *
 * ⚙️  THE ONLY FILE YOU NORMALLY NEED TO EDIT.
 *  1. Set `url` to your real domain once you have one.
 *  2. Paste your ad / analytics IDs.
 *  3. Fill in your real affiliate links in `src/lib/affiliates.ts`.
 */

export const SITE = {
  name: "PennyGrove",
  /**
   * Production URL (no trailing slash). Set to your custom domain.
   * If you're running only on the free Cloudflare *.pages.dev URL for now,
   * change this to that URL instead so canonicals/sitemap match what's live.
   */
  url: "https://pennygrove.com",
  tagline: "Grow your money with confidence.",
  description:
    "Free, accurate money calculators and clear guides to help you grow your savings, crush debt, and plan for the future. No sign-up, no jargon.",
  author: "PennyGrove",
  locale: "en_US",
  /** Used in JSON-LD + footer. */
  email: "hello@pennygrove.com",
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

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
   * Production origin (no trailing slash). Defaults to the custom domain, but
   * can be overridden at build time via the PUBLIC_SITE_URL env var (e.g. the
   * GitHub Pages deploy sets it to https://moshpitkit.github.io).
   */
  url: process.env.PUBLIC_SITE_URL ?? "https://pennygrove.com",
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

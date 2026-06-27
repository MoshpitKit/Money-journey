// @ts-check
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";
import { SITE } from "./src/config.ts";

// When deploying to a subpath (e.g. GitHub Pages project site), set
// PAGES_BASE="/money-journey". Left unset for root deploys (custom domain / Cloudflare).
const base = process.env.PAGES_BASE || undefined;

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  base,
  integrations: [
    preact({ compat: true }),
    sitemap({
      // Embed widgets and the private hub are noindex — keep them out of the sitemap.
      filter: (page) => !page.includes("/embed/") && !page.includes("/hub"),
      // Stamp every entry with a build-time lastmod so crawlers see freshness.
      serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }),
    }),
  ],
  vite: {
    // Cast avoids a cosmetic type clash between Astro's bundled Vite and the
    // top-level Vite types; the plugin works correctly at build time.
    plugins: [/** @type {any} */ (tailwind())],
  },
  build: {
    inlineStylesheets: "auto",
  },
});

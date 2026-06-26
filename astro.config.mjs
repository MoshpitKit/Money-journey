// @ts-check
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";
import sitemap from "@astrojs/sitemap";
import tailwind from "@tailwindcss/vite";
import { SITE } from "./src/config.ts";

// https://astro.build/config
export default defineConfig({
  site: SITE.url,
  integrations: [preact({ compat: true }), sitemap()],
  vite: {
    // Cast avoids a cosmetic type clash between Astro's bundled Vite and the
    // top-level Vite types; the plugin works correctly at build time.
    plugins: [/** @type {any} */ (tailwind())],
  },
  build: {
    inlineStylesheets: "auto",
  },
});

/**
 * Post-build base-path rewriter for subpath deploys (e.g. GitHub Pages).
 *
 * Astro's `base` already prefixes its own asset URLs and the sitemap, but it
 * does NOT touch hardcoded content links (nav, markdown links, favicon) or the
 * absolute canonical/OG/JSON-LD URLs we build from SITE.url. This script
 * rewrites those in the built HTML so every link resolves under the subpath.
 *
 * No-ops unless PAGES_BASE is set, so root deploys are unaffected.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const BASE = (process.env.PAGES_BASE || "").replace(/\/$/, "");
const ORIGIN = (process.env.PUBLIC_SITE_URL || "").replace(/\/$/, "");

if (!BASE) {
  console.log("rewrite-base: PAGES_BASE not set — skipping.");
  process.exit(0);
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const htmlFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (entry.endsWith(".html")) htmlFiles.push(p);
  }
})("dist");

let linkCount = 0;
for (const file of htmlFiles) {
  let html = readFileSync(file, "utf8");

  // 1) Root-relative href/src -> prefix base. Skip protocol-relative (//) and
  //    anything already under the base (e.g. Astro's /money-journey/_astro/...).
  html = html.replace(
    new RegExp(`(href|src)="/(?!/|${esc(BASE.slice(1))}/)([^"]*)"`, "g"),
    (_m, attr, rest) => {
      linkCount++;
      return `${attr}="${BASE}/${rest}"`;
    }
  );

  // 2) Absolute origin URLs (canonical, og:*, JSON-LD, embed snippets) ->
  //    insert the base right after the origin, unless it's already there.
  if (ORIGIN) {
    // origin followed by a path
    html = html.replace(
      new RegExp(`${esc(ORIGIN)}/(?!${esc(BASE.slice(1))}/)`, "g"),
      `${ORIGIN}${BASE}/`
    );
    // bare origin (e.g. https://origin" with no path)
    html = html.replace(new RegExp(`${esc(ORIGIN)}(?=["'\\s])`, "g"), `${ORIGIN}${BASE}`);
    // fix any accidental double base from the two passes
    html = html.replaceAll(`${BASE}${BASE}/`, `${BASE}/`);
  }

  writeFileSync(file, html);
}

console.log(`rewrite-base: prefixed ${linkCount} links across ${htmlFiles.length} HTML files with "${BASE}".`);

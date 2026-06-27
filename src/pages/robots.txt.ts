import type { APIRoute } from "astro";
import { SITE } from "../config.ts";

export const GET: APIRoute = () => {
  // BASE_URL is "/" for root deploys or "/money-journey/" for subpath deploys.
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const sitemap = `${SITE.url.replace(/\/$/, "")}${base}/sitemap-index.xml`;
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};

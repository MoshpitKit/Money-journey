import type { APIRoute } from "astro";
import { MONETIZATION } from "../config.ts";

// ads.txt authorizes Google to monetize your inventory. It only outputs a real
// line once you've set your AdSense publisher id in src/config.ts.
// NOTE: ad networks look for ads.txt at the DOMAIN ROOT. On a github.io project
// subpath this lives at /money-journey/ads.txt; a custom domain fixes that.
export const GET: APIRoute = () => {
  const pub = MONETIZATION.adsensePublisherId.replace(/^ca-/, "");
  const body = pub
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : "# Add your AdSense publisher id in src/config.ts to populate ads.txt\n";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};

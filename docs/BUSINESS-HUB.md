# PennyGrove — Business Hub & Money Playbook

Your live, interactive hub is at **`/hub`** on the site:
**https://moshpitkit.github.io/money-journey/hub**
(hidden from search; tracker data saves in your browser). This doc is the deep reference behind it.

---

## 1. The money model in one paragraph

People search Google for money questions → land on your calculators/guides → click **ads** (Google pays you per impression/click) or **affiliate offers** (a partner pays you when someone signs up). You never invoice anyone: each platform credits your account and **auto-pays your bank/PayPal** once you pass its minimum. Your recurring job is ~20 min/month: log earnings, improve a page or two, occasionally publish content.

**Realistic timeline:** months 1–3 = indexing, near-zero revenue; months 4–6 = first trickle; months 9–12 = the ramp. ~$2k/mo corresponds to roughly **40–60k visitors/month**. This is earned, not instant.

---

## 2. Get found first (do this week — it's free)

1. **Google Search Console** → https://search.google.com/search-console
   - Add property → URL prefix → `https://moshpitkit.github.io/money-journey/`
   - Verify (HTML tag method is easiest — tell me the tag and I'll add it to the site head).
   - Submit your sitemap: `https://moshpitkit.github.io/money-journey/sitemap-index.xml`
2. **Bing Webmaster Tools** → https://www.bing.com/webmasters (import from GSC in one click).
3. Request indexing for your top ~10 pages to speed up the first crawl.

---

## 3. Turn on ads (AdSense)

### Application
1. Go to https://adsense.google.com → sign up with your Google account.
2. Site URL: `https://moshpitkit.github.io/money-journey/`
3. Country, and accept terms. Add the AdSense verification snippet — **send it to me and I'll wire it into the site** (or paste your publisher id into `src/config.ts` → `adsensePublisherId`).
4. Submit for review. Approval typically takes a few days to ~2 weeks. You qualify because you have real tools + 26 articles + privacy/disclosure/terms pages (AdSense requires all of these — already built).

### Once approved
- Put your publisher id (`ca-pub-XXXXXXXXXXXXXXXX`) in `src/config.ts`. Ad slots are already placed on every calculator and guide; they light up automatically.
- The site auto-serves `ads.txt` from your publisher id (note: ad networks read ads.txt at the **domain root** — on the github.io subpath it's at `/money-journey/ads.txt`; a custom domain makes this fully standard).

### Upgrade path (the big lever)
- **Ezoic** (https://www.ezoic.com) — apply early, no traffic minimum, usually higher RPM than raw AdSense.
- **Mediavine/Raptive** (https://www.mediavine.com) — apply at ~50k sessions/mo. Finance RPMs here run **2–4× AdSense**; this single switch is what gets a 40–60k-visitor site to ~$2k/mo.

---

## 4. Turn on affiliates (highest $/visitor)

Apply to any of these (free). When approved, paste your referral link into `src/lib/affiliates.ts` and set `live: true` — or send me the links and I'll wire them in.

| Network | Link | Good for |
|---|---|---|
| Impact | https://impact.com | Brokerages, fintech, banking |
| CJ Affiliate | https://www.cj.com | Large finance advertiser network |
| ShareASale | https://www.shareasale.com | Budgeting apps, tools |
| FlexOffers | https://www.flexoffers.com | Credit cards, loans, savings |

The offer slots are already placed where intent is highest (savings offers under the compound-interest & savings-goal results, debt offers under the debt calculator, etc.). Nothing shows to visitors until you set a real link + `live: true`, so no dead links ever ship.

---

## 5. 💸 How you actually get paid

| Source | How it pays | When | Minimum | One-time setup |
|---|---|---|---|---|
| **Google AdSense** | Bank transfer (EFT) / wire | Monthly, ~21st, for prior month | **$100** | Verify address via mailed PIN, add bank + tax info |
| **Affiliate networks** | PayPal / bank / check | net-30 to net-60 | ~$25–$100 | Add payout method + tax form (W-9 US / W-8 non-US) |
| **Ezoic / Mediavine** | PayPal / bank / wire | ~net-30 | Low (~$20) | Payout method + tax info on dashboard |

You set the bank/PayPal once in each platform; after that, money lands automatically every cycle. No invoicing.

---

## 6. Maintenance — your ~20-min monthly routine

1. **Search Console**: note clicks/impressions; find pages ranking #5–20 and improve them (highest ROI activity).
2. **AdSense + affiliate dashboards**: log last month's earnings in the `/hub` tracker.
3. **Confirm latest deploy is green**: https://github.com/MoshpitKit/Money-journey/actions
4. Optional: publish 1–2 new guides (ask me — the content team writes them).
5. Apply to Ezoic at ~10k sessions/mo; Mediavine at ~50k.

---

## 7. Operational notes

- **Deploys:** every push to the default branch auto-builds, tests, and deploys via `.github/workflows/pages.yml`. GitHub Pages only deploys from the **default branch** — currently `claude/affectionate-davinci-1x4tx7`. Setting `main` as default (Settings → Branches) makes `main` the deploy branch; tell me if you do and I'll align the workflow.
- **Custom domain (`pennygrove.com`):** buy it (~$10/yr), add it under Settings → Pages → Custom domain, and I'll flip the site config (one line) so canonicals/sitemap/links use the apex — which also makes `ads.txt` and `robots.txt` fully standard.
- **Everything is free to run.** Hosting (GitHub Pages) = $0. Only real cost is an optional domain.

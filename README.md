# 🌱 PennyGrove

*Grow your money with confidence.*

A production-ready **personal-finance calculator website** built to earn passive
income through display ads and high-intent affiliate offers — with near-zero
running costs and near-zero maintenance.

- ⚡️ **Stack:** [Astro](https://astro.build) (static) + Preact islands + Tailwind v4
- 💸 **Hosting cost:** **$0** (Cloudflare Pages free tier — no server, no database)
- 🧮 **7 calculators**, all on transparent, **unit-tested** financial math
- 📈 **SEO-ready:** sitemap, JSON-LD (WebApp + FAQ + Breadcrumb), OG tags, fast static pages
- 🤝 **Monetization built in:** affiliate slots inside results + ad slots, all **off until you add real accounts**

> **Honest expectations (read this).** No website is a guaranteed money printer.
> This is a real, legitimate asset with a proven model, but income depends on
> **traffic**, which takes months of compounding SEO to build. See
> [§ The realistic path to $2,000/month](#-the-realistic-path-to-2000month).

---

## 🚀 Quick start (local)

```bash
npm install
npm run dev        # http://localhost:4321
npm test           # run the financial-math test suite
npm run build      # produce the static site in dist/
```

---

## 🟢 Go live in ~30 minutes (one-time setup)

Everything below is a **one-time** task. After this, the site runs itself.

### 1. Push this repo to GitHub
Already done if you're reading this on GitHub. Otherwise create a repo and push.

### 2. Deploy free on Cloudflare Pages (recommended — fully automatic)
1. Create a free account at <https://pages.cloudflare.com>.
2. **Create a project → Connect to Git →** pick this repo.
3. Build settings (Cloudflare usually auto-detects Astro):
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Click **Save and Deploy**. Done.

From now on, **every `git push` auto-builds and deploys** — no further action.
You'll get a free `*.pages.dev` URL immediately.

> Prefer Netlify or Vercel? They work identically — same build command and output
> dir. A GitHub Actions deploy workflow is also included at
> `.github/workflows/deploy.yml` if you'd rather deploy from CI.

### 3. Point your domain
Buy a domain (~$10/yr — the only real cost) and add it in the Cloudflare Pages
project under **Custom domains**. Then update **one line** in
[`src/config.ts`](src/config.ts):

```ts
url: "https://yourdomain.com",
```

Also update the `Sitemap:` line in [`public/robots.txt`](public/robots.txt).

---

## 💵 Turn on the money (one-time, do these as approvals come in)

All monetization ships **disabled** so visitors never see fake or dead links.
You flip each one on as you get approved.

### A. Affiliate offers — your highest earner
Finance affiliates pay the most ($50–$200+ per funded account). The slots are
already placed inside the most relevant calculators (e.g. a savings offer under
the compound-interest and savings-goal results — where buyer intent is highest).

1. Apply to affiliate programs (all free). Good starting points:
   - **High-yield savings / brokerage:** SoFi, Wealthfront, Public, M1, or via
     networks like **Impact**, **CJ**, **FlexOffers**, **Commission Junction**.
   - **Credit cards / debt:** Credible, Bankrate's card network, or card issuer programs.
   - **Mortgage / refi:** LendingTree, Credible, Rocket.
   - **Budgeting apps:** YNAB, Rocket Money, Monarch.
2. Open [`src/lib/affiliates.ts`](src/lib/affiliates.ts).
3. For each offer: paste your real referral link into `url`, tweak the `badge`
   (e.g. `"4.40% APY"`), and set **`live: true`**.
4. `git push`. It's live on the next auto-build.

### B. Display ads
1. **Start:** Apply to **Google AdSense** (<https://adsense.com>). Needs a live
   site with real content — you already have 7 tools + 17 guides + legal pages,
   which is what they look for.
2. When approved, put your publisher id in [`src/config.ts`](src/config.ts):
   ```ts
   adsensePublisherId: "ca-pub-XXXXXXXXXXXXXXXX",
   ```
   (Add per-unit slot ids to `<AdSlot slot="..." />` where you want units.)
3. **Upgrade later:** once you hit ~10k sessions/mo, apply to **[Ezoic](https://ezoic.com)**
   or **[Raptive/Mediavine](https://mediavine.com)** (50k/mo). Finance RPMs on
   these are **$15–$40** — far above AdSense. This single switch can 3–5× ad income.

### C. Analytics (so you know what's working)
Free and privacy-friendly: set `plausibleDomain` (or `ga4Id`) in `src/config.ts`.
Plausible needs no cookie banner.

---

## 📊 The realistic path to $2,000/month

Be clear-eyed. Revenue ≈ **traffic × earnings-per-visitor**. Two honest scenarios
once content has matured (finance pages earn well — roughly **$25–$60 per 1,000
visitors** combining mid-tier ads + affiliate conversions):

| Monthly visitors | Est. monthly revenue |
|-----------------:|---------------------:|
| 10,000           | ~$250–$600           |
| 30,000           | ~$750–$1,800         |
| **50,000+**      | **~$1,500–$3,500+**  |

So **$2k/month ≈ 40k–60k visitors/month**. That is very achievable for a finance
calculator site, but **it is earned over 6–18 months** as Google trusts and ranks
the pages. The calculators here target keywords with large, evergreen search
volume ("compound interest calculator" alone gets hundreds of thousands of
searches/month).

**What actually moves the needle (in order):**
1. **More indexed pages targeting real searches** → see growth plan below.
2. **A few quality backlinks** (the hard part — see below).
3. **Upgrading the ad network** once traffic qualifies (the easy 3–5× lever).

### The growth plan (the only ongoing work)
> 📋 **A full, prioritized 6–12 month SEO & content roadmap lives in
> [`docs/seo-strategy.md`](docs/seo-strategy.md)** — keyword targets, a 90-day
> week-by-week action plan, on-page optimizations, E-E-A-T checklist, and a
> white-hat link-building plan. Start there.

Adding content is how traffic compounds. Each is low-effort and optional:
- **Add a guide:** drop a `.md` file in `src/content/guides/` (copy an existing
  one's front-matter). ~30 min each. Aim for 1–2/month.
- **Add a calculator:** add an entry to `src/lib/catalog.ts`, a function +
  tests in `src/lib/finance.ts`, a Preact island, and a page. Half a day, but
  each one is a permanent traffic asset.
- **Get a few backlinks:** answer relevant questions on Reddit/forums and link a
  calculator when genuinely helpful; submit to tool directories. This is the
  single biggest accelerator and the only part that needs a human.

---

## 🔧 Maintenance — what's actually required

**Almost nothing.** This is a static site: no server to patch, no database, no
runtime to crash.

| Task | Frequency | Effort |
|------|-----------|--------|
| Nothing — site just runs | — | 0 |
| `npm update` + `npm test` (CI verifies) | every few months | 5 min |
| Add a guide / calculator (growth, optional) | when you feel like it | 30 min–½ day |
| Check analytics & affiliate dashboards | monthly | 10 min |
| Upgrade ad network when traffic qualifies | once | 1 hr |

CI (`.github/workflows/ci.yml`) runs the tests, type-check, and build on every
push, so a broken change can't reach production.

---

## 🗂 Project structure

```
src/
  config.ts                  ← site URL + monetization switches (edit me)
  lib/
    finance.ts               ← all financial math (pure, tested)
    finance.test.ts          ← 20 unit tests pinning the math to known results
    affiliates.ts            ← your offers (paste links, set live:true)
    catalog.ts               ← calculator registry (nav/home/sitemap stay in sync)
    format.ts                ← money/number formatting
  components/
    calculators/*.tsx        ← interactive Preact islands + shared UI/charts
    *.astro                  ← layout, header, footer, SEO, ad & affiliate slots
  pages/
    index.astro              ← homepage
    calculators/*.astro      ← one page per tool (unique SEO content + FAQ schema)
    guides/                  ← markdown-driven blog
    about / privacy / disclosure / terms / 404
  content/guides/*.md        ← guide articles
public/                      ← favicon, OG image, robots.txt, _headers
```

## ⚠️ Disclaimer
The calculators and content are for **educational purposes only** and are not
financial advice. The site includes the required advertiser disclosure, privacy
policy, and terms pages for ad-network and FTC compliance.

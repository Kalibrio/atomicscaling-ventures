# Atomic Scaling Ventures — ventures.atomicscaling.com

Single-page venture site, served as static files from GitHub Pages (`docs/` on `main`),
same pattern as `atomic-scaling-os` (os.atomicscaling.com).

## Editing content

All portfolio entries, team bios, stats and criteria live in **`content.json`** — no HTML
knowledge needed. After editing:

```bash
node build.mjs
```

This regenerates `docs/index.html` from `template.html`. Values that start with `TODO`
are **omitted from the page** and listed in the build output, so unverified data can never
ship. Commit `content.json` + `docs/` together.

Design changes go in `template.html` (design tokens match atomicscaling.com's Base.astro).

## Forms

Both forms POST to `https://www.atomicscaling.com/api/subscribe` (plain HTML POST — no
CORS involved) with `source=ventures-pitch` / `source=ventures-partner`. Submissions:

- notify Ludovic by SES email + ntfy (extra fields included),
- persist to Postgres (if configured) and subscribe the email to Kit,
- redirect the visitor to atomicscaling.com/thank-you.

Spam protection: `website_url` honeypot (same convention as the main site).

## Deploy

1. Push this repo to GitHub as **public** repo `Kalibrio/atomicscaling-ventures`.
2. GitHub → repo Settings → Pages → Source: **Deploy from a branch**, branch `main`,
   folder **/docs**. The `docs/CNAME` file sets the custom domain automatically.
3. Cloudflare (lbodin@gmail.com account, atomicscaling.com zone) → DNS → add record:
   `CNAME  ventures  kalibrio.github.io` — **DNS only (grey cloud)**, like `os` and
   `fundraising`.
4. Back in GitHub Pages settings, wait for the DNS check, then tick **Enforce HTTPS**
   (certificate provisioning takes a few minutes).
5. Verify: `https://ventures.atomicscaling.com` loads, both forms submit and land on
   the thank-you page, `robots.txt` and `sitemap.xml` resolve.

## Compliance notes (read before editing copy)

- Never present Atomic Scaling Ventures as an AWS Partner or AWS Activate Provider, and
  never promise AWS credits, until formally approved. No AWS Organization ID on the site.
- Every company, metric and investor relationship on the page is sourced from Ludovic's
  own published materials (atomicscaling.com, newsletter, bio docs). Do not add names or
  numbers without a source. Sequoia/Kleiner Perkins/a16z appear only as **book endorsers**
  except where a specific follow-on round is verified (Sequoia → Lila Games,
  East Ventures → Fraction).
- Investor/company logos may be added only with confirmed permission — text names until then.
- Analytics are placeholder-only (commented out in `template.html`); enabling them is a
  deliberate decision.

## Outstanding TODOs before/at launch

Run `node build.mjs` to see the current list (investment years, WeStyle location, legal
entity name + registration + registered address).

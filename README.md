# thetenderventure.com

Link-in-bio hub for **The Tender Venture / Charging Forward**. Plain static HTML + CSS, no build step, no JS.

- `index.html` — page (OG/Twitter tags, accessible, mobile-first)
- `styles.css` — dark theme
- `assets/` — avatar and banner
- `scripts/smoke-test.mjs` — checks every link/asset returns 2xx/3xx, mailto is valid, required copy is present and banned claims (pricing, splits, earnings, franchise, FSD) are absent

## Run locally
```
npx serve .            # or: python3 -m http.server 3000
node scripts/smoke-test.mjs http://localhost:3000
```
## Test a deployment
```
node scripts/smoke-test.mjs https://<deployment-url>
```
Rumble sits behind a bot challenge and returns 403 to scripts; it is reported as WARN and should be checked in a browser.

## Deploy
Vercel project, framework "Other", no build command, output = repo root. Pushes to `main` deploy to production.

#!/usr/bin/env node
// Usage: node scripts/smoke-test.mjs [baseUrl]   (default: serves ./ locally is not needed; pass a URL)
// Checks: page 200, every <a href>/<img src>/<link href>/og:image resolves 2xx/3xx, mailto well-formed,
// required content present, banned terms absent.
const base = process.argv[2] || 'http://localhost:3000';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
// Hosts behind bot challenges that 403 any non-browser client; verified manually, reported as WARN.
const BOT_WALLED = ['rumble.com'];
let fail = 0, warn = 0;
const log = (s, m) => { console.log(`${s.padEnd(4)} ${m}`); if (s === 'FAIL') fail++; if (s === 'WARN') warn++; };
const res = await fetch(base, { headers: { 'user-agent': UA } });
log(res.ok ? 'OK' : 'FAIL', `${res.status} ${base}`);
const html = await res.text();
for (const t of ['The Tender Venture', 'Together we charge forward', 'Join the iFleetUSA network', 'og:image', 'og:title'])
  log(html.includes(t) ? 'OK' : 'FAIL', `content: ${t}`);
for (const t of [/franchise/i, /\bFSD\b/i, /full self[- ]driving/i, /\$\d/, /\bbook now\b/i, /\d+%/, /earn(ings)?\b/i])
  log(t.test(html) ? 'FAIL' : 'OK', `banned absent: ${t}`);
const urls = new Set();
for (const m of html.matchAll(/(?:href|src|content)="([^"]+)"/g)) {
  const v = m[1].replaceAll('&amp;', '&');
  if (/^(https?:|\/|mailto:)/.test(v)) urls.add(v);
}
for (const u of urls) {
  if (u.startsWith('mailto:')) { log(/^mailto:[^@\s]+@[^@\s]+\.[a-z]+$/i.test(u) ? 'OK' : 'FAIL', `mailto ${u}`); continue; }
  const abs = new URL(u, base).href;
  try {
    const r = await fetch(abs, { redirect: 'manual', headers: { 'user-agent': UA } });
    const host = new URL(abs).hostname.replace(/^www\./, '');
    if (r.status >= 200 && r.status < 400) log('OK', `${r.status} ${abs}`);
    else if (r.status === 403 && BOT_WALLED.includes(host)) log('WARN', `${r.status} ${abs} (bot challenge; check in a browser)`);
    else log('FAIL', `${r.status} ${abs}`);
  } catch (e) { log('FAIL', `ERR ${abs} ${e.message}`); }
}
if (/utm_source=thetenderventure&utm_medium=hub/.test(html.replaceAll('&amp;', '&'))) log('OK', 'ifleetusa UTM params present'); else log('FAIL', 'ifleetusa UTM params missing');
console.log(`\n${fail} failed, ${warn} warnings, ${urls.size} links/assets checked`);
process.exit(fail ? 1 : 0);

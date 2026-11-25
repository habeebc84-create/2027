// BUILD 97 checks: sitemap lists the public pages, track-order inputs have
// real <label> links, product search has an accessible name, rate-limit map
// prunes expired entries.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { rateLimited } from '../api/_lib/server.js';

const sm = fs.readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
for (const p of ['/', '/products', '/services', '/gallery', '/contact', '/terms']) {
  assert.ok(sm.includes(`<loc>https://hsncementandsteel-sigma.vercel.app${p}</loc>`), 'sitemap missing ' + p);
}
assert.ok(!sm.includes('manage-portal'), 'admin path must never be in the sitemap');

const track = fs.readFileSync(new URL('../src/pages/OrderTracking.js', import.meta.url), 'utf8');
for (const id of ['track-order-id', 'track-mobile']) {
  assert.ok(track.includes(`htmlFor: "${id}"`) && track.includes(`id: "${id}"`), 'label/input not linked: ' + id);
}
const products = fs.readFileSync(new URL('../src/pages/Products.js', import.meta.url), 'utf8');
assert.ok(products.includes('"aria-label": "Search products and brands"'));

const app = fs.readFileSync(new URL('../src/App.js', import.meta.url), 'utf8');
assert.ok(app.includes("link[rel=\"canonical\"]") && app.includes('document.title'), 'per-page title/canonical missing');

// Rate limiter still limits, and survives many distinct IPs.
const req = (ip) => ({ headers: { 'x-forwarded-for': ip } });
for (let i = 0; i < 3; i++) assert.equal(rateLimited(req('1.1.1.1'), 't97', 3, 60_000), false);
assert.equal(rateLimited(req('1.1.1.1'), 't97', 3, 60_000), true);
for (let i = 0; i < 6000; i++) rateLimited(req('10.0.' + Math.floor(i / 250) + '.' + (i % 250)), 'bulk', 5, -1);
assert.equal(rateLimited(req('1.1.1.1'), 't97', 3, 60_000), true, 'live bucket must survive pruning');
console.log('SEO / a11y / rate-limit checks passed.');

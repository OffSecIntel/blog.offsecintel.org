/**
 * OG / social preview image generator.
 *
 * One-off tool — NOT part of `npm run build`. Run it only when the brand mark,
 * wordmark, tagline, or layout changes:
 *
 *     node scripts/generate-og-images.mjs
 *
 * Inputs:
 *   - src/assets/logo/drawing_NoText.svg   (the shield path is read from here)
 *   - scripts/fonts/SpaceGrotesk_*.ttf     (vendored, SIL OFL — see scripts/fonts/OFL.txt)
 * Outputs (committed to the repo, copied verbatim to dist/assets/og/ by vite.config.ts):
 *   - src/assets/og/offsecintel-og-default.png   1200x630   (og:image / twitter:image)
 *   - src/assets/og/offsecintel-og-square.png    1200x1200  (square crops; not yet referenced)
 *
 * src/assets/og/ holds only served output — generator tooling lives under scripts/.
 *
 * Rendering is deterministic across machines: fonts are loaded explicitly and
 * system fonts are disabled.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const LOGO = path.join(ROOT, 'src/assets/logo/drawing_NoText.svg');
const OG_DIR = path.join(ROOT, 'src/assets/og');
const FONT_DIR = path.join(ROOT, 'scripts/fonts');

// ── Brand tokens ────────────────────────────────────────────────────────────
const FONT = 'Space Grotesk';
const C = {
  bg: '#0b0f19',
  ink: '#f1f5f9',
  sub: '#94a3b8',
  faint: '#64748b',
  accent: '#ff4b4b',
  hairline: '#1e293b',
};
const WORDMARK = [
  { t: 'Off', fill: C.ink },
  { t: 'Sec', fill: C.accent },
  { t: 'Intel', fill: C.ink },
];
const TAGLINE = 'Cyber Security Research & Threat Intelligence';
const URL_TEXT = 'blog.offsecintel.org';

// ── Shield mark (geometry reused from the source logo) ──────────────────────
const logoSvg = fs.readFileSync(LOGO, 'utf8');
const shieldD = logoSvg.match(/<path\b[^>]*\sd="([^"]+)"/s)?.[1];
if (!shieldD) throw new Error(`Could not extract shield path from ${LOGO}`);
const SHIELD_TRANSLATE = '-29.399207,-72.611695'; // inner <g> transform in the source
const SHIELD_W = 158.79616;
const SHIELD_H = 139.68422;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** <g> drawing the shield scaled to `h` px, top-left at (x, y). */
function shield(x, y, h, { fill = 'url(#shieldGrad)', opacity = 1 } = {}) {
  const s = h / SHIELD_H;
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${opacity}">
    <g transform="translate(${SHIELD_TRANSLATE})"><path d="${shieldD}" fill="${fill}" /></g>
  </g>`;
}
const GRAD = `<linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#ff5b5b" /><stop offset="1" stop-color="#8f1414" />
  </linearGradient>`;

function wordmark(x, y, size, anchor = 'start') {
  const spans = WORDMARK.map((p) => `<tspan fill="${p.fill}">${esc(p.t)}</tspan>`).join('');
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-weight="700" font-size="${size}" letter-spacing="-1">${spans}</text>`;
}
const txt = (x, y, size, fill, s, { anchor = 'start', weight = 500 } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-weight="${weight}" font-size="${size}" fill="${fill}">${esc(s)}</text>`;

// ── Layouts ─────────────────────────────────────────────────────────────────
// Landscape: horizontal lockup — shield on the left, text block to its right,
// both vertically centred.
function landscape() {
  const W = 1200, H = 630;
  const shieldH = 300;
  const shieldX = 96;
  const shieldY = (H - shieldH) / 2;
  const shieldRightEdge = shieldX + SHIELD_W * (shieldH / SHIELD_H);
  const tx = shieldRightEdge + 56; // text block left edge
  const midY = H / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${GRAD}</defs>
  <rect width="${W}" height="${H}" fill="${C.bg}" />
  <rect width="${W}" height="6" fill="${C.accent}" />
  ${shield(shieldX, shieldY, shieldH)}
  ${wordmark(tx - 2, midY - 30, 96)}
  ${txt(tx, midY + 18, 28, C.sub, TAGLINE)}
  <rect x="${tx}" y="${midY + 52}" width="104" height="4" fill="${C.accent}" />
  ${txt(tx, midY + 104, 25, C.faint, URL_TEXT)}
  <rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${C.hairline}" />
</svg>`;
}

// Square: centred vertical stack.
function square() {
  const S = 1200, cx = S / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}" viewBox="0 0 ${S} ${S}">
  <defs>${GRAD}</defs>
  <rect width="${S}" height="${S}" fill="${C.bg}" />
  <rect width="${S}" height="8" fill="${C.accent}" />
  ${shield(cx - (SHIELD_W * (350 / SHIELD_H)) / 2, 250, 350)}
  ${wordmark(cx, 790, 118, 'middle')}
  ${txt(cx, 858, 38, C.sub, 'Cyber Security Research', { anchor: 'middle' })}
  ${txt(cx, 910, 38, C.sub, '& Threat Intelligence', { anchor: 'middle' })}
  <rect x="${cx - 52}" y="956" width="104" height="4" fill="${C.accent}" />
  ${txt(cx, 1018, 32, C.faint, URL_TEXT, { anchor: 'middle' })}
  <rect x="0.5" y="0.5" width="${S - 1}" height="${S - 1}" fill="none" stroke="${C.hairline}" />
</svg>`;
}

// ── Render ──────────────────────────────────────────────────────────────────
const fontFiles = fs
  .readdirSync(FONT_DIR)
  .filter((f) => /\.(ttf|otf)$/i.test(f))
  .map((f) => path.join(FONT_DIR, f));
if (fontFiles.length === 0) throw new Error(`No fonts in ${FONT_DIR}`);

for (const [name, svg, w] of [
  ['offsecintel-og-default.png', landscape(), 1200],
  ['offsecintel-og-square.png', square(), 1200],
]) {
  const png = new Resvg(svg, {
    background: C.bg,
    fitTo: { mode: 'width', value: w },
    font: { fontFiles, loadSystemFonts: false, defaultFontFamily: FONT },
  })
    .render()
    .asPng();
  const dest = path.join(OG_DIR, name);
  fs.writeFileSync(dest, png);
  console.log(`[og] wrote ${path.relative(ROOT, dest)} (${(png.length / 1024).toFixed(1)} KB)`);
}

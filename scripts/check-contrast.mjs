// `npm run tokens` (step 2 of 2): checks every required color pair in light and dark
// against its WCAG 2.x minimum, and exits 1 if any pair fails. Pairs are listed in
// docs/design-system.md.
//
// `node scripts/check-contrast.mjs --self-test` proves the check can fail: it makes
// light textMuted too light (ink.300) and passes only if the check catches it.
import { readFile } from 'node:fs/promises';

const THEMES = 'src/design-system/tokens/generated/themes.json';

const TEXT = 4.5;
const NON_TEXT = 3;
const STATUS = ['success', 'warning', 'error', 'info'];

/** [fg, bg, minimum] */
const PAIRS = [
  ...['text', 'textMuted', 'textSubtle'].flatMap((fg) =>
    ['bg', 'surface'].map((bg) => [fg, bg, TEXT]),
  ),
  ['text', 'bgSubtle', TEXT],
  ['textMuted', 'bgSubtle', TEXT],
  ['accent', 'bg', TEXT],
  ['accent', 'surface', TEXT],
  ...['accent', 'accentHover', 'accentActive'].map((bg) => ['accentFg', bg, TEXT]),
  ...STATUS.flatMap((s) => [`${s}Bg`, 'bg', 'surface'].map((bg) => [s, bg, TEXT])),
  ['textInverse', 'error', TEXT], // Button danger
  ['text', 'bgSubtleHover', TEXT], // Button secondary, pressed
  ['textPlaceholder', 'bg', NON_TEXT],
  ['textPlaceholder', 'surface', NON_TEXT],
  ['borderFocus', 'surface', NON_TEXT],
  ['borderInput', 'bg', NON_TEXT],
  ['borderInput', 'surface', NON_TEXT],
];

function channel(value) {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`Expected #RRGGBB, got ${hex}`);
  const n = parseInt(match[1], 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

export function contrast(a, b) {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function check(themes) {
  const failures = [];
  let checked = 0;
  let lowest = { ratio: Infinity };
  for (const [combo, color] of Object.entries(themes)) {
    for (const [fg, bg, min] of PAIRS) {
      const ratio = contrast(color[fg], color[bg]);
      checked += 1;
      if (ratio < min) failures.push({ combo, fg, bg, min, ratio });
      if (min === TEXT && ratio < lowest.ratio) lowest = { combo, fg, bg, ratio };
    }
  }
  return { failures, checked, lowest };
}

const themes = JSON.parse(await readFile(THEMES, 'utf8'));
const selfTest = process.argv.includes('--self-test');

if (selfTest) {
  const broken = structuredClone(themes);
  broken.light.textMuted = '#C3CCCE';
  const { failures } = check(broken);
  if (failures.length === 0) {
    console.error('contrast self-test: FAILED. A too-light textMuted was not caught.');
    process.exit(1);
  }
  console.log(
    `contrast self-test: ok. A too-light textMuted (#C3CCCE) was caught by ${failures.length} pair(s):`,
  );
  for (const f of failures)
    console.log(`  ✗ ${f.combo}  ${f.fg} on ${f.bg}  ${f.ratio.toFixed(2)} < ${f.min}`);
  process.exit(0);
}

const { failures, checked, lowest } = check(themes);
if (failures.length) {
  console.error(`contrast: ${failures.length} of ${checked} pairs below minimum`);
  for (const f of failures)
    console.error(`  ✗ ${f.combo}  ${f.fg} on ${f.bg}  ${f.ratio.toFixed(2)} < ${f.min}`);
  process.exit(1);
}
console.log(
  `contrast: all ${checked} pairs pass (${Object.keys(themes).length} themes). ` +
    `Lowest text pair: ${lowest.combo} ${lowest.fg} on ${lowest.bg} ${lowest.ratio.toFixed(2)}`,
);

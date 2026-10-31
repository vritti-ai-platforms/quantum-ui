/**
 * Categorical "group" color palette.
 *
 * A shared, theme-aware set of 12 color keys backed by the `--group-*` CSS variables
 * declared in quantum-ui's theme (index.css). Each key auto-swaps light/dark and is also
 * exposed to Tailwind as `bg-group-*` / `text-group-*` / `border-group-*` utilities.
 *
 * Use for charts, graphs, legends, and color pickers where a stable set of distinct,
 * theme-consistent colors is needed. Render via `var(--group-<key>)`, the `var` field on
 * `GROUP_COLORS`, or the utility classes — never a raw hex.
 */
export const GROUP_COLOR_KEYS = [
  'blue',
  'green',
  'amber',
  'rose',
  'violet',
  'teal',
  'orange',
  'lime',
  'cyan',
  'indigo',
  'fuchsia',
  'slate',
] as const;

export type GroupColorKey = (typeof GROUP_COLOR_KEYS)[number];

/** Palette entries with a display label and the CSS `var(...)` reference for each key. */
export const GROUP_COLORS: { key: GroupColorKey; label: string; var: string }[] = GROUP_COLOR_KEYS.map((key) => ({
  key,
  label: key.charAt(0).toUpperCase() + key.slice(1),
  var: `var(--group-${key})`,
}));

/** Resolve a (possibly nullable) color key to a CSS color; falls back to the theme primary. */
export function groupColorVar(key?: string | null): string {
  return key && (GROUP_COLOR_KEYS as readonly string[]).includes(key) ? `var(--group-${key})` : 'var(--color-primary)';
}

// ---------------------------------------------------------------------------
// Generated categorical colors
// ---------------------------------------------------------------------------

/** Theme mode a generated categorical color is tuned for. */
export type CategoricalColorMode = 'light' | 'dark';

/** A generated categorical color, ready for inline `style` use. */
export interface CategoricalColor {
  /** CSS color for the mark itself, e.g. `oklch(0.5821 0.1512 256.12)`. */
  background: string;
  /** Readable text color on `background`, picked by APCA between the theme's near-white and near-black. */
  foreground: string;
  /** sRGB hex of `background` (for validators, exports, canvas). */
  hex: string;
}

type Vec3 = [number, number, number];
type Mat3 = [Vec3, Vec3, Vec3];

/** OKLCH lightness band each mode's colors must fall inside. */
const LIGHTNESS_BAND: Record<CategoricalColorMode, [number, number]> = { light: [0.43, 0.77], dark: [0.48, 0.67] };
/** Lightness levels sampled for the candidate pool (tuned against the validator; the band's top is unreachable at 3:1). */
const LIGHTNESS_LEVELS: Record<CategoricalColorMode, number[]> = {
  light: [0.44, 0.52, 0.6, 0.67],
  dark: [0.52, 0.59, 0.66],
};
/** Upper chroma bound per candidate, applied after gamut mapping. */
const CHROMA_CAP: Record<CategoricalColorMode, number> = { light: 0.24, dark: 0.22 };
/** Slot 0, aligned with the theme primary hue. */
const SEED: Record<CategoricalColorMode, { l: number; h: number }> = {
  light: { l: 0.58, h: 256 },
  dark: { l: 0.6, h: 256 },
};
const HUE_STEP = 5;
const MAX_SLOTS = 48;
const CHROMA_FLOOR = 0.1;
const SURFACE_CONTRAST_MIN = 3;
const NORMAL_FLOOR = 15;
const CVD_TARGET = 8;
const CVD_WEIGHT = NORMAL_FLOOR / CVD_TARGET;

// Theme tokens from index.css: light surface is white, dark surface is `.dark --card`.
const SURFACE_OKLCH: Record<CategoricalColorMode, Vec3> = { light: [1, 0, 0], dark: [0.2077, 0.008, 265.7549] };
// Near-black is `:root --foreground`, near-white is `.dark --foreground`.
const NEAR_BLACK_OKLCH: Vec3 = [0.2302, 0.0547, 256.1829];
const NEAR_WHITE_OKLCH: Vec3 = [0.9842, 0.0034, 247.8575];
const NEAR_BLACK_CSS = 'oklch(0.2302 0.0547 256.1829)';
const NEAR_WHITE_CSS = 'oklch(0.9842 0.0034 247.8575)';

// Machado, Oliveira & Fernandes (2009) dichromacy simulation at severity 1.0, in linear sRGB.
const PROTAN: Mat3 = [
  [0.152286, 1.052583, -0.204868],
  [0.114503, 0.786281, 0.099216],
  [-0.003882, -0.048116, 1.051998],
];
const DEUTAN: Mat3 = [
  [0.367322, 0.860646, -0.227968],
  [0.280085, 0.672501, 0.047413],
  [-0.01182, 0.04294, 0.968881],
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const mul = (m: Mat3, [r, g, b]: Vec3): Vec3 => [
  m[0][0] * r + m[0][1] * g + m[0][2] * b,
  m[1][0] * r + m[1][1] * g + m[1][2] * b,
  m[2][0] * r + m[2][1] * g + m[2][2] * b,
];

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const linearToSrgb = (c: number) => {
  const v = clamp01(c);
  return v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
};

function linearToOklab([r, g, b]: Vec3): Vec3 {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

function oklabToLinear([L, a, b]: Vec3): Vec3 {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

function oklchToOklab([L, C, H]: Vec3): Vec3 {
  const rad = (H * Math.PI) / 180;
  return [L, C * Math.cos(rad), C * Math.sin(rad)];
}

function oklabToOklch([L, a, b]: Vec3): Vec3 {
  const h = (Math.atan2(b, a) * 180) / Math.PI;
  return [L, Math.hypot(a, b), (h + 360) % 360];
}

const inGamut = (rgb: Vec3) => rgb.every((c) => c >= -1e-7 && c <= 1 + 1e-7);

/** Largest chroma at fixed lightness/hue that stays inside sRGB (binary search). */
function maxInGamutChroma(l: number, h: number): number {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklabToLinear(oklchToOklab([l, mid, h])))) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Quantizes an OKLCH color to 8-bit sRGB, returning the channel bytes. */
function oklchToBytes(lch: Vec3): Vec3 {
  const lin = oklabToLinear(oklchToOklab(lch));
  return lin.map((c) => Math.round(linearToSrgb(c) * 255)) as Vec3;
}

const bytesToLinear = (bytes: Vec3): Vec3 => bytes.map((c) => srgbToLinear(c / 255)) as Vec3;
const bytesToHex = (bytes: Vec3) => `#${bytes.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
const relativeLuminance = ([r, g, b]: Vec3) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

function contrastRatio(a: Vec3, b: Vec3): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// APCA 0.0.98G luminance and lightness contrast (Lc), ported from Color.js (MIT, Lea Verou & Chris Lilley).
function apcaY(bytes: Vec3): number {
  const [r, g, b] = bytes.map((c) => (c / 255) ** 2.4);
  const y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  // biome-ignore lint/suspicious/noApproximativeNumericConstant: APCA's black-clamp exponent is exactly 1.414, not √2
  return y >= 0.022 ? y : y + (0.022 - y) ** 1.414;
}

function apcaContrast(text: Vec3, background: Vec3): number {
  const t = apcaY(text);
  const b = apcaY(background);
  if (Math.abs(b - t) < 0.0005) return 0;
  const c = 1.14 * (b > t ? b ** 0.56 - t ** 0.57 : b ** 0.65 - t ** 0.62);
  return Math.abs(c) < 0.1 ? 0 : (c - Math.sign(c) * 0.027) * 100;
}

const distance = (a: Vec3, b: Vec3) => 100 * Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const simulate = (m: Mat3, lin: Vec3): Vec3 => mul(m, lin).map(clamp01) as Vec3;
const formatOklch = ([l, c, h]: Vec3) => `oklch(${+l.toFixed(4)} ${+c.toFixed(4)} ${+h.toFixed(2)})`;

interface Candidate {
  hue: number;
  lightness: number;
  color: CategoricalColor;
  normal: Vec3;
  protan: Vec3;
  deutan: Vec3;
}

const NEAR_BLACK = oklchToBytes(NEAR_BLACK_OKLCH);
const NEAR_WHITE = oklchToBytes(NEAR_WHITE_OKLCH);
const SURFACE: Record<CategoricalColorMode, Vec3> = {
  light: bytesToLinear(oklchToBytes(SURFACE_OKLCH.light)),
  dark: bytesToLinear(oklchToBytes(SURFACE_OKLCH.dark)),
};

function buildCandidate(mode: CategoricalColorMode, lightness: number, hue: number): Candidate | null {
  const chroma = Math.min(maxInGamutChroma(lightness, hue), CHROMA_CAP[mode]);
  const bytes = oklchToBytes([lightness, chroma, hue]);
  const lin = bytesToLinear(bytes);
  const normal = linearToOklab(lin);
  const lch = oklabToOklch(normal);
  const [lo, hi] = LIGHTNESS_BAND[mode];
  if (lch[0] < lo || lch[0] > hi || lch[1] < CHROMA_FLOOR) return null;
  if (contrastRatio(lin, SURFACE[mode]) < SURFACE_CONTRAST_MIN) return null;
  const onWhite = Math.abs(apcaContrast(NEAR_WHITE, bytes));
  const onBlack = Math.abs(apcaContrast(NEAR_BLACK, bytes));
  return {
    hue,
    lightness,
    color: Object.freeze({
      background: formatOklch(lch),
      foreground: onWhite >= onBlack ? NEAR_WHITE_CSS : NEAR_BLACK_CSS,
      hex: bytesToHex(bytes),
    }),
    normal,
    protan: linearToOklab(simulate(PROTAN, lin)),
    deutan: linearToOklab(simulate(DEUTAN, lin)),
  };
}

/** Separation score: normal-vision ΔE and CVD ΔE scaled onto one axis (15 normal ≡ 8 CVD). */
function separation(a: Candidate, b: Candidate): number {
  const cvd = Math.min(distance(a.protan, b.protan), distance(a.deutan, b.deutan));
  return Math.min(distance(a.normal, b.normal), CVD_WEIGHT * cvd);
}

interface Sequence {
  pool: Candidate[];
  score: number[];
  colors: CategoricalColor[];
}

const sequences: Partial<Record<CategoricalColorMode, Sequence>> = {};

function pick(seq: Sequence, chosen: Candidate) {
  seq.colors.push(chosen.color);
  for (let i = 0; i < seq.pool.length; i++) {
    seq.score[i] = Math.min(seq.score[i], separation(seq.pool[i], chosen));
  }
}

function getSequence(mode: CategoricalColorMode): Sequence {
  const existing = sequences[mode];
  if (existing) return existing;
  const pool: Candidate[] = [];
  for (let hue = 0; hue < 360; hue += HUE_STEP) {
    for (const lightness of LIGHTNESS_LEVELS[mode]) {
      const candidate = buildCandidate(mode, lightness, hue);
      if (candidate) pool.push(candidate);
    }
  }
  pool.sort((a, b) => a.hue - b.hue || a.lightness - b.lightness);
  const seq: Sequence = { pool, score: pool.map(() => Number.POSITIVE_INFINITY), colors: [] };
  const seed = buildCandidate(mode, SEED[mode].l, SEED[mode].h);
  if (seed) pick(seq, seed);
  sequences[mode] = seq;
  return seq;
}

/** Extends the greedy farthest-point sequence until it holds `count` colors (capped at `MAX_SLOTS`). */
function extend(seq: Sequence, count: number) {
  while (seq.colors.length < Math.min(count, MAX_SLOTS)) {
    let best = -1;
    for (let i = 0; i < seq.pool.length; i++) {
      if (seq.score[i] > 0 && (best === -1 || seq.score[i] > seq.score[best])) best = i;
    }
    if (best === -1) break;
    pick(seq, seq.pool[best]);
  }
}

/**
 * Returns the categorical color for slot `index`. Deterministic and prefix-stable: slot `i` never depends on
 * how many colors are in use, so adding a series never repaints existing ones. Each slot is the in-gamut
 * candidate farthest (OKLab ΔE, normal and protan/deutan-simulated vision) from every earlier slot, within
 * the mode's lightness band, chroma floor, and ≥3:1 contrast against the theme surface. Separation shrinks
 * as the index grows; indexes past the 48th slot wrap around.
 */
export function categoricalColor(index: number, mode: CategoricalColorMode = 'light'): CategoricalColor {
  const slot = Number.isFinite(index) ? Math.max(0, Math.floor(index)) : 0;
  const seq = getSequence(mode);
  extend(seq, slot + 1);
  return seq.colors[slot % seq.colors.length];
}

/** Returns the first `count` categorical colors for `mode` (see {@link categoricalColor}). */
export function generateCategoricalColors(count: number, mode: CategoricalColorMode = 'light'): CategoricalColor[] {
  const total = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  return Array.from({ length: total }, (_, i) => categoricalColor(i, mode));
}

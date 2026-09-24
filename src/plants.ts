/*
  Plant geometry.
  ---------------
  Everything the greenery is drawn from. Two plants, both broad-leaved
  evergreens:

    Camellia             — glossy dark leaves with a finely scalloped edge,
                           and round, many-petalled flowers.
    Magnolia grandiflora — much larger leathery leaves, dark green above and
                           rusty and felted beneath, and big creamy flowers.

  Why it's built this way
  -----------------------
  The obvious way to draw a branch is to write one leaf shape and then stamp it
  out at different sizes and angles. That is exactly what makes a drawing look
  like clip-art: every leaf identical, evenly spaced, perfectly symmetrical.

  So nothing here is stamped. Each leaf is generated in full from its own
  parameters — its own length, its own width on each side of the midrib, its
  own curve and twist — and then outlined by fitting a smooth curve through the
  sampled points. No two leaves on the site are the same shape.

  The variation comes from a seeded random number generator, so the planting is
  different in every part but identical on every build.
*/

export type Pt = [number, number];

/* Trim coordinates. Two decimals is past the point of visibility and the path
   data is repeated a lot, so this matters for page weight. */
const f = (v: number) => Math.round(v * 10) / 10;

/* ------------------------------------------------------------------
   Seeded randomness
   ------------------------------------------------------------------ */

/* mulberry32. Small, fast, and good enough to scatter leaves convincingly. */
export function makeRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* A random number between lo and hi. */
export const between = (rng: () => number, lo: number, hi: number) =>
  lo + rng() * (hi - lo);

/* ------------------------------------------------------------------
   Curves
   ------------------------------------------------------------------ */

function cubicAt(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const m = 1 - t;
  const a = m * m * m;
  const b = 3 * m * m * t;
  const c = 3 * m * t * t;
  const d = t * t * t;
  return [
    a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
    a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
  ];
}

function cubicTangentAt(p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt {
  const m = 1 - t;
  const a = 3 * m * m;
  const b = 6 * m * t;
  const c = 3 * t * t;
  return [
    a * (p1[0] - p0[0]) + b * (p2[0] - p1[0]) + c * (p3[0] - p2[0]),
    a * (p1[1] - p0[1]) + b * (p2[1] - p1[1]) + c * (p3[1] - p2[1]),
  ];
}

function unit(v: Pt): Pt {
  const l = Math.hypot(v[0], v[1]) || 1;
  return [v[0] / l, v[1] / l];
}

/*
  Fit a smooth curve through a list of points (Catmull-Rom, converted to the
  cubic bezier segments SVG understands). This is what turns a handful of
  sampled points into an organic outline rather than a faceted polygon.
*/
export function smoothClosed(pts: Pt[]): string {
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    d +=
      `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)}` +
      ` ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)}` +
      ` ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + "Z";
}

export function smoothOpen(pts: Pt[]): string {
  const n = pts.length;
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, n - 1)];
    d +=
      `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)}` +
      ` ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)}` +
      ` ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
}

/* ------------------------------------------------------------------
   Leaves
   ------------------------------------------------------------------ */

export interface LeafSpec {
  length: number;
  /* Width on each side of the midrib. Making these differ is what gives a leaf
     its twist — a real leaf is almost never flat-on to the viewer. */
  widthLeft: number;
  widthRight: number;
  /* How much the midrib arcs, as a fraction of the length. */
  bend?: number;
  /* How far the tip drops below the base. */
  droop?: number;
  /* Where the leaf is widest. Raising tipPower moves it towards the base. */
  basePower?: number;
  tipPower?: number;
  /* Scallops down the margin. 0 for a smooth edge, as magnolia has. */
  scallops?: number;
  scallopDepth?: number;
  veinPairs?: number;
}

export interface LeafGeometry {
  outline: string;
  /* The half of the blade turned away from the light, split along the midrib. */
  shade: string;
  midrib: string;
  veins: string;
}

const LEAF_SAMPLES = 30;

export function buildLeaf(spec: LeafSpec): LeafGeometry {
  const {
    length: L,
    widthLeft,
    widthRight,
    bend = 0.07,
    droop = 0.05,
    basePower = 0.52,
    tipPower = 0.95,
    scallops = 0,
    scallopDepth = 0.05,
    veinPairs = 5,
  } = spec;

  // The midrib, as a curve rather than a straight line.
  const c0: Pt = [0, 0];
  const c1: Pt = [L * 0.3, -bend * L];
  const c2: Pt = [L * 0.68, -bend * L * 1.2];
  const c3: Pt = [L, -droop * L];

  const spine: Pt[] = [];
  const normals: Pt[] = [];
  for (let i = 0; i <= LEAF_SAMPLES; i++) {
    const t = i / LEAF_SAMPLES;
    spine.push(cubicAt(c0, c1, c2, c3, t));
    const tg = unit(cubicTangentAt(c0, c1, c2, c3, t));
    normals.push([-tg[1], tg[0]]);
  }

  // How wide the blade is at each point, normalised so the widths mean what
  // they say.
  const peakT = basePower / (basePower + tipPower);
  const peak = Math.pow(peakT, basePower) * Math.pow(1 - peakT, tipPower);
  const profile = (t: number) =>
    (Math.pow(t, basePower) * Math.pow(1 - t, tipPower)) / peak;

  // A gentle undulation of the margin, rather than saw teeth. At the sizes
  // these are drawn, real camellia serration reads as a soft scallop.
  const margin = (t: number) =>
    scallops ? 1 + scallopDepth * Math.sin(t * scallops * Math.PI * 2) : 1;

  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= LEAF_SAMPLES; i++) {
    const t = i / LEAF_SAMPLES;
    const w = profile(t) * margin(t);
    const [sx, sy] = spine[i];
    const [nx, ny] = normals[i];
    left.push([sx + nx * w * widthLeft, sy + ny * w * widthLeft]);
    right.push([sx - nx * w * widthRight, sy - ny * w * widthRight]);
  }

  // Dropping the shared first and last points stops a kink at base and tip.
  const outline = smoothClosed([...left, ...right.slice(1, -1).reverse()]);
  const shade = smoothClosed([...right, ...spine.slice(1, -1).reverse()]);
  const midrib = smoothOpen(spine);

  // Veins leave the midrib heading outwards and forwards, and stop short of
  // the margin. Measuring their reach against the blade's width *here* rather
  // than its widest point is what keeps them from poking out near the tip.
  const veins: string[] = [];
  for (let k = 1; k <= veinPairs; k++) {
    const t = 0.15 + (k / (veinPairs + 1)) * 0.68;
    const i = Math.round(t * LEAF_SAMPLES);
    const [sx, sy] = spine[i];
    const [nx, ny] = normals[i];
    const ahead = spine[Math.min(i + 2, LEAF_SAMPLES)];
    const fwd = unit([ahead[0] - sx, ahead[1] - sy]);
    const w = profile(t);

    for (const side of [1, -1] as const) {
      const reach = (side === 1 ? widthLeft : widthRight) * w * 0.74;
      const ex = sx + nx * side * reach + fwd[0] * reach * 0.6;
      const ey = sy + ny * side * reach + fwd[1] * reach * 0.6;
      const qx = sx + nx * side * reach * 0.4 + fwd[0] * reach * 0.12;
      const qy = sy + ny * side * reach * 0.4 + fwd[1] * reach * 0.12;
      veins.push(`M${f(sx)} ${f(sy)}Q${f(qx)} ${f(qy)} ${f(ex)} ${f(ey)}`);
    }
  }

  return { outline, shade, midrib, veins: veins.join("") };
}

/* ------------------------------------------------------------------
   Stems
   ------------------------------------------------------------------
   Drawn as a filled shape that tapers from base to tip, not a stroke of
   constant width. A real stem is thicker where it carries more weight.
*/
export function buildStem(
  c0: Pt,
  c1: Pt,
  c2: Pt,
  c3: Pt,
  baseWidth: number,
  tipWidth: number,
  /* Raise this to keep the weight low down, so the stem flares into the ground
     instead of tapering evenly along its whole length. */
  flare = 1.4,
): { shape: string; spine: Pt[]; normals: Pt[] } {
  const N = 22;
  const spine: Pt[] = [];
  const normals: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    spine.push(cubicAt(c0, c1, c2, c3, t));
    const tg = unit(cubicTangentAt(c0, c1, c2, c3, t));
    normals.push([-tg[1], tg[0]]);
  }

  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    // Tapers fast at first, then gently — the way a shoot actually thickens.
    const w = (tipWidth + (baseWidth - tipWidth) * Math.pow(1 - t, flare)) / 2;
    const [sx, sy] = spine[i];
    const [nx, ny] = normals[i];
    left.push([sx + nx * w, sy + ny * w]);
    right.push([sx - nx * w, sy - ny * w]);
  }

  return {
    shape: smoothClosed([...left, ...right.slice(1, -1).reverse()]),
    spine,
    normals,
  };
}

/* ------------------------------------------------------------------
   Vines
   ------------------------------------------------------------------
   A vine is a long, wandering line — more than a single curve can express.
   These take a list of waypoints and run a smooth curve through all of them,
   so a stem can change direction two or three times on its way across the
   frame. That wandering is what makes it read as flowing rather than drawn.
*/
export function vineSpine(
  waypoints: Pt[],
  samples = 64,
): { spine: Pt[]; normals: Pt[] } {
  // Catmull-Rom through the waypoints, with the ends doubled up so the curve
  // starts and finishes where it's told to.
  const pts = [waypoints[0], ...waypoints, waypoints[waypoints.length - 1]];
  const spine: Pt[] = [];

  const segments = pts.length - 3;
  for (let i = 0; i < segments; i++) {
    const [p0, p1, p2, p3] = [pts[i], pts[i + 1], pts[i + 2], pts[i + 3]];
    const steps = Math.max(2, Math.round(samples / segments));
    for (let k = 0; k < steps; k++) {
      const t = k / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      spine.push([
        0.5 *
          (2 * p1[0] +
            (-p0[0] + p2[0]) * t +
            (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
            (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 *
          (2 * p1[1] +
            (-p0[1] + p2[1]) * t +
            (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
            (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3),
      ]);
    }
  }
  spine.push(waypoints[waypoints.length - 1]);

  // Normals from the direction between neighbouring samples.
  const normals: Pt[] = spine.map((_, i) => {
    const a = spine[Math.max(i - 1, 0)];
    const b = spine[Math.min(i + 1, spine.length - 1)];
    const tg = unit([b[0] - a[0], b[1] - a[1]]);
    return [-tg[1], tg[0]];
  });

  return { spine, normals };
}

/* Turn a spine into a filled stem that tapers along its length. */
export function ribbon(
  spine: Pt[],
  normals: Pt[],
  baseWidth: number,
  tipWidth: number,
  flare = 1.5,
): string {
  const n = spine.length - 1;
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const w = (tipWidth + (baseWidth - tipWidth) * Math.pow(1 - t, flare)) / 2;
    const [sx, sy] = spine[i];
    const [nx, ny] = normals[i];
    left.push([sx + nx * w, sy + ny * w]);
    right.push([sx - nx * w, sy - ny * w]);
  }
  return smoothClosed([...left, ...right.slice(1, -1).reverse()]);
}

/* Where along a stem a leaf sits, and which way it points. */
export function stemPointAt(
  spine: Pt[],
  normals: Pt[],
  t: number,
): { at: Pt; angle: number } {
  const i = Math.min(Math.round(t * (spine.length - 1)), spine.length - 1);
  const [nx, ny] = normals[i];
  return { at: spine[i], angle: (Math.atan2(ny, nx) * 180) / Math.PI };
}

/* ------------------------------------------------------------------
   Petals
   ------------------------------------------------------------------
   Built the same way as leaves, so petals curve and cup rather than sitting
   flat. The profile keeps the petal broad almost to the end and then rounds
   off quickly: a petal that tapers to a point reads as a star, not a flower.
*/
export interface PetalSpec {
  length: number;
  widthLeft: number;
  widthRight: number;
  bend?: number;
}

export function buildPetal(spec: PetalSpec): { outline: string; shade: string } {
  const { length: L, widthLeft, widthRight, bend = 0.05 } = spec;

  const c0: Pt = [0, 0];
  const c1: Pt = [L * 0.32, -bend * L];
  const c2: Pt = [L * 0.7, -bend * L * 1.1];
  const c3: Pt = [L, -bend * L * 0.5];

  const N = 16;
  const spine: Pt[] = [];
  const normals: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    spine.push(cubicAt(c0, c1, c2, c3, t));
    const tg = unit(cubicTangentAt(c0, c1, c2, c3, t));
    normals.push([-tg[1], tg[0]]);
  }

  // Broad early, and held wide until it rounds off over the last tenth.
  const raw = (t: number) => Math.pow(t, 0.42) * Math.pow(1 - Math.pow(t, 8), 0.34);
  let peak = 0;
  for (let i = 0; i <= 60; i++) peak = Math.max(peak, raw(i / 60));
  const profile = (t: number) => raw(t) / peak;

  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const w = profile(t);
    const [sx, sy] = spine[i];
    const [nx, ny] = normals[i];
    left.push([sx + nx * w * widthLeft, sy + ny * w * widthLeft]);
    right.push([sx - nx * w * widthRight, sy - ny * w * widthRight]);
  }

  return {
    outline: smoothClosed([...left, ...right.slice(1, -1).reverse()]),
    shade: smoothClosed([...right, ...spine.slice(1, -1).reverse()]),
  };
}

type RGBA = [number, number, number, number];

function parseColor(input: string): RGBA {
  const trimmed = input.trim();
  const rgba = trimmed.match(/rgba?\(([^)]+)\)/);
  if (rgba) {
    const parts = rgba[1].split(",").map((s) => parseFloat(s.trim()));
    return [parts[0], parts[1], parts[2], parts[3] ?? 1];
  }
  if (trimmed.startsWith("#")) {
    const hex = trimmed.slice(1);
    const expand =
      hex.length === 3
        ? hex
            .split("")
            .map((ch) => ch + ch)
            .join("")
        : hex;
    return [
      parseInt(expand.slice(0, 2), 16),
      parseInt(expand.slice(2, 4), 16),
      parseInt(expand.slice(4, 6), 16),
      1,
    ];
  }
  return [0, 0, 0, 0];
}

function formatRGBA([r, g, b, a]: RGBA): string {
  const round = (n: number) => Math.round(n * 1000) / 1000;
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${round(a)})`;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpColor(c1: RGBA, c2: RGBA, t: number): RGBA {
  return [
    lerp(c1[0], c2[0], t),
    lerp(c1[1], c2[1], t),
    lerp(c1[2], c2[2], t),
    lerp(c1[3], c2[3], t),
  ];
}

// Solve cubic-bezier(p1x, p1y, p2x, p2y) for y at a given x via Newton's method.
// Used to approximate easing curves with intermediate gradient stops, which
// avoids the perceived "dead band" of a 2-stop linear gradient.
function bezier(
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
): (x: number) => number {
  const cx = 3 * p1x;
  const bx = 3 * (p2x - p1x) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * p1y;
  const by = 3 * (p2y - p1y) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;

  return (x) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 8; i++) {
      const xt = sampleX(t) - x;
      if (Math.abs(xt) < 1e-6) break;
      const d = sampleDX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= xt / d;
    }
    t = Math.max(0, Math.min(1, t));
    return sampleY(t);
  };
}

const EASINGS = {
  easeInOut: bezier(0.42, 0, 0.58, 1),
  easeOut: bezier(0, 0, 0.58, 1),
  easeIn: bezier(0.42, 0, 1, 1),
} as const;

type Easing = keyof typeof EASINGS;

export function easingGradient(
  direction: string,
  from: string,
  to: string,
  easing: Easing = "easeInOut",
  steps = 13,
): string {
  const c1 = parseColor(from);
  const c2 = parseColor(to);
  const ease = EASINGS[easing];
  const stops: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = i / steps;
    const t = ease(x);
    const c = lerpColor(c1, c2, t);
    stops.push(`${formatRGBA(c)} ${(x * 100).toFixed(2)}%`);
  }
  return `linear-gradient(${direction}, ${stops.join(", ")})`;
}

// Multi-stop variant: eases between each consecutive pair of authored stops,
// stitching the segments together at their declared percentages. Use this when
// the designer authored a non-monotonic curve (e.g. dim-middle, brighter-ends).
export function easingGradientMulti(
  direction: string,
  stops: Array<{ color: string; pos: number }>,
  easing: Easing = "easeInOut",
  stepsPerSegment = 6,
): string {
  const ease = EASINGS[easing];
  const out: string[] = [];
  for (let s = 0; s < stops.length - 1; s++) {
    const a = stops[s];
    const b = stops[s + 1];
    const ca = parseColor(a.color);
    const cb = parseColor(b.color);
    const startStep = s === 0 ? 0 : 1;
    for (let i = startStep; i <= stepsPerSegment; i++) {
      const x = i / stepsPerSegment;
      const t = ease(x);
      const c = lerpColor(ca, cb, t);
      const pos = a.pos + (b.pos - a.pos) * x;
      out.push(`${formatRGBA(c)} ${pos.toFixed(2)}%`);
    }
  }
  return `linear-gradient(${direction}, ${out.join(", ")})`;
}

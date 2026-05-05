"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SolidLogo } from "@/components/BrandLogo";

// Fallback icon set used when no `icons` prop is supplied (e.g. mobile mini
// globe). Doubles as the preload list for those URLs.
const DEFAULT_IDLE_SRCS = [
  "/solid/solana-white.svg",
  "/solid/jupiter-white.svg",
  "/solid/phantom-white.svg",
  "/solid/kamino-white.svg",
  "/solid/meteora-white.svg",
  "/solid/seeker.svg",
  "/solid/sol.svg",
  "/solid/jup.svg",
  "/solid/bonk.svg",
  "/solid/jto.svg",
  "/solid/usdc.svg",
  "/solid/usdt.svg",
  "/solid/raydium.svg",
  "/solid/sanctum.svg",
  "/solid/marginfi.svg",
  "/solid/marinade.svg",
  "/solid/helius.svg",
  "/solid/magic-eden.svg",
  "/solid/metaplex.svg",
  "/solid/pump-fun.svg",
  "/solid/squads.svg",
  "/solid/superteam.svg",
  "/solid/crossmint.svg",
  "/solid/colosseum.svg",
  "/solid/perena.svg",
  "/solid/dflow.svg",
  "/solid/moonshot.svg",
];

const FALLBACK_NODE_COUNT = 80;
// Icons render natively at 48px (the SVG <img> rasterises at the layout
// width). Visual sizes are reached by CSS transform scale, so the SVGs
// only ever scale DOWN — keeping the focused logo crisp instead of
// pixelating from a 24px raster scaled up to ~53px.
const DEFAULT_ICON_SIZE = 48;
const FOCUS_SCALE_BOOST = 0.85;
const SPIN_SPEED = 0.002;
const TILT = 0.18;
const HOVER_RADIUS = 28;
const HOVER_OPACITY_BOOST = 0.18;
const HOVER_SCALE_BOOST = 0.04;

interface Node {
  lat: number;
  lon: number;
  /** Icon id when rendering live solid logos (search/idle with full set). */
  id?: string;
  /** SVG src when rendering plain background-image dots (fallback). */
  src?: string;
}

function fibonacciNodes(count: number): { lat: number; lon: number }[] {
  const out: { lat: number; lon: number }[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  // Keep icons off the exact poles — they'd stack on top of each other and
  // leave a visible singularity. 0.88 lets some icons sit close to the
  // poles (~±62° lat) so the top/bottom doesn't look empty, while still
  // staying visible after horizontal-only focus rotation.
  const Y_RANGE = 0.88;
  for (let i = 0; i < count; i++) {
    const t = count <= 1 ? 0.5 : i / (count - 1);
    const y = (1 - t * 2) * Y_RANGE;
    const angle = goldenAngle * i;
    const lat = Math.asin(y) * (180 / Math.PI);
    const lon = ((angle * 180) / Math.PI) % 360 - 180;
    out.push({ lat, lon });
  }
  return out;
}

interface IconGlobeProps {
  icons?: Array<{ id: string }>;
  mode?: "idle" | "search";
  focusedId?: string | null;
  onIconClick?: (id: string) => void;
  iconSize?: number;
  interactive?: boolean;
  /** CSS scale applied while in idle mode. Default 1.14. */
  idleScale?: number;
  /** CSS scale applied while in search mode. Default 1.32. */
  searchScale?: number;
  /**
   * Per-icon (lat, lon) overrides keyed by icon id. When provided, the
   * default fibonacci layout is bypassed — used to gather a relevant
   * cluster on the front face around the focused logo. Icons without
   * an entry are skipped. Lat/lon are in degrees.
   */
  nodePositions?: Map<string, { lat: number; lon: number }> | null;
  /**
   * Viewport-pixel keep-out boundaries for cluster physics — icons in
   * the floating cluster bounce back into the safe area when they hit
   * any of these. Used to keep logos from drifting behind the header,
   * the search bar, or below the search bar's footer area.
   */
  keepOutTopVy?: number;
  keepOutBottomVy?: number;
  /**
   * Multiplier applied to the spherical radius. Use values < 1 to shrink
   * the globe (e.g. when a search filter narrows the icon set). Defaults
   * to 1, which keeps the radius proportional to the container.
   */
  radiusScale?: number;
  /**
   * Per-icon idle jitter amplitude in pixels. Each icon gets an
   * independent low-frequency sine wave on x and y, giving the
   * impression that each logo is gently "hovering" in place. Set to 0
   * to disable.
   */
  jitterAmplitude?: number;
  /** Called during a drag with the id of the icon nearest screen centre. */
  onDragHighlight?: (id: string | null) => void;
  /** Called on drag-end with the id of the icon nearest screen centre. */
  onDragRelease?: (id: string | null) => void;
  /**
   * Whether drag-to-rotate is enabled. Click handling stays gated on
   * `interactive`; drag is a separate gesture so the same globe can be
   * click-only (BG globe) or click-and-drag (cluster overlay).
   * Defaults to the value of `interactive`.
   */
  draggable?: boolean;
  /**
   * If set, drag rotation is clamped so the focused logo (lat=0, lon=0)
   * stays at least this many viewport pixels inside every edge of the
   * window. Skipped when null/undefined.
   */
  dragMarginPx?: number | null;
}

export function IconGlobe({
  icons,
  mode = "idle",
  focusedId = null,
  onIconClick,
  iconSize = DEFAULT_ICON_SIZE,
  interactive = false,
  idleScale = 1.14,
  searchScale = 1.32,
  radiusScale = 1,
  jitterAmplitude = 0,
  nodePositions = null,
  keepOutTopVy = 80,
  keepOutBottomVy = 525,
  onDragHighlight,
  onDragRelease,
  draggable,
  dragMarginPx = null,
}: IconGlobeProps = {}) {
  // Drag is a separate gesture from click — defaults to whatever
  // `interactive` is so the previous (click-and-drag) behaviour holds
  // when `draggable` is omitted.
  const dragEnabled = draggable ?? interactive;
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef(0);
  const thetaRef = useRef(0);
  const velPhiRef = useRef(0);
  const velThetaRef = useRef(0);
  const rafRef = useRef(0);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    basePhi: number;
    baseTheta: number;
    lastX: number;
    lastY: number;
    moved: boolean;
    pointerId: number;
  } | null>(null);
  const [grabbing, setGrabbing] = useState(false);

  // Tracks whether the user has manually dragged after the most recent change
  // to focusedId. While true, suspend the auto-focus easing so manual
  // exploration isn't fought by the spring snapping back. Reset whenever
  // focusedId itself changes — but never during an active drag.
  const userPannedRef = useRef(false);
  useEffect(() => {
    if (dragRef.current !== null) return;
    userPannedRef.current = false;
  }, [focusedId]);

  // Tracks the icon nearest screen centre during the current drag, so
  // pointer-up can report it via onDragRelease without re-scanning.
  const dragNearestIdxRef = useRef(-1);
  const lastReportedHighlightRef = useRef<string | null>(null);
  const onDragHighlightRef = useRef(onDragHighlight);
  const onDragReleaseRef = useRef(onDragRelease);
  useEffect(() => {
    onDragHighlightRef.current = onDragHighlight;
    onDragReleaseRef.current = onDragRelease;
  }, [onDragHighlight, onDragRelease]);

  // Single, stable node set — same nodes are used for idle and search modes
  // so the visual is one continuous globe; only the visual treatment changes
  // when the user enters search mode.
  const nodes = useMemo<Node[]>(() => {
    if (icons && icons.length > 0) {
      // If the parent provided explicit positions (e.g. clustering
      // around the focused logo on the front face), use those. Icons
      // without a position entry are dropped.
      if (nodePositions) {
        const out: Node[] = [];
        for (const icon of icons) {
          const pos = nodePositions.get(icon.id);
          if (pos) out.push({ lat: pos.lat, lon: pos.lon, id: icon.id });
        }
        if (out.length > 0) return out;
      }
      const positions = fibonacciNodes(icons.length);
      return positions.map((p, i) => ({ ...p, id: icons[i].id }));
    }
    const positions = fibonacciNodes(FALLBACK_NODE_COUNT);
    return positions.map((p, i) => ({
      ...p,
      src: DEFAULT_IDLE_SRCS[i % DEFAULT_IDLE_SRCS.length],
    }));
  }, [icons, nodePositions]);

  const focusedIdx = useMemo(() => {
    if (mode !== "search" || !focusedId) return -1;
    return nodes.findIndex((n) => n.id === focusedId);
  }, [mode, focusedId, nodes]);

  // Per-icon physics offset from its home (lat/lon) projection. Used in
  // cluster mode so icons gently float, bump into each other and settle
  // back rather than locking onto fixed lat/lon points. The collision
  // radius is larger than the visual radius — the user wanted invisible
  // bounding boxes interacting, not the visible logos themselves.
  const physicsRef = useRef<
    Map<string, { ox: number; oy: number; vx: number; vy: number }>
  >(new Map());
  const lastPhysicsTickRef = useRef<number | null>(null);

  // Smoothed cursor-attraction offset per cluster icon. Each frame the
  // icon's offset eases toward a target derived from cursor proximity,
  // producing a subtle "follow my cursor" tug on non-focused logos.
  const attractRef = useRef<Map<string, { ax: number; ay: number }>>(
    new Map(),
  );

  // Time-based alpha envelope around the pendulum animation. Fades in a
  // few ms BEFORE the rotation starts, holds at peak through the rotation,
  // and fades out a few ms after — so the alpha bump feels natural rather
  // than snapping on/off with the rotation timing.
  const wiggleEnvRef = useRef<{
    id: string | null;
    startedAt: number;
    fadeInMs: number;
    rotateMs: number;
    fadeOutMs: number;
  }>({ id: null, startedAt: 0, fadeInMs: 0, rotateMs: 0, fadeOutMs: 0 });

  // "Pick me next" pendulum wiggle — every ~4s while a focused cluster is
  // visible, pick a random non-focused cluster icon and trigger a brief
  // pendulum rotation. The keyframe lives in globals.css; we retrigger it
  // by clearing then setting `animation` after a forced reflow.
  useEffect(() => {
    if (mode !== "search") return;
    if (focusedIdx < 0) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    const FADE_IN_MS = 120;
    const PENDULUM_MS = 520;
    const FADE_OUT_MS = 200;
    let rotateTimer = 0;
    const interval = window.setInterval(() => {
      const candidates: number[] = [];
      for (let i = 0; i < nodes.length; i++) {
        if (i === focusedIdx) continue;
        if (!nodes[i].id) continue;
        candidates.push(i);
      }
      if (candidates.length === 0) return;
      const pickIdx = candidates[Math.floor(Math.random() * candidates.length)];
      const picked = nodes[pickIdx];
      if (!picked.id) return;

      // Start the alpha-envelope NOW; fade-in ramps the bump up before
      // the rotation kicks in so it never snaps to peak alpha.
      wiggleEnvRef.current = {
        id: picked.id,
        startedAt: performance.now(),
        fadeInMs: FADE_IN_MS,
        rotateMs: PENDULUM_MS,
        fadeOutMs: FADE_OUT_MS,
      };

      // Schedule the rotation to start after fade-in.
      window.clearTimeout(rotateTimer);
      rotateTimer = window.setTimeout(() => {
        const child = overlay.children[pickIdx] as HTMLElement | undefined;
        const target = child?.querySelector(
          "[data-wiggle-target]",
        ) as HTMLElement | null;
        if (!target) return;
        target.style.animation = "none";
        void target.offsetWidth;
        target.style.animation = `globe-pendulum ${PENDULUM_MS}ms cubic-bezier(0.65, 0, 0.35, 1) 1`;
      }, FADE_IN_MS);
    }, 4000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(rotateTimer);
    };
  }, [mode, focusedIdx, nodes]);

  // Animation loop — direct DOM mutation for performance with many nodes.
  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;
    if (nodes.length === 0) return;

    const usingSearch = mode === "search";
    const children = overlay.children as HTMLCollectionOf<HTMLElement>;

    const animate = () => {
      const drag = dragRef.current;
      const isDragging = drag !== null;

      if (!isDragging) {
        if (usingSearch) {
          if (focusedIdx >= 0 && !userPannedRef.current) {
            const target = nodes[focusedIdx];
            const targetLonR = (target.lon * Math.PI) / 180;
            const targetLatR = (target.lat * Math.PI) / 180;

            // closest-path easing on phi (wrap to nearest equivalent angle)
            let dPhi = -targetLonR - phiRef.current;
            while (dPhi > Math.PI) dPhi -= 2 * Math.PI;
            while (dPhi < -Math.PI) dPhi += 2 * Math.PI;
            phiRef.current += dPhi * 0.08;

            const dTheta = targetLatR - thetaRef.current;
            thetaRef.current += dTheta * 0.08;

            velPhiRef.current = 0;
            velThetaRef.current = 0;
          } else if (focusedIdx >= 0 && userPannedRef.current) {
            // Inertia decay only — leave manual position alone.
            phiRef.current += velPhiRef.current;
            thetaRef.current += velThetaRef.current;
            velPhiRef.current *= 0.94;
            velThetaRef.current *= 0.94;
          } else {
            // No focus: gentle spin + inertia decay + ease theta to base tilt.
            phiRef.current += velPhiRef.current + SPIN_SPEED * 0.5;
            thetaRef.current += velThetaRef.current;
            velPhiRef.current *= 0.94;
            velThetaRef.current *= 0.94;
            const dTheta = TILT - thetaRef.current;
            thetaRef.current += dTheta * 0.04;
          }
        } else {
          phiRef.current += SPIN_SPEED;
          const dTheta = TILT - thetaRef.current;
          thetaRef.current += dTheta * 0.04;
        }
      }

      const size = container.offsetWidth;
      const r = size * 0.45 * radiusScale;
      const cx = size / 2;
      const cy = size / 2;
      const phi = phiRef.current;
      const theta = thetaRef.current;
      const cosT = Math.cos(theta);
      const sinT = Math.sin(theta);
      const pointer = pointerRef.current;
      // Subtle hover wobble — each icon gets an independent low-frequency
      // sine on both axes so the globe feels "alive" rather than rigidly
      // rotating. Amplitude controlled by jitterAmplitude prop.
      const tNow = jitterAmplitude > 0 ? performance.now() * 0.001 : 0;

      // While dragging, track the front-facing icon nearest screen centre.
      let nearestI = -1;
      let nearestD2 = Infinity;

      // Cluster physics — only active when nodePositions is provided.
      // Each visible icon gets a 2D screen-space offset from its home
      // (lat/lon) projection. Icons spring back to home and repel each
      // other when their invisible bounds overlap, producing a soft
      // "floating in space" feel.
      const usingPhysics = !!nodePositions;
      const physics = physicsRef.current;
      const physTickT = performance.now();
      const physDt = lastPhysicsTickRef.current
        ? Math.min(0.05, (physTickT - lastPhysicsTickRef.current) / 1000)
        : 0.016;
      lastPhysicsTickRef.current = physTickT;
      // Indexed by node array index — gathered in pass 1, applied in
      // pass 2 after collision resolution.
      const homePos: Array<{
        sx: number;
        sy: number;
        z: number;
        scale: number;
        opacity: number;
        depth: number;
      } | null> = [];

      for (let i = 0; i < children.length; i++) {
        const node = nodes[i];
        if (!node) continue;
        const latR = (node.lat * Math.PI) / 180;
        const lonR = (node.lon * Math.PI) / 180;
        const cosLat = Math.cos(latR);
        const sinLat = Math.sin(latR);

        // y-axis rotation by phi
        const x1 = cosLat * Math.sin(lonR + phi);
        const y1 = sinLat;
        const z1 = cosLat * Math.cos(lonR + phi);
        // x-axis rotation by theta
        const x = x1;
        const y = y1 * cosT - z1 * sinT;
        const z = y1 * sinT + z1 * cosT;

        let sx = cx + x * r;
        let sy = cy - y * r;
        // Focused logo stays static — no jitter/wobble — so it doesn't
        // appear to float while the cluster around it floats.
        if (jitterAmplitude > 0 && focusedIdx !== i) {
          // Per-icon seeds derived from index so the wobble pattern is
          // varied across the globe (no obvious lockstep).
          const seedX = i * 0.137;
          const seedY = i * 0.253;
          sx += Math.sin(tNow * 0.7 + seedX) * jitterAmplitude;
          sy += Math.cos(tNow * 0.9 + seedY) * jitterAmplitude;
        }

        if (z > 0) {
          if (isDragging && node.id) {
            const ddx = sx - cx;
            const ddy = sy - cy;
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 < nearestD2) {
              nearestD2 = d2;
              nearestI = i;
            }
          }
          const depth = z;
          let opacity: number;
          let scale: number;

          if (usingSearch) {
            // Non-focused cluster icons sit at ~25% alpha so the focused
            // logo + pill read cleanly. Hover bumps to ~40%, and a
            // mid-pendulum logo also lands at 40% to make the wiggle feel
            // like an extra cue rather than just motion.
            opacity = 0.05 + depth * 0.20;
            scale = 0.325 + depth * 0.225;

            if (focusedIdx === i) {
              opacity = 1;
              scale = (1.0 + depth * 0.45) * FOCUS_SCALE_BOOST;
            } else {
              if (pointer) {
                // Hover-radius is in unscaled local coords; pointer is
                // converted to the same space in handlePointerMove, so a
                // direct distance check works across globe scales.
                const dx = pointer.x - sx;
                const dy = pointer.y - sy;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const HOVER_R = iconSize * 0.7;
                if (dist < HOVER_R) {
                  const strength = 1 - dist / HOVER_R;
                  // Ramp up to 0.4 at center.
                  opacity = Math.max(opacity, 0.25 + strength * 0.15);
                }
              }
              if (node.id && wiggleEnvRef.current.id === node.id) {
                const env = wiggleEnvRef.current;
                const elapsed = performance.now() - env.startedAt;
                const inEnd = env.fadeInMs;
                const holdEnd = env.fadeInMs + env.rotateMs;
                const outEnd = holdEnd + env.fadeOutMs;
                let envStrength = 0;
                if (elapsed >= 0 && elapsed < inEnd) {
                  envStrength = easeInOutCubic(elapsed / inEnd);
                } else if (elapsed >= inEnd && elapsed < holdEnd) {
                  envStrength = 1;
                } else if (elapsed >= holdEnd && elapsed < outEnd) {
                  envStrength = 1 - easeInOutCubic((elapsed - holdEnd) / env.fadeOutMs);
                }
                if (envStrength > 0) {
                  opacity = Math.max(opacity, 0.25 + envStrength * 0.15);
                }
              }
            }
          } else {
            opacity = depth * 0.25;
            scale = 0.3 + depth * 0.25;
            if (pointer) {
              const dx = pointer.x - sx;
              const dy = pointer.y - sy;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < HOVER_RADIUS) {
                const hoverStrength = 1 - distance / HOVER_RADIUS;
                opacity += hoverStrength * HOVER_OPACITY_BOOST;
                scale += hoverStrength * HOVER_SCALE_BOOST;
              }
            }
          }

          homePos.push({ sx, sy, z, scale, opacity, depth });
        } else {
          homePos.push(null);
        }
      }

      // Physics pass — only when in cluster mode (nodePositions set).
      if (usingPhysics) {
        const SPRING = 7;
        const DAMPING = 5.5;
        const REPEL = 380;
        const focusedCollideR = iconSize * 0.95;
        const tierCollideR = iconSize * 0.55;

        // Spring + damping toward home (offset → 0).
        for (let i = 0; i < homePos.length; i++) {
          const home = homePos[i];
          const node = nodes[i];
          if (!home || !node?.id) continue;
          let p = physics.get(node.id);
          if (!p) {
            p = { ox: 0, oy: 0, vx: 0, vy: 0 };
            physics.set(node.id, p);
          }
          if (focusedIdx === i) {
            p.ox = 0;
            p.oy = 0;
            p.vx = 0;
            p.vy = 0;
            continue;
          }
          p.vx += -SPRING * p.ox * physDt - DAMPING * p.vx * physDt;
          p.vy += -SPRING * p.oy * physDt - DAMPING * p.vy * physDt;
        }

        // Pairwise repulsion when invisible collision bounds overlap.
        for (let i = 0; i < homePos.length; i++) {
          const ha = homePos[i];
          const na = nodes[i];
          if (!ha || !na?.id) continue;
          const pa = physics.get(na.id);
          if (!pa) continue;
          const ra = focusedIdx === i ? focusedCollideR : tierCollideR;
          for (let j = i + 1; j < homePos.length; j++) {
            const hb = homePos[j];
            const nb = nodes[j];
            if (!hb || !nb?.id) continue;
            const pb = physics.get(nb.id);
            if (!pb) continue;
            const rb = focusedIdx === j ? focusedCollideR : tierCollideR;
            const ax = ha.sx + pa.ox;
            const ay = ha.sy + pa.oy;
            const bx = hb.sx + pb.ox;
            const by = hb.sy + pb.oy;
            const ddx = ax - bx;
            const ddy = ay - by;
            const d2 = ddx * ddx + ddy * ddy;
            const minD = ra + rb;
            if (d2 < minD * minD && d2 > 0.01) {
              const dist = Math.sqrt(d2);
              const overlap = minD - dist;
              const nx = ddx / dist;
              const ny = ddy / dist;
              const force = overlap * REPEL;
              if (focusedIdx !== i) {
                pa.vx += nx * force * physDt;
                pa.vy += ny * force * physDt;
              }
              if (focusedIdx !== j) {
                pb.vx -= nx * force * physDt;
                pb.vy -= ny * force * physDt;
              }
            }
          }
        }

        // Integrate offsets.
        for (let i = 0; i < homePos.length; i++) {
          const node = nodes[i];
          if (!node?.id) continue;
          const p = physics.get(node.id);
          if (!p) continue;
          if (focusedIdx === i) continue;
          p.ox += p.vx * physDt;
          p.oy += p.vy * physDt;
        }

        // Bounce icons off the keep-out zones (header above, search bar
        // and footer below). Boundaries are given in viewport pixels;
        // convert into the local container coordinate by accounting for
        // the live CSS transform: scale.
        const containerRect = container.getBoundingClientRect();
        const visScale =
          containerRect.width / Math.max(1, container.offsetWidth);
        const containerTopVy = containerRect.top;
        // local_y where viewport_y = vy: vy = containerTopVy + sy *
        // visScale → sy = (vy - containerTopVy) / visScale.
        const topBoundLocal = (keepOutTopVy - containerTopVy) / visScale;
        const bottomBoundLocal =
          (keepOutBottomVy - containerTopVy) / visScale;
        const containerLeftVx = containerRect.left;
        const leftBoundLocal = (12 - containerLeftVx) / visScale;
        const rightBoundLocal =
          (window.innerWidth - 12 - containerLeftVx) / visScale;
        const halfIcon = iconSize * 0.4;
        const BOUNCE_DAMP = -0.4;
        for (let i = 0; i < homePos.length; i++) {
          const home = homePos[i];
          const node = nodes[i];
          if (!home || !node?.id) continue;
          if (focusedIdx === i) continue;
          const p = physics.get(node.id);
          if (!p) continue;
          const px = home.sx + p.ox;
          const py = home.sy + p.oy;
          if (py - halfIcon < topBoundLocal) {
            p.oy = topBoundLocal + halfIcon - home.sy;
            if (p.vy < 0) p.vy *= BOUNCE_DAMP;
          }
          if (py + halfIcon > bottomBoundLocal) {
            p.oy = bottomBoundLocal - halfIcon - home.sy;
            if (p.vy > 0) p.vy *= BOUNCE_DAMP;
          }
          if (px - halfIcon < leftBoundLocal) {
            p.ox = leftBoundLocal + halfIcon - home.sx;
            if (p.vx < 0) p.vx *= BOUNCE_DAMP;
          }
          if (px + halfIcon > rightBoundLocal) {
            p.ox = rightBoundLocal - halfIcon - home.sx;
            if (p.vx > 0) p.vx *= BOUNCE_DAMP;
          }
        }
      }

      // Cursor-attraction gate — only attract when the pointer is inside
      // the cluster region (a disc around the focused logo). Outside that
      // disc, attraction targets relax to 0 and icons spring back home.
      let pointerInCluster = false;
      if (usingSearch && focusedIdx >= 0 && pointer && !isDragging) {
        const fp = homePos[focusedIdx];
        if (fp) {
          const ddx = pointer.x - fp.sx;
          const ddy = pointer.y - fp.sy;
          const CLUSTER_RADIUS = 220;
          pointerInCluster =
            ddx * ddx + ddy * ddy < CLUSTER_RADIUS * CLUSTER_RADIUS;
        }
      }

      // Render pass.
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const home = homePos[i];
        if (!home) {
          child.style.opacity = "0";
          child.style.pointerEvents = "none";
          continue;
        }
        const node = nodes[i];
        let ox = 0;
        let oy = 0;
        if (usingPhysics && node?.id) {
          const p = physics.get(node.id);
          if (p) {
            ox = p.ox;
            oy = p.oy;
          }
        }
        // Cursor attraction — non-focused cluster icons drift subtly
        // toward the cursor. Smoothed each frame for a soft, springy
        // feel rather than a snap. Focused icon never moves.
        let ax = 0;
        let ay = 0;
        if (usingSearch && node?.id) {
          const isFocused = focusedIdx === i;
          let entry = attractRef.current.get(node.id);
          if (!entry) {
            entry = { ax: 0, ay: 0 };
            attractRef.current.set(node.id, entry);
          }
          let targetAx = 0;
          let targetAy = 0;
          if (!isFocused && pointerInCluster && pointer) {
            const dx = pointer.x - (home.sx + ox);
            const dy = pointer.y - (home.sy + oy);
            const dist = Math.sqrt(dx * dx + dy * dy);
            const REACH = 220;
            if (dist < REACH && dist > 0.01) {
              const fall = 1 - dist / REACH;
              const mag = Math.min(18, dist * 0.22) * fall;
              targetAx = (dx / dist) * mag;
              targetAy = (dy / dist) * mag;
            }
          }
          entry.ax += (targetAx - entry.ax) * 0.14;
          entry.ay += (targetAy - entry.ay) * 0.14;
          ax = entry.ax;
          ay = entry.ay;
        }
        const finalSx = home.sx + ox + ax;
        const finalSy = home.sy + oy + ay;
        // Translate on the button (preserves the full iconSize click hit
        // area), scale on the inner wrapper.
        child.style.transform = `translate(${finalSx - iconSize / 2}px, ${finalSy - iconSize / 2}px)`;
        child.style.opacity = `${home.opacity}`;
        child.style.zIndex = focusedIdx === i ? "5" : "1";
        child.style.pointerEvents = interactive ? "auto" : "none";
        const scaleWrap = child.firstElementChild as HTMLElement | null;
        if (scaleWrap) scaleWrap.style.transform = `scale(${home.scale})`;
      }

      if (isDragging) {
        dragNearestIdxRef.current = nearestI;
        const nearestId = nearestI >= 0 ? nodes[nearestI].id ?? null : null;
        if (nearestId !== lastReportedHighlightRef.current) {
          lastReportedHighlightRef.current = nearestId;
          onDragHighlightRef.current?.(nearestId);
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [
    mode,
    nodes,
    focusedIdx,
    iconSize,
    interactive,
    radiusScale,
    jitterAmplitude,
    nodePositions,
  ]);

  // ------- Pointer interaction (drag-to-rotate, only when draggable) -------
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragEnabled) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;
    // Don't initiate a drag from a pointerdown on an icon button — let the
    // button handle the click. Drag only engages on the empty globe area.
    const target = event.target as HTMLElement | null;
    if (target?.closest("button[data-globe-icon]")) return;
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      basePhi: phiRef.current,
      baseTheta: thetaRef.current,
      lastX: event.clientX,
      lastY: event.clientY,
      moved: false,
      pointerId: event.pointerId,
    };
    velPhiRef.current = 0;
    velThetaRef.current = 0;
    dragNearestIdxRef.current = -1;
    lastReportedHighlightRef.current = null;
    setGrabbing(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragEnabled) {
      const drag = dragRef.current;
      if (drag && event.pointerId === drag.pointerId) {
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          drag.moved = true;
          userPannedRef.current = true;
        }
        const container = containerRef.current;
        const size = container?.offsetWidth ?? 800;
        const sensitivity = (Math.PI * 1.4) / size;
        let nextPhi = drag.basePhi + dx * sensitivity;
        let nextTheta = clamp(
          drag.baseTheta + dy * sensitivity,
          -Math.PI / 2 + 0.05,
          Math.PI / 2 - 0.05,
        );

        // Drag bounds — clamp phi/theta so the focused logo (lat=0,
        // lon=0) stays at least `dragMarginPx` from every viewport edge.
        // Skipped when no margin is set.
        if (dragMarginPx != null && container) {
          const rect = container.getBoundingClientRect();
          const visScale = rect.width / Math.max(1, size);
          const r = size * 0.45 * radiusScale;
          // The lat=0, lon=0 point at phi=0, theta=0 is the centre of
          // the container at (size/2, size/2). The viewport position of
          // that centre maps to (rect.left + width/2, rect.top + height/2).
          const cxVp = rect.left + rect.width / 2;
          const cyVp = rect.top + rect.height / 2;
          // Focused projection (see code below): viewport offsets from
          //   centre are
          //     dx_vp = sin(phi) * r * visScale
          //     dy_vp = cos(phi) * sin(theta) * r * visScale
          // Bound the available horizontal travel by the closer edge.
          const horizBudget = Math.min(
            cxVp - dragMarginPx,
            window.innerWidth - dragMarginPx - cxVp,
          );
          const sinPhiMax = Math.min(
            1,
            Math.max(0, horizBudget / Math.max(1, r * visScale)),
          );
          if (Math.abs(Math.sin(nextPhi)) > sinPhiMax) {
            nextPhi = Math.sign(Math.sin(nextPhi)) * Math.asin(sinPhiMax);
          }
          const cosP = Math.cos(nextPhi);
          const vertBudget = Math.min(
            cyVp - dragMarginPx,
            window.innerHeight - dragMarginPx - cyVp,
          );
          const sinThetaMax = Math.min(
            1,
            Math.max(
              0,
              vertBudget / Math.max(1, r * visScale * Math.max(0.05, cosP)),
            ),
          );
          if (Math.abs(Math.sin(nextTheta)) > sinThetaMax) {
            nextTheta =
              Math.sign(Math.sin(nextTheta)) * Math.asin(sinThetaMax);
          }
        }

        phiRef.current = nextPhi;
        thetaRef.current = nextTheta;
        velPhiRef.current = (event.clientX - drag.lastX) * sensitivity * 0.6;
        velThetaRef.current = (event.clientY - drag.lastY) * sensitivity * 0.6;
        drag.lastX = event.clientX;
        drag.lastY = event.clientY;
      }
    }
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    // The container is CSS-scaled (idleScale / searchScale), so its bounding
    // rect is in scaled viewport pixels. The animation loop works in
    // unscaled local coords (cx = container.offsetWidth/2, etc.), so divide
    // out the scale to keep pointer math precise.
    const visScale = rect.width / Math.max(1, container.offsetWidth);
    pointerRef.current = {
      x: (event.clientX - rect.left) / visScale,
      y: (event.clientY - rect.top) / visScale,
    };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragEnabled) return;
    const drag = dragRef.current;
    if (drag && event.pointerId === drag.pointerId) {
      const moved = drag.moved;
      const nearestIdx = dragNearestIdxRef.current;
      dragRef.current = null;
      setGrabbing(false);
      userPannedRef.current = false;
      velPhiRef.current = 0;
      velThetaRef.current = 0;
      if (moved) {
        const id = nearestIdx >= 0 ? nodes[nearestIdx]?.id ?? null : null;
        onDragReleaseRef.current?.(id);
      }
      lastReportedHighlightRef.current = null;
      dragNearestIdxRef.current = -1;
    }
  };

  // Search-mode zoom on the container — applied via CSS transform with
  // smooth easing so the existing globe (same nodes) appears to "lean in".
  const containerScale = mode === "search" ? searchScale : idleScale;

  const preloadSrcs = useMemo(() => Array.from(new Set(DEFAULT_IDLE_SRCS)), []);

  return (
    <>
      {preloadSrcs.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
          pointerEvents: interactive ? "auto" : "none",
          zIndex: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: dragEnabled
            ? grabbing
              ? "grabbing"
              : "grab"
            : "default",
          touchAction: dragEnabled ? "none" : "auto",
          userSelect: "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onMouseLeave={() => {
          pointerRef.current = null;
        }}
      >
        <div
          ref={containerRef}
          style={{
            position: "relative",
            width: "min(118vh, 1080px)",
            height: "min(118vh, 1080px)",
            flexShrink: 0,
            transform: `scale(${containerScale})`,
            transformOrigin: "center",
            transition: "transform 620ms cubic-bezier(0.65, 0, 0.35, 1)",
            willChange: "transform",
          }}
        >
          <div
            ref={overlayRef}
            style={{ position: "absolute", inset: 0 }}
          >
            {nodes.map((node, i) =>
              node.id ? (
                <button
                  key={node.id}
                  type="button"
                  data-globe-icon="true"
                  aria-label={`Open ${node.id}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    const drag = dragRef.current;
                    if (drag?.moved) return;
                    onIconClick?.(node.id!);
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: iconSize,
                    height: iconSize,
                    opacity: 0,
                    padding: 0,
                    background: "transparent",
                    border: "none",
                    cursor: interactive ? "pointer" : "default",
                    willChange: "transform, opacity",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      width: iconSize,
                      height: iconSize,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transformOrigin: "center",
                      willChange: "transform",
                      transition:
                        "transform 380ms cubic-bezier(0.16, 1, 0.3, 1)",
                      pointerEvents: "none",
                    }}
                  >
                    <span
                      data-wiggle-target="true"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transformOrigin: "center",
                        willChange: "transform",
                      }}
                    >
                      <SolidLogo id={node.id} size={iconSize} />
                    </span>
                  </div>
                </button>
              ) : (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: iconSize,
                    height: iconSize,
                    opacity: 0,
                    willChange: "transform, opacity",
                  }}
                >
                  <div
                    style={{
                      width: iconSize,
                      height: iconSize,
                      backgroundImage: `url(${node.src})`,
                      backgroundSize: "contain",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                      transformOrigin: "center",
                      willChange: "transform",
                    }}
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}


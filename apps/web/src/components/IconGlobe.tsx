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
}: IconGlobeProps = {}) {
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
  // React-driven cursor state (drives `cursor: grab/grabbing`).
  const [grabbing, setGrabbing] = useState(false);

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

  // Tracks whether the user has manually dragged after the most recent change
  // to focusedId. While true, we suspend the auto-focus easing so manual
  // exploration isn't fought by the spring snapping back. Reset whenever
  // focusedId itself changes — but never during an active drag (the drag
  // updates focusedId via onDragHighlight, and we don't want that to
  // engage easing mid-drag).
  const userPannedRef = useRef(false);
  useEffect(() => {
    if (dragRef.current !== null) return;
    userPannedRef.current = false;
  }, [focusedId]);

  // Per-icon physics offset from its home (lat/lon) projection. Used in
  // cluster mode so icons gently float, bump into each other and settle
  // back rather than locking onto fixed lat/lon points. The collision
  // radius is larger than the visual radius — the user wanted invisible
  // bounding boxes interacting, not the visible logos themselves.
  const physicsRef = useRef<
    Map<string, { ox: number; oy: number; vx: number; vy: number }>
  >(new Map());
  const lastPhysicsTickRef = useRef<number | null>(null);

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

      // Target rotation — in search mode, focusedIdx (if any) drives phi/theta
      // toward bringing that node to the front. In idle, target phi just
      // increments and target theta returns to the base tilt.
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

            // Ease theta toward the target latitude so the focused icon
            // lands at the dead centre of the screen — both axes animate.
            const dTheta = targetLatR - thetaRef.current;
            thetaRef.current += dTheta * 0.08;

            velPhiRef.current = 0;
            velThetaRef.current = 0;
          } else if (focusedIdx >= 0 && userPannedRef.current) {
            // User has explored away from the focused match — apply inertia
            // decay only, leaving manual position alone.
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
          // Idle mode — continuous spin + base tilt.
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

      // While dragging, track the front-facing icon nearest the screen
      // centre. Reported via onDragHighlight as it changes, and snapshotted
      // for onDragRelease.
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
        if (jitterAmplitude > 0) {
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
            opacity = 0.2 + depth * 0.3;
            scale = 0.325 + depth * 0.225;

            if (focusedIdx === i) {
              opacity = 1;
              scale = (1.0 + depth * 0.45) * FOCUS_SCALE_BOOST;
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
        const finalSx = home.sx + ox;
        const finalSy = home.sy + oy;
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

  // ------- Pointer interaction (drag-to-rotate, only when interactive) -------
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;
    // Don't initiate a drag from a pointerdown that landed directly on
    // an icon button — let the button handle the click without the
    // outer drag tracker stealing focus or interfering. Drag only
    // engages when the user grabs the empty globe area.
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
    if (interactive) {
      const drag = dragRef.current;
      if (drag && event.pointerId === drag.pointerId) {
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          drag.moved = true;
          userPannedRef.current = true;
        }
        const size = containerRef.current?.offsetWidth ?? 800;
        const sensitivity = (Math.PI * 1.4) / size;
        // Drag direction follows the cursor — drag right rotates the
        // globe surface to the right (the icon under the cursor moves
        // with the cursor). Vertical convention was already cursor-
        // following so it stays as-is.
        phiRef.current = drag.basePhi + dx * sensitivity;
        thetaRef.current = clamp(
          drag.baseTheta + dy * sensitivity,
          -Math.PI / 2 + 0.05,
          Math.PI / 2 - 0.05,
        );
        velPhiRef.current = (event.clientX - drag.lastX) * sensitivity * 0.6;
        velThetaRef.current = (event.clientY - drag.lastY) * sensitivity * 0.6;
        drag.lastX = event.clientX;
        drag.lastY = event.clientY;
      }
    }
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const drag = dragRef.current;
    if (drag && event.pointerId === drag.pointerId) {
      const moved = drag.moved;
      const nearestIdx = dragNearestIdxRef.current;
      dragRef.current = null;
      setGrabbing(false);
      // Reset userPanned so the snap easing engages on the next frame.
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
          cursor: interactive ? (grabbing ? "grabbing" : "grab") : "default",
          touchAction: interactive ? "none" : "auto",
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
                    <SolidLogo id={node.id} size={iconSize} />
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

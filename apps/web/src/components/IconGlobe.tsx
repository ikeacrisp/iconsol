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
const DEFAULT_ICON_SIZE = 24;
const FOCUS_SCALE_BOOST = 1.7;
const SPIN_SPEED = 0.002;
const TILT = 0.18;
const HOVER_RADIUS = 28;
const HOVER_OPACITY_BOOST = 0.18;
const HOVER_SCALE_BOOST = 0.08;

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
      const positions = fibonacciNodes(icons.length);
      return positions.map((p, i) => ({ ...p, id: icons[i].id }));
    }
    const positions = fibonacciNodes(FALLBACK_NODE_COUNT);
    return positions.map((p, i) => ({
      ...p,
      src: DEFAULT_IDLE_SRCS[i % DEFAULT_IDLE_SRCS.length],
    }));
  }, [icons]);

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

        const child = children[i];
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
            // Same depth-based fade as idle so background icons fade in/out
            // gracefully as they rotate around — only the focused match is
            // pinned at full opacity.
            opacity = depth * 0.25;
            scale = 0.6 + depth * 0.5;

            if (focusedIdx === i) {
              opacity = 1;
              scale = (0.85 + depth * 0.45) * FOCUS_SCALE_BOOST;
            }
          } else {
            opacity = depth * 0.25;
            scale = 0.6 + depth * 0.5;
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

          child.style.transform = `translate(${sx - iconSize / 2}px, ${sy - iconSize / 2}px) scale(${scale})`;
          child.style.opacity = `${opacity}`;
          child.style.zIndex = focusedIdx === i ? "5" : "1";
          child.style.pointerEvents = interactive ? "auto" : "none";
        } else {
          child.style.opacity = "0";
          child.style.pointerEvents = "none";
        }
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
  }, [mode, nodes, focusedIdx, iconSize, interactive, radiusScale, jitterAmplitude]);

  // ------- Pointer interaction (drag-to-rotate, only when interactive) -------
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    if (event.button !== 0 && event.pointerType === "mouse") return;
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
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // ignore
    }
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
        phiRef.current = drag.basePhi - dx * sensitivity;
        thetaRef.current = clamp(
          drag.baseTheta + dy * sensitivity,
          -Math.PI / 2 + 0.05,
          Math.PI / 2 - 0.05,
        );
        velPhiRef.current = (drag.lastX - event.clientX) * sensitivity * 0.6;
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
      try {
        (event.currentTarget as HTMLElement).releasePointerCapture(
          event.pointerId,
        );
      } catch {
        // ignore
      }
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
                  <SolidLogo id={node.id} size={iconSize} />
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

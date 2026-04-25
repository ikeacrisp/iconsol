"use client";

import { useEffect, useMemo, useRef } from "react";

const ICONS = [
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

// Unique icon set — used both by the globe nodes and the preloader below.
// Rendering <link rel="preload" as="image"> for each URL is hoisted into
// <head> by React 19 so the browser starts fetching the SVGs immediately
// during initial HTML parsing, well before the globe mounts.
const UNIQUE_ICONS = Array.from(new Set(ICONS));

const NODE_COUNT = 80;
const ICON_SIZE = 24;
const THETA = 0.18;
const SPIN_SPEED = 0.002;
const HOVER_RADIUS = 28;
const HOVER_OPACITY_BOOST = 0.18;
const HOVER_SCALE_BOOST = 0.08;

interface Node {
  lat: number;
  lon: number;
  icon: string;
}

function generateNodes(): Node[] {
  const nodes: Node[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < NODE_COUNT; i++) {
    const y = 1 - (i / (NODE_COUNT - 1)) * 2;
    const angle = goldenAngle * i;
    const lat = Math.asin(y) * (180 / Math.PI);
    const lon = ((angle * 180) / Math.PI) % 360 - 180;
    nodes.push({ lat, lon, icon: ICONS[i % ICONS.length] });
  }
  return nodes;
}

export function IconGlobe({ iconSize = ICON_SIZE }: { iconSize?: number } = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef(0);
  const rafRef = useRef(0);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  const nodes = useMemo(() => generateNodes(), []);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;
    if (!container || !overlay) return;

    const children = overlay.children as HTMLCollectionOf<HTMLElement>;

    const animate = () => {
      phiRef.current += SPIN_SPEED;

      const size = container.offsetWidth;
      const r = size * 0.45;
      const cx = size / 2;
      const cy = size / 2;
      const phi = phiRef.current;
      const pointer = pointerRef.current;

      for (let i = 0; i < children.length; i++) {
        const node = nodes[i];
        const latR = (node.lat * Math.PI) / 180;
        const lonR = (node.lon * Math.PI) / 180;

        const x = Math.cos(latR) * Math.sin(lonR + phi);
        const y =
          Math.sin(latR) * Math.cos(THETA) -
          Math.cos(latR) * Math.cos(lonR + phi) * Math.sin(THETA);
        const z =
          Math.sin(latR) * Math.sin(THETA) +
          Math.cos(latR) * Math.cos(lonR + phi) * Math.cos(THETA);

        const sx = cx + x * r;
        const sy = cy - y * r;

        if (z > 0) {
          const depth = z;
          let opacity = depth * 0.25;
          let scale = 0.6 + depth * 0.5;

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

          children[i].style.transform = `translate(${sx - ICON_SIZE / 2}px, ${sy - ICON_SIZE / 2}px) scale(${scale})`;
          children[i].style.opacity = `${opacity}`;
        } else {
          children[i].style.opacity = "0";
        }
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafRef.current);
  }, [nodes]);

  return (
    <>
      {UNIQUE_ICONS.map((src) => (
        <link key={src} rel="preload" as="image" href={src} />
      ))}
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "visible",
        pointerEvents: "auto",
        zIndex: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseMove={(event) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        pointerRef.current = {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        };
      }}
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
          transform: "scale(1.14)",
          transformOrigin: "center",
        }}
      >
        <div
          ref={overlayRef}
          style={{ position: "absolute", inset: 0 }}
        >
          {nodes.map((node, i) => (
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
                  backgroundImage: `url(${node.icon})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}

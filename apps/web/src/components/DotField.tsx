"use client";

import { useEffect, useRef } from "react";

type DotFieldProps = {
  spacing?: number;
  radius?: number;
  baseAlpha?: number;
  pulseAmp?: number;
  color?: string;
  attractRadius?: number;
  attractStrength?: number;
  scaleAmp?: number;
  maskImage?: string;
};

// Deterministic 0..1 hash from two integers + a seed. Used so every DotField
// instance derives the same per-dot params from the same global (col,row) —
// which means two overlapping canvases render identical dots, eliminating
// any visible discontinuity where they overlap (e.g. the progressive-blur
// mask regions on the dashboard).
const hash2 = (x: number, y: number, seed: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return h - Math.floor(h);
};

export function DotField({
  spacing = 20,
  radius = 0.9,
  baseAlpha = 0.024,
  pulseAmp = 0.014,
  color = "255, 255, 255",
  attractRadius = 200,
  attractStrength = 1.6,
  scaleAmp = 0.4,
  maskImage,
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    type Dot = {
      // screen-space (canvas-local) position, recomputed on rebuild
      x: number;
      y: number;
      // deterministic params derived from global (col,row)
      phase: number;
      freq: number;
      baseVar: number;
      scalePhase: number;
      scaleFreq: number;
      // per-instance eased cursor offset
      offX: number;
      offY: number;
    };
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let mouseX = -1e6;
    let mouseY = -1e6;
    let hasMouse = false;

    const rebuild = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Anchor the grid to the viewport (0,0) so two overlapping DotField
      // canvases — one full-viewport, one clipped to a mask region — place
      // dots at exactly the same screen coordinates.
      const viewportOffsetX = rect.left;
      const viewportOffsetY = rect.top;

      const startCol = Math.floor(viewportOffsetX / spacing) - 1;
      const startRow = Math.floor(viewportOffsetY / spacing) - 1;
      const endCol = Math.ceil((viewportOffsetX + width) / spacing) + 1;
      const endRow = Math.ceil((viewportOffsetY + height) / spacing) + 1;

      const next: Dot[] = [];
      for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
          const h1 = hash2(col, row, 1); // phase 0..1
          const h2 = hash2(col, row, 2); // freq lerp 0..1
          const h3 = hash2(col, row, 3); // baseVar 0..1
          const h4 = hash2(col, row, 4); // scalePhase 0..1
          const h5 = hash2(col, row, 5); // scaleFreq lerp 0..1
          next.push({
            x: col * spacing - viewportOffsetX,
            y: row * spacing - viewportOffsetY,
            phase: h1 * Math.PI * 2,
            freq: 0.16 + h2 * 0.2,
            baseVar: (h3 - 0.5) * 0.022,
            scalePhase: h4 * Math.PI * 2,
            scaleFreq: 0.08 + h5 * 0.16,
            offX: 0,
            offY: 0,
          });
        }
      }
      dots = next;
    };

    rebuild();
    const ro = new ResizeObserver(rebuild);
    ro.observe(canvas);
    // Rebuild on viewport resize only. Scroll doesn't shift the grid relative
    // to the viewport in this layout (the canvases are fixed/absolute within
    // their blocks), so skipping a per-scroll rebuild removes a significant
    // source of main-thread work during scroll.
    const onResize = () => rebuild();
    window.addEventListener("resize", onResize);

    let lastMoveAt = -1e6;
    let moveActivity = 0;
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      hasMouse = true;
      lastMoveAt = performance.now();
      moveActivity = 1;
    };
    const onLeave = () => {
      hasMouse = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerleave", onLeave);

    let rafId = 0;
    // Shared wall-clock time source so overlapping instances pulse in phase.
    const EASE = 0.08;
    const loop = () => {
      const t = performance.now() / 1000;
      ctx.clearRect(0, 0, width, height);

      const attractR2 = attractRadius * attractRadius;
      const amp = reduce ? 0 : pulseAmp;
      const sAmp = reduce ? 0 : scaleAmp;
      const strength = reduce ? 0 : attractStrength;

      // Activity fades out when the cursor stops moving so dots ease back
      // to their resting positions rather than staying warped under a
      // stationary cursor.
      const sinceMove = (performance.now() - lastMoveAt) / 1000;
      const targetActivity = sinceMove < 0.08 ? 1 : 0;
      moveActivity += (targetActivity - moveActivity) * 0.12;
      const activity = moveActivity;

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const pulse = amp ? Math.sin(t * d.freq * Math.PI * 2 + d.phase) * amp : 0;
        const alpha = baseAlpha + d.baseVar + pulse;

        let targetOffX = 0;
        let targetOffY = 0;

        if (hasMouse && strength > 0 && activity > 0.01) {
          const dx = d.x - mouseX;
          const dy = d.y - mouseY;
          const r2 = dx * dx + dy * dy;
          if (r2 < attractR2 && r2 > 0.0001) {
            const dist = Math.sqrt(r2);
            const falloff = 1 - dist / attractRadius;
            const pull = strength * falloff * falloff * activity;
            targetOffX = -(dx / dist) * pull;
            targetOffY = -(dy / dist) * pull;
          }
        }

        d.offX += (targetOffX - d.offX) * EASE;
        d.offY += (targetOffY - d.offY) * EASE;

        if (alpha <= 0.002) continue;

        const scaleOsc = sAmp
          ? 1 + Math.sin(t * d.scaleFreq * Math.PI * 2 + d.scalePhase) * sAmp
          : 1;
        const r = radius * scaleOsc;

        ctx.fillStyle = `rgba(${color},${Math.min(alpha, 1).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(d.x + d.offX, d.y + d.offY, r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [
    spacing,
    radius,
    baseAlpha,
    pulseAmp,
    color,
    attractRadius,
    attractStrength,
    scaleAmp,
  ]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        display: "block",
        ...(maskImage
          ? {
              maskImage,
              WebkitMaskImage: maskImage,
            }
          : {}),
      }}
    />
  );
}

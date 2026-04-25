"use client";

import { useEffect, useRef } from "react";

type CodeCopyRippleProps = {
  /**
   * Incrementing counter. Each change re-triggers the ripple.
   * Use `0` for the initial mount and bump it on copy.
   */
  trigger: number;
  /**
   * Optional origin point (in canvas-local px). Defaults to the top-right
   * area where the copy button sits.
   */
  origin?: { x: number; y: number };
};

const hash2 = (x: number, y: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
};

/**
 * Renders a short dithered-pixel wave expanding from a point, used as a
 * copy-success flourish over the code panel. Draws to a canvas overlay at
 * `mix-blend-mode: overlay` so it plays nicely with syntax colors underneath.
 * Self-terminates after one sweep.
 */
export function CodeCopyRipple({ trigger, origin }: CodeCopyRippleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const CELL = 5;
    const cols = Math.ceil(rect.width / CELL) + 1;
    const rows = Math.ceil(rect.height / CELL) + 1;

    // Default origin: copy button center (top-right, 8px inset, 36px button)
    const ox = origin?.x ?? Math.max(0, rect.width - 26);
    const oy = origin?.y ?? 26;

    const maxRadius =
      Math.hypot(
        Math.max(ox, rect.width - ox),
        Math.max(oy, rect.height - oy)
      ) + 40;
    const duration = reduce ? 320 : 780;
    const bandWidth = 110;

    const start = performance.now();
    let rafId = 0;
    const loop = () => {
      const now = performance.now();
      const t = (now - start) / duration;
      if (t >= 1) {
        ctx.clearRect(0, 0, rect.width, rect.height);
        return;
      }

      const waveRadius = t * maxRadius;
      // Fades the whole wave as it travels out so the far edge is softer.
      const globalFade = 1 - t * 0.4;

      ctx.clearRect(0, 0, rect.width, rect.height);

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cx = c * CELL + CELL / 2;
          const cy = r * CELL + CELL / 2;
          const dist = Math.hypot(cx - ox, cy - oy);
          const distFromWave = Math.abs(dist - waveRadius);
          if (distFromWave > bandWidth / 2) continue;

          // Proximity 0..1, highest on the wave crest
          const proximity = 1 - distFromWave / (bandWidth / 2);
          // Stable per-cell noise so cells don't flicker frame-to-frame
          const n = hash2(c, r);
          // Threshold so cells dither on/off based on how close to the crest
          // they are — dense in the middle, sparse at the leading/trailing
          // edges of the band.
          if (n > proximity * 0.92) continue;

          const alpha = proximity * 0.42 * globalFade;
          ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          ctx.fillRect(c * CELL, r * CELL, CELL - 1, CELL - 1);
        }
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(rafId);
  }, [trigger, origin]);

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
        zIndex: 1,
        mixBlendMode: "overlay",
      }}
    />
  );
}

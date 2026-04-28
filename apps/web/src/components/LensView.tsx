"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionValueEvent,
} from "motion/react";
import { useRouter } from "next/navigation";
import { useSound } from "@web-kits/audio/react";
import type { Icon } from "@/lib/icon-data";
import { SolidLogo } from "@/components/BrandLogo";
import { HomeSearchBar } from "@/components/HomeSearchBar";
import { hover, sync } from "@/lib/audio/core";

// -------------------------------------------------------------------
// Lens model — magnifying glass over an infinite hex grid.
//
// • The focused icon is ALWAYS painted at viewport centre.
// • The grid is panned by drag (pointer down + drag), not cursor hover.
// • A circular CSS mask clips the grid so only the lens FOV is visible.
// • Focus snaps to the cell nearest viewport centre on drag release.
// • Each axial coord (q, r) maps deterministically to an icon index via
//   a small-prime + wrap mapping, so the grid feels infinite while
//   never showing duplicates within a single visible disk.
// -------------------------------------------------------------------

const HEX_RADIUS = 56;
const SPACING_X = Math.sqrt(3) * HEX_RADIUS;
const SPACING_Y = 1.5 * HEX_RADIUS;
const ICON_SIZE = 64;
const MAX_RING = 4;
const FOCUS_SCALE = 1.6;
const FOV_RADIUS_PX = 320; // visible lens radius

// Wrap window — large enough that visible disk (radius 4) never wraps.
const WRAP_Q = 9;
const WRAP_R = 9;

const RING_DECAY: Array<{ scale: number; opacity: number }> = [
  { scale: FOCUS_SCALE, opacity: 1.0 },
  { scale: 0.78, opacity: 0.7 },
  { scale: 0.6, opacity: 0.42 },
  { scale: 0.45, opacity: 0.22 },
  { scale: 0.32, opacity: 0.1 },
];

function ringIndex(q: number, r: number): number {
  return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
}

function iconIndexAt(q: number, r: number, total: number): number {
  const qw = ((q % WRAP_Q) + WRAP_Q) % WRAP_Q;
  const rw = ((r % WRAP_R) + WRAP_R) % WRAP_R;
  return (qw * 7 + rw * 13) % total;
}

function pixelToAxial(px: number, py: number): { q: number; r: number } {
  const q = (Math.sqrt(3) / 3) * (px / HEX_RADIUS) - (1 / 3) * (py / HEX_RADIUS);
  const r = (2 / 3) * (py / HEX_RADIUS);
  return cubeRound(q, r);
}

function cubeRound(qf: number, rf: number): { q: number; r: number } {
  const x = qf;
  const z = rf;
  const y = -x - z;
  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);
  const dx = Math.abs(rx - x);
  const dy = Math.abs(ry - y);
  const dz = Math.abs(rz - z);
  if (dx > dy && dx > dz) rx = -ry - rz;
  else if (dy > dz) ry = -rx - rz;
  else rz = -rx - ry;
  return { q: rx, r: rz };
}

interface VisibleCell {
  q: number;
  r: number;
  dq: number;
  dr: number;
  ring: number;
}

function visibleCellsAt(focusQ: number, focusR: number): VisibleCell[] {
  const cells: VisibleCell[] = [];
  for (let dq = -MAX_RING; dq <= MAX_RING; dq++) {
    const drMin = Math.max(-MAX_RING, -dq - MAX_RING);
    const drMax = Math.min(MAX_RING, -dq + MAX_RING);
    for (let dr = drMin; dr <= drMax; dr++) {
      cells.push({
        q: focusQ + dq,
        r: focusR + dr,
        dq,
        dr,
        ring: ringIndex(dq, dr),
      });
    }
  }
  return cells;
}

export function LensView({ icons }: { icons: Icon[] }) {
  const router = useRouter();
  const playHover = useSound(hover);
  const playSync = useSound(sync);

  const [focus, setFocus] = useState({ q: 0, r: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Layout offset = -focus.pixelPos. While dragging, additional drag
  // delta is applied raw (no spring) so it tracks the pointer 1:1.
  // On release, focus snaps to the cell at the new viewport centre and
  // the spring eases the layout into place.
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const springX = useSpring(offsetX, { stiffness: 220, damping: 26 });
  const springY = useSpring(offsetY, { stiffness: 220, damping: 26 });

  // While dragging we bypass the spring and write directly to springX/Y
  // for instant, snappy follow. We restore spring on release.
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    baseX: number;
    baseY: number;
  } | null>(null);

  // Sync layout target when focus settles (and user is not dragging).
  useEffect(() => {
    if (isDraggingRef.current) return;
    offsetX.set(-SPACING_X * (focus.q + focus.r / 2));
    offsetY.set(-SPACING_Y * focus.r);
  }, [focus, offsetX, offsetY]);

  // Track current visual offset (for click discrimination + focused cell
  // calculation during drag).
  const currentOffsetX = useRef(0);
  const currentOffsetY = useRef(0);
  useMotionValueEvent(springX, "change", (v) => {
    currentOffsetX.current = v;
  });
  useMotionValueEvent(springY, "change", (v) => {
    currentOffsetY.current = v;
  });

  const focusedIcon = useMemo(
    () => icons[iconIndexAt(focus.q, focus.r, icons.length)],
    [icons, focus],
  );

  // Visible cells expand around the live focus AND a buffer ring during
  // drag so cells flowing in from off-screen are already mounted.
  const visible = useMemo(
    () => visibleCellsAt(focus.q, focus.r),
    [focus],
  );

  // ----- Arrow-key navigation -----
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      let dq = 0;
      let dr = 0;
      switch (e.key) {
        case "ArrowLeft":
          dq = -1;
          break;
        case "ArrowRight":
          dq = 1;
          break;
        case "ArrowUp":
          dr = -1;
          break;
        case "ArrowDown":
          dr = 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      playHover();
      setFocus((prev) => ({ q: prev.q + dq, r: prev.r + dr }));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playHover]);

  // ----- Drag-to-pan -----
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      // Only drag with primary mouse button or touch
      if (event.button !== 0 && event.pointerType === "mouse") return;
      // Don't start drag if user clicked on a logo button
      const targetEl = event.target as HTMLElement;
      if (targetEl.closest('button[data-lens-icon="true"]')) return;

      isDraggingRef.current = true;
      dragStartRef.current = {
        pointerX: event.clientX,
        pointerY: event.clientY,
        baseX: offsetX.get(),
        baseY: offsetY.get(),
      };
      // Detach spring while dragging — write raw values for 1:1 follow.
      offsetX.jump(offsetX.get());
      offsetY.jump(offsetY.get());
      // Capture so we get pointermove / pointerup even off-element
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    },
    [offsetX, offsetY],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const start = dragStartRef.current;
      if (!isDraggingRef.current || !start) return;
      const dx = event.clientX - start.pointerX;
      const dy = event.clientY - start.pointerY;
      // Direct write — no spring during drag.
      offsetX.jump(start.baseX + dx);
      offsetY.jump(start.baseY + dy);
    },
    [offsetX, offsetY],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      dragStartRef.current = null;
      try {
        (event.currentTarget as HTMLElement).releasePointerCapture(
          event.pointerId,
        );
      } catch {
        // ignore
      }
      // Snap focus to the cell whose world position is now closest to
      // viewport centre. Since the layout is offset by (offsetX, offsetY),
      // the world coord at viewport centre is (-offsetX, -offsetY).
      const worldX = -offsetX.get();
      const worldY = -offsetY.get();
      const next = pixelToAxial(worldX, worldY);
      if (next.q !== focus.q || next.r !== focus.r) {
        playHover();
      }
      setFocus(next);
    },
    [offsetX, offsetY, focus, playHover],
  );

  // ----- Search -----
  const matchByQuery = useCallback(
    (q: string): { icon: Icon; q: number; r: number } | null => {
      if (!q) return null;
      const lower = q.toLowerCase();
      let best: { icon: Icon; rank: number; idx: number } | null = null;
      for (let i = 0; i < icons.length; i++) {
        const icon = icons[i];
        const name = icon.name.toLowerCase();
        const id = icon.id.toLowerCase();
        const ticker = icon.ticker?.toLowerCase() ?? "";
        let rank = -1;
        if (id === lower || ticker === lower || name === lower) rank = 0;
        else if (id.startsWith(lower) || ticker.startsWith(lower) || name.startsWith(lower))
          rank = 1;
        else if (
          id.includes(lower) ||
          name.includes(lower) ||
          ticker.includes(lower) ||
          icon.aliases.some((a) => a.toLowerCase().includes(lower))
        )
          rank = 2;
        if (rank >= 0 && (!best || rank < best.rank)) {
          best = { icon, rank, idx: i };
        }
      }
      if (!best) return null;
      for (let qw = 0; qw < WRAP_Q; qw++) {
        for (let rw = 0; rw < WRAP_R; rw++) {
          if (iconIndexAt(qw, rw, icons.length) === best.idx) {
            return { icon: best.icon, q: qw, r: rw };
          }
        }
      }
      return null;
    },
    [icons],
  );

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const m = matchByQuery(searchQuery.trim());
    if (m) setFocus({ q: m.q, r: m.r });
  }, [searchQuery, matchByQuery]);

  const handleSearchSubmit = useCallback(() => {
    const m = matchByQuery(searchQuery.trim());
    const target = m?.icon ?? focusedIcon;
    if (target) {
      playSync();
      router.push(`/icon/${target.id}`);
    }
  }, [matchByQuery, searchQuery, focusedIcon, playSync, router]);

  const handleCellClick = (icon: Icon) => {
    playSync();
    router.push(`/icon/${icon.id}`);
  };

  // Circular FOV mask — soft falloff at the edge, fully visible to ~80%
  // of the radius and faded out by the edge.
  const fovMask = `radial-gradient(circle ${FOV_RADIUS_PX}px at 50% 50%, black 0%, black 70%, transparent 100%)`;

  return (
    <div
      ref={containerRef}
      className="relative flex-1"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        cursor: isDraggingRef.current ? "grabbing" : "grab",
        userSelect: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Masked world layer — only icons inside the circular FOV are visible */}
      <div
        aria-hidden={false}
        style={{
          position: "absolute",
          inset: 0,
          maskImage: fovMask,
          WebkitMaskImage: fovMask,
          pointerEvents: "none",
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            x: springX,
            y: springY,
            width: 0,
            height: 0,
            pointerEvents: "auto",
          }}
        >
          {visible.map((cell) => {
            const idx = iconIndexAt(cell.q, cell.r, icons.length);
            const icon = icons[idx];
            if (!icon) return null;
            const decay = RING_DECAY[Math.min(cell.ring, MAX_RING)];
            const isFocus = cell.dq === 0 && cell.dr === 0;
            const px = SPACING_X * (cell.q + cell.r / 2);
            const py = SPACING_Y * cell.r;
            return (
              <motion.button
                key={`${cell.q},${cell.r}`}
                type="button"
                data-lens-icon="true"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCellClick(icon);
                }}
                aria-label={`Open ${icon.name}`}
                className="absolute flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{
                  opacity: decay.opacity,
                  scale: decay.scale,
                }}
                transition={{ type: "spring", stiffness: 220, damping: 22 }}
                style={{
                  left: px - ICON_SIZE / 2,
                  top: py - ICON_SIZE / 2,
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transformOrigin: "center",
                  zIndex: isFocus ? 5 : 1,
                }}
              >
                <SolidLogo id={icon.id} size={ICON_SIZE} />
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Focused icon name pill — sits above the search bar with blur. */}
      {focusedIcon ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            bottom: 144,
            transform: "translateX(-50%)",
            padding: "8px 8px",
            borderRadius: 12,
            background: "rgba(13,15,18,0.5)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid #16181B",
            backgroundClip: "padding-box",
            fontSize: 13,
            color: "#ffffff",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            letterSpacing: "0.01em",
            zIndex: 4,
          }}
        >
          {focusedIcon.name}
        </div>
      ) : null}

      {/* Bottom-centre: landing-page search bar */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 64,
          transform: "translateX(-50%)",
          width: "min(520px, calc(100% - 48px))",
          zIndex: 5,
        }}
      >
        <HomeSearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          onSubmit={handleSearchSubmit}
          inputRef={searchInputRef}
          showShortcut={false}
        />
      </div>
    </div>
  );
}

"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useRouter } from "next/navigation";
import { useSound } from "@web-kits/audio/react";
import type { Icon } from "@/lib/icon-data";
import { SolidLogo } from "@/components/BrandLogo";
import { MaskIcon } from "@/components/UiIcon";
import { hover, slideDown, sync } from "@/lib/audio/core";

// -------------------------------------------------------------------
// Lens model
//
// The "focused" icon is always drawn at viewport centre. The user pans
// an *infinite* hex grid under the lens with the cursor or arrow keys;
// only cells within MAX_RING of the lens centre are rendered, and they
// scale + dim with their ring distance to suggest a magnifying lens.
//
// Infinity is achieved by wrapping the (q, r) axial coordinate space
// around a small period and mapping each grid cell to an icon index
// deterministically. Within the visible disk (radius MAX_RING) the
// wrap period is large enough that no icon repeats, but if the user
// pans far enough the same icons reappear — this is what makes the
// grid feel endless.
// -------------------------------------------------------------------

const HEX_RADIUS = 56;
const SPACING_X = Math.sqrt(3) * HEX_RADIUS;
const SPACING_Y = 1.5 * HEX_RADIUS;
const ICON_SIZE = 64;
const MAX_RING = 4;

// Wrap period in each axial direction. With WRAP = 9 and MAX_RING = 4,
// the visible disk never contains two cells whose axial coordinates
// are 9 apart, so no icon repeats within a single lens view.
const WRAP_Q = 9;
const WRAP_R = 9;

const RING_DECAY: Array<{ scale: number; opacity: number }> = [
  { scale: 1.0, opacity: 1.0 },
  { scale: 0.85, opacity: 0.78 },
  { scale: 0.7, opacity: 0.55 },
  { scale: 0.55, opacity: 0.32 },
  { scale: 0.4, opacity: 0.18 },
];

function ringIndex(q: number, r: number): number {
  return (Math.abs(q) + Math.abs(r) + Math.abs(q + r)) / 2;
}

// Stable mapping from a global axial coord to an icon index in
// [0, total). Uses small primes on the wrapped coords so neighbouring
// cells get different icons but the mapping repeats every WRAP_Q × WRAP_R
// — that periodicity is invisible inside the lens because no two
// visible cells are 9 axial units apart.
function iconIndexAt(q: number, r: number, total: number): number {
  const qw = ((q % WRAP_Q) + WRAP_Q) % WRAP_Q;
  const rw = ((r % WRAP_R) + WRAP_R) % WRAP_R;
  return (qw * 7 + rw * 13) % total;
}

// Pixel → axial (pointy-top hex) with cube rounding for stability.
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
  const playSlideDown = useSound(slideDown);

  // Focus is the (q, r) coordinate of the cell currently magnified at
  // viewport centre. Both arrow keys and cursor proximity drive it.
  const [focus, setFocus] = useState({ q: 0, r: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [isPointerActive, setIsPointerActive] = useState(false);

  // Layout offset = -focused-cell pixel position so the focused cell
  // always renders at viewport centre. Spring-driven for smooth pan.
  const offsetX = useMotionValue(0);
  const offsetY = useMotionValue(0);
  const springX = useSpring(offsetX, { stiffness: 220, damping: 26 });
  const springY = useSpring(offsetY, { stiffness: 220, damping: 26 });

  useEffect(() => {
    offsetX.set(-SPACING_X * (focus.q + focus.r / 2));
    offsetY.set(-SPACING_Y * focus.r);
  }, [focus, offsetX, offsetY]);

  const focusedIcon = useMemo(
    () => icons[iconIndexAt(focus.q, focus.r, icons.length)],
    [icons, focus],
  );

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

  // ----- Cursor-driven focus -----
  // Cursor position in viewport → cursor position in "world" (the
  // infinite hex grid) by adding the current focus offset. The nearest
  // hex (via cube rounding) becomes the new focus. Re-rendering shifts
  // the layout via the spring so the new focus settles at centre.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingPointer = useRef<{ x: number; y: number } | null>(null);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse") return;
      pendingPointer.current = { x: event.clientX, y: event.clientY };
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const ptr = pendingPointer.current;
        const el = containerRef.current;
        if (!ptr || !el) return;
        const rect = el.getBoundingClientRect();
        const cx = ptr.x - rect.left - rect.width / 2;
        const cy = ptr.y - rect.top - rect.height / 2;
        // Map cursor (viewport-centred) to world coords by un-applying
        // the focus offset that the layout currently has.
        const worldX = cx + SPACING_X * (focus.q + focus.r / 2);
        const worldY = cy + SPACING_Y * focus.r;
        const next = pixelToAxial(worldX, worldY);
        if (next.q !== focus.q || next.r !== focus.r) {
          playHover();
          setFocus(next);
        }
      });
    },
    [focus, playHover],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ----- Search -----
  // Match against name / id / ticker / aliases. Typing live-shifts focus
  // to the best match's cell (in the same wrapped-tile coordinate the
  // grid uses, so the lens lands on the icon). Enter opens it.
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
      // Find the (q, r) inside the canonical wrap window whose
      // iconIndexAt matches this icon's index. Since iconIndexAt is a
      // 1-to-1 mapping over (qw, rw) ∈ [0..WRAP_Q-1] × [0..WRAP_R-1]
      // for the first WRAP_Q*WRAP_R indices, we can search there.
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

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      const m = matchByQuery(searchQuery.trim());
      const target = m?.icon ?? focusedIcon;
      if (target) {
        playSync();
        router.push(`/icon/${target.id}`);
      }
    }
  };

  const handleCellClick = (icon: Icon, isFocus: boolean) => {
    playSync();
    if (isFocus) {
      router.push(`/icon/${icon.id}`);
    } else {
      // Quick re-focus, then nav so the user sees the lens land on it.
      router.push(`/icon/${icon.id}`);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        cursor: "crosshair",
      }}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => setIsPointerActive(true)}
      onPointerLeave={() => setIsPointerActive(false)}
    >
      {/* World layer: panned by spring so the focused cell is at centre. */}
      <motion.div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          x: springX,
          y: springY,
          width: 0,
          height: 0,
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
              onClick={() => handleCellClick(icon, isFocus)}
              aria-label={`Open ${icon.name}`}
              className="absolute flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{
                opacity: isFocus ? 1 : decay.opacity,
                scale: isFocus ? 1.05 : decay.scale,
              }}
              exit={{ opacity: 0, scale: 0.3 }}
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
              }}
            >
              <SolidLogo id={icon.id} size={ICON_SIZE} />
            </motion.button>
          );
        })}
      </motion.div>

      {/* Lens marker at viewport centre — visual affordance only. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: ICON_SIZE + 20,
          height: ICON_SIZE + 20,
          transform: "translate(-50%, -50%)",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.06)",
          pointerEvents: "none",
          opacity: isPointerActive ? 0.9 : 0.5,
          transition: "opacity 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

      {/* Focused icon name label */}
      {focusedIcon ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "50%",
            top: "calc(50% + 64px)",
            transform: "translateX(-50%)",
            fontSize: 13,
            color: "rgba(255,255,255,0.6)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            letterSpacing: "0.01em",
          }}
        >
          {focusedIcon.name}
        </div>
      ) : null}

      {/* Bottom-centre search bar */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 64,
          transform: "translateX(-50%)",
          width: "min(480px, calc(100% - 48px))",
          zIndex: 5,
        }}
      >
        <div
          className="relative flex w-full items-center"
          style={{
            height: 40,
            borderRadius: 24,
            background: "rgba(13,15,18,0.5)",
            backgroundClip: "padding-box",
            border: "1px solid #16181B",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            padding: "0 14px",
            gap: 12,
          }}
        >
          <MaskIcon
            src="/sidebar-bg/search.svg"
            size={16}
            color="#ffffff"
            opacity={0.4}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder={`Search over ${icons.length} logos...`}
            className="sidebar-search-input flex-1 bg-transparent border-none outline-none"
            style={{
              color: searchQuery ? "#ffffff" : "rgba(255,255,255,0.4)",
              fontSize: 14,
              lineHeight: "normal",
              fontWeight: 400,
              minWidth: 0,
              caretColor: "rgba(255,255,255,0.6)",
            }}
          />
          {searchQuery ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                playSlideDown();
                setSearchQuery("");
              }}
              className="pressable pressable-soft flex items-center justify-center"
              style={{
                width: 16,
                height: 16,
                flexShrink: 0,
                background: "transparent",
                padding: 0,
                opacity: 0.4,
                transition:
                  "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.opacity = "0.4";
              }}
            >
              <MaskIcon
                src="/ui/cancel.svg"
                size={16}
                color="#ffffff"
                opacity={1}
              />
            </button>
          ) : null}
        </div>

        <p
          style={{
            marginTop: 12,
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          Use ← ↑ → ↓ or your cursor to scan, click or Enter to open.
        </p>
      </div>
    </div>
  );
}

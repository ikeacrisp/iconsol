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

// Pointy-top hex grid geometry. Cell radius = distance from centre to
// corner. Spacing chosen so the icon at scale 1 sits comfortably inside
// the cell with breathing room.
const HEX_RADIUS = 56;
const SPACING_X = Math.sqrt(3) * HEX_RADIUS;
const SPACING_Y = 1.5 * HEX_RADIUS;
const ICON_SIZE = 64;
const MAX_RING = 4; // 1 + 3*4*5 = 61 cells, matches LOGO_ORDER count

// Visual decay per ring index. Centre cell is full size + opacity, each
// further ring shrinks and dims to suggest a lens.
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

interface Cell {
  q: number;
  r: number;
  ring: number;
  px: number;
  py: number;
  angle: number;
}

function generateCells(maxRing: number): Cell[] {
  const cells: Cell[] = [];
  for (let q = -maxRing; q <= maxRing; q++) {
    const rMin = Math.max(-maxRing, -q - maxRing);
    const rMax = Math.min(maxRing, -q + maxRing);
    for (let r = rMin; r <= rMax; r++) {
      const ring = ringIndex(q, r);
      const px = SPACING_X * (q + r / 2);
      const py = SPACING_Y * r;
      const angle = Math.atan2(py, px);
      cells.push({ q, r, ring, px, py, angle });
    }
  }
  // Sort by ring, then by polar angle so icons spiral outward from centre
  // in a stable order — useful when assigning LOGO_ORDER indices to cells.
  return cells.sort(
    (a, b) => a.ring - b.ring || a.angle - b.angle,
  );
}

export function LensView({ icons }: { icons: Icon[] }) {
  const router = useRouter();
  const playHover = useSound(hover);
  const playSync = useSound(sync);
  const playSlideDown = useSound(slideDown);

  const cells = useMemo(() => generateCells(MAX_RING), []);
  const cellCount = Math.min(cells.length, icons.length);

  const [focusIdx, setFocusIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPointerActive, setIsPointerActive] = useState(false);

  const focusCell = cells[focusIdx];

  // Layout offset = -focusedCell.pixelPos so the focused cell renders at
  // viewport centre. Spring-driven for smooth shifts on focus changes.
  const offsetX = useMotionValue(focusCell ? -focusCell.px : 0);
  const offsetY = useMotionValue(focusCell ? -focusCell.py : 0);
  const springX = useSpring(offsetX, { stiffness: 220, damping: 26 });
  const springY = useSpring(offsetY, { stiffness: 220, damping: 26 });

  useEffect(() => {
    const cell = cells[focusIdx];
    if (!cell) return;
    offsetX.set(-cell.px);
    offsetY.set(-cell.py);
  }, [focusIdx, cells, offsetX, offsetY]);

  // Resolve the cell at a given axial coordinate (for arrow-key nav).
  const findCellIdx = useCallback(
    (q: number, r: number): number => {
      for (let i = 0; i < cellCount; i++) {
        const c = cells[i];
        if (c.q === q && c.r === r) return i;
      }
      return -1;
    },
    [cells, cellCount],
  );

  // Arrow keys map to four of the six hex neighbour directions. Diagonal
  // pairs are picked so arrows feel "up/down/left/right" enough.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when search input is focused — user types there.
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        return;
      }
      const cur = cells[focusIdx];
      if (!cur) return;
      let dq = 0;
      let dr = 0;
      switch (e.key) {
        case "ArrowLeft":
          dq = -1;
          dr = 0;
          break;
        case "ArrowRight":
          dq = 1;
          dr = 0;
          break;
        case "ArrowUp":
          // NW in axial terms (pointy-top)
          dq = 0;
          dr = -1;
          break;
        case "ArrowDown":
          dq = 0;
          dr = 1;
          break;
        default:
          return;
      }
      e.preventDefault();
      const nextIdx = findCellIdx(cur.q + dq, cur.r + dr);
      if (nextIdx >= 0) {
        playHover();
        setFocusIdx(nextIdx);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusIdx, cells, findCellIdx, playHover]);

  // Cursor-driven focus: as the cursor moves over the lens area, find
  // the cell closest to the cursor (in layout coordinates, accounting
  // for the current focus offset) and shift focus to it. The spring
  // smooths the resulting layout shift.
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pendingPointer = useRef<{ x: number; y: number } | null>(null);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse") return;
      pendingPointer.current = {
        x: event.clientX,
        y: event.clientY,
      };
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const ptr = pendingPointer.current;
        const el = containerRef.current;
        if (!ptr || !el) return;
        const rect = el.getBoundingClientRect();
        const cx = ptr.x - rect.left - rect.width / 2;
        const cy = ptr.y - rect.top - rect.height / 2;
        const cur = cells[focusIdx];
        if (!cur) return;
        // Cursor in layout coordinates
        const lx = cx + cur.px;
        const ly = cy + cur.py;
        let best = focusIdx;
        let bestDist = Infinity;
        for (let i = 0; i < cellCount; i++) {
          const c = cells[i];
          const dx = c.px - lx;
          const dy = c.py - ly;
          const d = dx * dx + dy * dy;
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        }
        if (best !== focusIdx) {
          playHover();
          setFocusIdx(best);
        }
      });
    },
    [cells, cellCount, focusIdx, playHover],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Search: matches name / id / ticker / aliases. Enter navigates to the
  // best match. Typing also moves focus to the first match so the user
  // sees the lens shifting toward what they're typing.
  const filteredMatches = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [] as Icon[];
    const matches: Array<{ icon: Icon; idx: number; rank: number }> = [];
    for (let i = 0; i < cellCount; i++) {
      const icon = icons[i];
      if (!icon) continue;
      const name = icon.name.toLowerCase();
      const id = icon.id.toLowerCase();
      const ticker = icon.ticker?.toLowerCase() ?? "";
      let rank = -1;
      if (id === q || ticker === q || name === q) rank = 0;
      else if (id.startsWith(q) || ticker.startsWith(q) || name.startsWith(q)) rank = 1;
      else if (
        id.includes(q) ||
        name.includes(q) ||
        ticker.includes(q) ||
        icon.aliases.some((a) => a.toLowerCase().includes(q))
      )
        rank = 2;
      if (rank >= 0) matches.push({ icon, idx: i, rank });
    }
    matches.sort((a, b) => a.rank - b.rank);
    return matches.map((m) => ({ icon: m.icon, idx: m.idx }));
  }, [icons, searchQuery, cellCount]) as Array<{ icon: Icon; idx: number }>;

  // Move focus to first match as the user types.
  useEffect(() => {
    if (searchQuery.trim() && filteredMatches.length > 0) {
      setFocusIdx(filteredMatches[0].idx);
    }
  }, [searchQuery, filteredMatches]);

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" && filteredMatches.length > 0) {
      const target = filteredMatches[0].icon;
      playSync();
      router.push(`/icon/${target.id}`);
    }
  };

  const handleCellClick = (idx: number, icon: Icon) => {
    playSync();
    if (idx !== focusIdx) {
      setFocusIdx(idx);
      // Small delay so the layout shift visually completes before nav.
      window.setTimeout(() => router.push(`/icon/${icon.id}`), 140);
    } else {
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
      {/* Hex grid */}
      <motion.div
        aria-hidden={false}
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
        {cells.slice(0, cellCount).map((cell, idx) => {
          const icon = icons[idx];
          if (!icon) return null;
          const decay = RING_DECAY[Math.min(cell.ring, MAX_RING)];
          const isFocused = idx === focusIdx;
          return (
            <motion.button
              key={icon.id}
              type="button"
              onClick={() => handleCellClick(idx, icon)}
              aria-label={`Open ${icon.name}`}
              className="absolute flex items-center justify-center"
              animate={{
                opacity: isFocused ? 1 : decay.opacity,
                scale: isFocused ? 1.05 : decay.scale,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 22 }}
              style={{
                left: cell.px - ICON_SIZE / 2,
                top: cell.py - ICON_SIZE / 2,
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

      {/* Active focus ring marker — sits at viewport centre. Pure visual
          affordance, doesn't capture pointer events. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: ICON_SIZE + 16,
          height: ICON_SIZE + 16,
          transform: "translate(-50%, -50%)",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.06)",
          pointerEvents: "none",
          opacity: isPointerActive ? 0.8 : 0.5,
          transition: "opacity 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      />

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
            placeholder={`Search over ${cellCount} logos...`}
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

        {/* Hint row — keyboard affordance */}
        <p
          style={{
            marginTop: 12,
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          Use ← ↑ → ↓ or your cursor to focus, click to open.
        </p>
      </div>
    </div>
  );
}

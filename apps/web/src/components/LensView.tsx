"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useRouter } from "next/navigation";
import { useSound } from "@web-kits/audio/react";
import type { Icon } from "@/lib/icon-data";
import { SolidLogo } from "@/components/BrandLogo";
import { HomeSearchBar } from "@/components/HomeSearchBar";
import { hover, slideDown, sync } from "@/lib/audio/core";

// -------------------------------------------------------------------
// Lens — fixed zig-zag grid with a sliding camera.
//
// • Cells live at FIXED world positions in a hex-packed zig-zag grid.
//   They never move relative to each other — the camera (world-layer
//   transform) is what slides under the lens.
// • Drag = grab the grid. Drag left → logos slide left, drag right →
//   logos slide right. Each PITCH of pointer movement steps the focus
//   by one cell, like one keypress on a slider with detents.
// • Arrow keys still move "selection" in the conventional way (Right
//   focuses the next cell to the right), and Enter opens the detail
//   page for the focused logo.
// • The whole container scales with its ring distance — container
//   AND logo grow/shrink as a single unit.
// -------------------------------------------------------------------

const FOCUS_SIZE = 200;
const LOGO_RATIO = 137 / 238;       // logo:container ratio (matches IconDetail)
const CELL_PITCH = 110;             // horizontal pitch — ring-1 cells touch
const CELL_PITCH_Y = CELL_PITCH * (Math.sqrt(3) / 2); // hex-pack vertical pitch
const VISIBLE_HALF = 4;             // 9×9 cells around focus
const FOV_RADIUS_PX = 340;          // soft alpha mask on the grid

// Per-Chebyshev-ring decay. Container & logo scale together (logo
// size = containerSize * LOGO_RATIO). Ring 0 is the spotlight; each
// outer ring is smaller, more transparent, more blurred.
const RING_DECAY: Array<{
  size: number;
  opacity: number;
  blur: number;
  bgOpacity: number;
}> = [
  { size: FOCUS_SIZE, opacity: 1.0,  blur: 0,   bgOpacity: 0.05 },
  { size: 110,        opacity: 0.4,  blur: 0.5, bgOpacity: 0.04 },
  { size: 78,         opacity: 0.22, blur: 1.2, bgOpacity: 0.03 },
  { size: 54,         opacity: 0.12, blur: 2.2, bgOpacity: 0.02 },
  { size: 38,         opacity: 0.06, blur: 3.4, bgOpacity: 0.01 },
];

const WRAP_C = 11;
const WRAP_R = 11;

// Slider drag detent + click discrimination.
const DRAG_STEP_X = CELL_PITCH;
const DRAG_STEP_Y = CELL_PITCH_Y;
const CLICK_MOVE_THRESHOLD_PX = 5;

const EASE_IN_OUT_CUBIC = [0.645, 0.045, 0.355, 1] as const;
// Camera + cell decay share this duration so the slide and the
// resize/opacity changes finish in sync.
const MOVE_DURATION_S = 0.36;

function chebyshev(dc: number, dr: number): number {
  return Math.max(Math.abs(dc), Math.abs(dr));
}

function iconIndexAt(c: number, r: number, total: number): number {
  const cw = ((c % WRAP_C) + WRAP_C) % WRAP_C;
  const rw = ((r % WRAP_R) + WRAP_R) % WRAP_R;
  return (cw * 7 + rw * 13) % total;
}

// World coords are FIXED. Zig-zag is keyed off the ABSOLUTE row so the
// pattern stays put when focus moves — cells never reshuffle.
function cellWorld(c: number, r: number): { x: number; y: number } {
  const offsetX = ((r % 2) + 2) % 2 === 1 ? CELL_PITCH / 2 : 0;
  return { x: c * CELL_PITCH + offsetX, y: r * CELL_PITCH_Y };
}

interface VisibleCell {
  c: number;
  r: number;
  worldX: number;
  worldY: number;
  ring: number;
  isFocus: boolean;
}

function visibleCellsAt(focusC: number, focusR: number): VisibleCell[] {
  const cells: VisibleCell[] = [];
  for (let dc = -VISIBLE_HALF; dc <= VISIBLE_HALF; dc++) {
    for (let dr = -VISIBLE_HALF; dr <= VISIBLE_HALF; dr++) {
      const c = focusC + dc;
      const r = focusR + dr;
      const w = cellWorld(c, r);
      cells.push({
        c,
        r,
        worldX: w.x,
        worldY: w.y,
        ring: chebyshev(dc, dr),
        isFocus: dc === 0 && dr === 0,
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

  const [focus, setFocus] = useState({ c: 0, r: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const focusedIcon = useMemo(
    () => icons[iconIndexAt(focus.c, focus.r, icons.length)],
    [icons, focus],
  );
  const focusedIconRef = useRef<Icon | null>(focusedIcon);
  focusedIconRef.current = focusedIcon ?? null;

  const visible = useMemo(
    () => visibleCellsAt(focus.c, focus.r),
    [focus],
  );

  // Camera world position. The world layer is rendered at viewport
  // centre and translated by -camera, so the cell at (camera) appears
  // at viewport centre.
  const camX = useMotionValue(0);
  const camY = useMotionValue(0);
  const worldX = useTransform(camX, (v) => -v);
  const worldY = useTransform(camY, (v) => -v);

  const cancelCamRef = useRef<() => void>(() => {});

  // When focus changes, animate the camera onto the new focus's world
  // position with cubic ease. This is what gives the cells their
  // smooth slide; the cells themselves never reshuffle.
  useEffect(() => {
    cancelCamRef.current();
    const t = cellWorld(focus.c, focus.r);
    const ax = animate(camX, t.x, {
      duration: MOVE_DURATION_S,
      ease: EASE_IN_OUT_CUBIC,
    });
    const ay = animate(camY, t.y, {
      duration: MOVE_DURATION_S,
      ease: EASE_IN_OUT_CUBIC,
    });
    cancelCamRef.current = () => {
      ax.stop();
      ay.stop();
    };
  }, [focus, camX, camY]);

  // ----- Slider drag -----
  // "Grab the grid" model: drag direction matches logo movement.
  // Drag left → logos slide left → camera pans right → focus.c += 1.
  // (i.e. focus increments OPPOSITE to drag delta sign.)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragAppliedRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragMovedRef = useRef(false);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      isDraggingRef.current = true;
      dragMovedRef.current = false;
      dragAppliedRef.current = { x: 0, y: 0 };
      dragStartRef.current = { x: event.clientX, y: event.clientY };
      try {
        (event.currentTarget as HTMLElement).setPointerCapture(
          event.pointerId,
        );
      } catch {
        // ignore
      }
    },
    [],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const start = dragStartRef.current;
      if (!isDraggingRef.current || !start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.hypot(dx, dy) > CLICK_MOVE_THRESHOLD_PX) {
        dragMovedRef.current = true;
      }
      // Negate so that drag direction matches logo movement direction.
      const stepC = -Math.round(dx / DRAG_STEP_X);
      const stepR = -Math.round(dy / DRAG_STEP_Y);
      const last = dragAppliedRef.current;
      const deltaC = stepC - last.x;
      const deltaR = stepR - last.y;
      if (deltaC !== 0 || deltaR !== 0) {
        dragAppliedRef.current = { x: stepC, y: stepR };
        setFocus((prev) => ({ c: prev.c + deltaC, r: prev.r + deltaR }));
        playHover();
      }
    },
    [playHover],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      dragAppliedRef.current = { x: 0, y: 0 };
      dragStartRef.current = null;
      try {
        (event.currentTarget as HTMLElement).releasePointerCapture(
          event.pointerId,
        );
      } catch {
        // ignore
      }
    },
    [],
  );

  // ----- Keyboard: arrows step focus, Enter opens detail -----
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inField =
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA");

      if (e.key === "Enter") {
        if (inField) return;
        const fi = focusedIconRef.current;
        if (!fi) return;
        e.preventDefault();
        playSync();
        router.push(`/icon/${fi.id}`);
        return;
      }

      if (inField) return;

      let dc = 0;
      let dr = 0;
      switch (e.key) {
        case "ArrowLeft":
          dc = -1;
          break;
        case "ArrowRight":
          dc = 1;
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
      setFocus((prev) => ({ c: prev.c + dc, r: prev.r + dr }));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [playHover, playSync, router]);

  // ----- Search -----
  const matchByQuery = useCallback(
    (q: string): { icon: Icon; c: number; r: number } | null => {
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
        else if (
          id.startsWith(lower) ||
          ticker.startsWith(lower) ||
          name.startsWith(lower)
        )
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
      for (let cw = 0; cw < WRAP_C; cw++) {
        for (let rw = 0; rw < WRAP_R; rw++) {
          if (iconIndexAt(cw, rw, icons.length) === best.idx) {
            return { icon: best.icon, c: cw, r: rw };
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
    if (m) setFocus({ c: m.c, r: m.r });
  }, [searchQuery, matchByQuery]);

  const handleSearchSubmit = useCallback(() => {
    const m = matchByQuery(searchQuery.trim());
    const target = m?.icon ?? focusedIcon;
    if (target) {
      playSync();
      router.push(`/icon/${target.id}`);
    }
  }, [matchByQuery, searchQuery, focusedIcon, playSync, router]);

  const handleClearSearch = useCallback(() => {
    playSlideDown();
    setSearchQuery("");
  }, [playSlideDown]);

  const handleCellClick = useCallback(
    (icon: Icon) => {
      if (dragMovedRef.current) return;
      playSync();
      router.push(`/icon/${icon.id}`);
    },
    [playSync, router],
  );

  // Soft alpha mask on the grid layer only — page background passes
  // through unchanged, no visible vignette ring.
  const fovMask = `radial-gradient(circle ${FOV_RADIUS_PX}px at 50% 50%, black 0%, black 60%, rgba(0,0,0,0.7) 78%, rgba(0,0,0,0.2) 92%, transparent 100%)`;

  return (
    <div
      ref={containerRef}
      className="relative flex-1 select-none"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        cursor: isDraggingRef.current ? "grabbing" : "grab",
        touchAction: "none",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDragStart={(e) => e.preventDefault()}
    >
      {/* Masked grid layer */}
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
        {/* World layer at viewport centre, translated by -camera so
            the focused cell appears at centre. Cells inside live at
            FIXED world positions and never move relative to one
            another — only this layer slides. */}
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 0,
            height: 0,
            x: worldX,
            y: worldY,
            pointerEvents: "auto",
          }}
        >
          {visible.map((cell) => {
            const idx = iconIndexAt(cell.c, cell.r, icons.length);
            const icon = icons[idx];
            if (!icon) return null;
            const decay =
              RING_DECAY[Math.min(cell.ring, RING_DECAY.length - 1)];
            const half = decay.size / 2;
            const logoSize = decay.size * LOGO_RATIO;
            return (
              <motion.button
                key={`${cell.c},${cell.r}`}
                type="button"
                data-lens-icon="true"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCellClick(icon);
                }}
                onDragStart={(e) => e.preventDefault()}
                draggable={false}
                aria-label={`Open ${icon.name}`}
                initial={false}
                animate={{
                  x: cell.worldX - half,
                  y: cell.worldY - half,
                  width: decay.size,
                  height: decay.size,
                  opacity: decay.opacity,
                  filter: `blur(${decay.blur}px)`,
                  backgroundColor: `rgba(255, 255, 255, ${decay.bgOpacity})`,
                }}
                transition={{
                  duration: MOVE_DURATION_S,
                  ease: EASE_IN_OUT_CUBIC,
                }}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  border: "none",
                  padding: 0,
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transformOrigin: "center",
                  zIndex: cell.isFocus ? 5 : 1,
                  userSelect: "none",
                  touchAction: "none",
                }}
              >
                <motion.div
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  initial={false}
                  animate={{
                    width: logoSize,
                    height: logoSize,
                  }}
                  transition={{
                    duration: MOVE_DURATION_S,
                    ease: EASE_IN_OUT_CUBIC,
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                >
                  <SolidLogo id={icon.id} size={logoSize} />
                </motion.div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {/* Focused icon name pill */}
      {focusedIcon ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 144,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
            zIndex: 4,
          }}
        >
          <motion.div
            key={focusedIcon.id}
            initial={{ opacity: 0, y: 4, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.32, ease: EASE_IN_OUT_CUBIC }}
            style={{
              padding: "8px 12px",
              borderRadius: 12,
              background: "rgba(13,15,18,0.5)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid #16181B",
              backgroundClip: "padding-box",
              fontSize: 13,
              color: "#ffffff",
              whiteSpace: "nowrap",
              letterSpacing: "0.01em",
            }}
          >
            {focusedIcon.name}
          </motion.div>
        </div>
      ) : null}

      {/* Bottom-centre: search bar with cmd+K ↔ cross swap. The outer
          wrapper is absolute + flex-centred (no transform!) so it
          doesn't establish a containing block that would break the
          search bar's backdrop-filter. The inner wrapper holds the
          view-transition name and a stopPropagation barrier. */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 64,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 5,
        }}
      >
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onPointerMove={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          style={{
            width: "min(520px, calc(100% - 48px))",
            pointerEvents: "auto",
            viewTransitionName: "lens-search-bar",
          } as React.CSSProperties}
        >
          <HomeSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearchSubmit}
            inputRef={searchInputRef}
            showShortcut
            onClear={handleClearSearch}
          />
        </div>
      </div>
    </div>
  );
}

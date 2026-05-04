"use client";

import { AnimatePresence, motion } from "motion/react";
import { useSound } from "@web-kits/audio/react";
import {
  easingGradient,
  easingGradientMulti,
  easingGradientStopsMulti,
} from "@/lib/easing-gradient";
import { ICON_COUNT } from "@/lib/icon-count";
import { MaskIcon } from "@/components/UiIcon";
import { slideDown } from "@/lib/audio/core";

// Visual chrome shared with the home page. Extracted so the lens page
// can reuse the same search input without duplicating the gradients
// and the animated glow layer.

const SEARCH_INPUT_BG = easingGradient(
  "180deg",
  "rgba(255,255,255,0)",
  "rgba(255,255,255,0.01)",
);

const HERO_CARD_BG = easingGradientMulti("180deg", [
  { color: "rgba(255,255,255,0.03)", pos: 0 },
  { color: "rgba(255,255,255,0.006)", pos: 28 },
  { color: "rgba(255,255,255,0.022)", pos: 100 },
]);

const SEARCH_GLOW_MASK = easingGradientMulti("180deg", [
  { color: "rgba(0,0,0,0)", pos: 0 },
  { color: "rgba(0,0,0,0)", pos: 30 },
  { color: "rgba(0,0,0,0.12)", pos: 44 },
  { color: "rgba(0,0,0,0.52)", pos: 58 },
  { color: "rgba(0,0,0,1)", pos: 100 },
]);
const SEARCH_GLOW_LEFT_STOPS = easingGradientStopsMulti([
  { color: "rgba(134,98,255,0.62)", pos: 0 },
  { color: "rgba(126,93,255,0.42)", pos: 24 },
  { color: "rgba(113,84,238,0.24)", pos: 44 },
  { color: "rgba(93,69,196,0.1)", pos: 58 },
  { color: "rgba(18,20,26,0)", pos: 68 },
]);
const SEARCH_GLOW_RIGHT_STOPS = easingGradientStopsMulti([
  { color: "rgba(91,227,255,0.62)", pos: 0 },
  { color: "rgba(78,212,250,0.42)", pos: 24 },
  { color: "rgba(63,175,224,0.24)", pos: 44 },
  { color: "rgba(44,128,170,0.1)", pos: 58 },
  { color: "rgba(18,20,26,0)", pos: 68 },
]);
const SEARCH_GLOW_BACKGROUND = `radial-gradient(84% 160% at 25% 100%, ${SEARCH_GLOW_LEFT_STOPS}), radial-gradient(84% 160% at 75% 100%, ${SEARCH_GLOW_RIGHT_STOPS})`;

const DEFAULT_PLACEHOLDER = `Search over ${ICON_COUNT} logos...`;

export function SearchGlowLayer({ rounded = 24 }: { rounded?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ borderRadius: rounded, zIndex: 0 }}
    >
      <div
        className="animate-search-glow-loop"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -7,
          height: "96%",
          width: "200%",
          display: "flex",
          maskImage: SEARCH_GLOW_MASK,
          WebkitMaskImage: SEARCH_GLOW_MASK,
        }}
      >
        <div
          style={{
            width: "50%",
            height: "100%",
            background: SEARCH_GLOW_BACKGROUND,
          }}
        />
        <div
          style={{
            width: "50%",
            height: "100%",
            background: SEARCH_GLOW_BACKGROUND,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: rounded,
          background: HERO_CARD_BG,
          opacity: 0.88,
        }}
      />
    </div>
  );
}

export function HomeSearchBar({
  value,
  onChange,
  onSubmit,
  onClear,
  onActivate,
  inputRef,
  showShortcut,
  forceClearAffordance = false,
  placeholder = DEFAULT_PLACEHOLDER,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear?: () => void;
  /**
   * Fires when the user focuses or clicks the search bar — used by the
   * home page to flip into search mode without requiring keystrokes.
   */
  onActivate?: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  showShortcut: boolean;
  /**
   * When true, shows the × (clear) icon even with an empty value — used by
   * the home page so the user can exit lens-activated search mode.
   */
  forceClearAffordance?: boolean;
  placeholder?: string;
}) {
  const hasValue = value.length > 0;
  // ⌘K → × swap is gated by `hasValue` (per spec) but can be forced by the
  // parent to expose an "exit search mode" affordance. The swap itself uses
  // opacity + scale + blur over 180ms (≤200ms per spec).
  const showClear = hasValue || forceClearAffordance;
  const playSlideDown = useSound(slideDown);

  const handleClear = () => {
    playSlideDown();
    onChange("");
    onClear?.();
    // preventScroll so the surrounding overflow:hidden wrapper doesn't get
    // shoved by the browser's "scroll input into view" focus behavior.
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <div
      className="relative flex w-full cursor-text items-center justify-between overflow-hidden backdrop-blur-[40px] frost-dither"
      style={{
        height: 36,
        background: SEARCH_INPUT_BG,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.10)",
        borderRadius: 24,
        padding: showShortcut ? "0 12px 0 12px" : "0 12px",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        isolation: "isolate",
      }}
      onClick={() => {
        inputRef.current?.focus({ preventScroll: true });
        onActivate?.();
      }}
    >
      <SearchGlowLayer rounded={24} />
      <div
        className="flex items-center"
        style={{
          gap: 12,
          flex: 1,
          minWidth: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        <span
          className="flex items-center justify-center"
          style={{ width: 20, height: 20, flexShrink: 0, opacity: 0.4 }}
        >
          <MaskIcon src="/ui/search.svg" size={16} color="#ffffff" opacity={1} />
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none"
          style={{
            color: value ? "#ffffff" : "rgba(255,255,255,0.4)",
            fontSize: 14,
            lineHeight: "normal",
            caretColor: "rgba(255,255,255,0.6)",
            minWidth: 0,
          }}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => onActivate?.()}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSubmit();
          }}
        />
      </div>
      {showShortcut ? (
        <div
          style={{
            position: "relative",
            width: 20,
            height: 20,
            flexShrink: 0,
            zIndex: 2,
          }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {showClear ? (
              <motion.button
                key="clear"
                type="button"
                aria-label="Clear search"
                onClick={(event) => {
                  event.stopPropagation();
                  handleClear();
                }}
                initial={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                animate={{ opacity: 0.4, scale: 1, filter: "blur(0px)" }}
                whileHover={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                transition={{
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="pressable pressable-soft flex items-center justify-center"
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: 0,
                  borderRadius: 8,
                  background: "transparent",
                  willChange: "transform, opacity, filter",
                }}
              >
                <MaskIcon src="/ui/cancel.svg" size={16} color="#ffffff" opacity={1} />
              </motion.button>
            ) : (
              <motion.button
                key="shortcut"
                type="button"
                aria-label="Focus search"
                onClick={(event) => {
                  event.stopPropagation();
                  inputRef.current?.focus();
                }}
                initial={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                animate={{ opacity: 0.4, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.6, filter: "blur(4px)" }}
                transition={{
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="pressable pressable-soft flex items-center justify-center"
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: 0,
                  borderRadius: 8,
                  background: "transparent",
                  willChange: "transform, opacity, filter",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ui/command-k.svg"
                  alt=""
                  width={16}
                  height={8.61}
                  style={{ display: "block", width: 16, height: 8.61, opacity: 0.4 }}
                />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import type { MouseEvent, ReactNode } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSound } from "@web-kits/audio/react";
import { hover, slideDown, sync } from "@/lib/audio/core";
import { swoosh } from "@/lib/audio/crisp";
import { toggleOff, toggleOn } from "@/lib/audio/minimal";
import { pageExit, slide } from "@/lib/audio/playful";
import { BrandLogo, SolidLogo } from "@/components/BrandLogo";
import { BlurFade } from "@/components/BlurFade";
import { DotField } from "@/components/DotField";
import { MaskIcon } from "@/components/UiIcon";
import { easingGradient } from "@/lib/easing-gradient";

// Subtle near-monochrome gradient — a longer easing chain keeps the
// per-stop delta below the 8-bit rounding threshold to soften banding.
// (Final defence against bands is the frost-dither noise overlay.)
const SIDEBAR_BG = easingGradient(
  "180deg",
  "#141619",
  "rgba(13,15,18,0.5)",
  "easeInOut",
  24,
);

// Brand/Solid toggle shell — matches the icon detail page version.
const TOGGLE_SHELL_BG = easingGradient(
  "180deg",
  "#0D0F12",
  "rgba(13,15,18,0.2)",
);
const TOGGLE_SHELL_BORDER = "1px solid #191B1E";
import {
  getDocumentViewTransition,
  ICON_ART_TRANSITION_NAME,
  ICON_FRAME_TRANSITION_NAME,
  setPendingIconTransition,
  shouldUseIconViewTransition,
} from "@/lib/icon-view-transition";
import { logoVariantHasIntrinsicSurface } from "@/lib/logo-assets";
import type { Icon, IconCategory } from "@/lib/icon-data";
import { searchIcons } from "@/lib/search";

interface IconGridProps {
  icons: Icon[];
  categories: { value: IconCategory | "all"; label: string }[];
}

const HOVER_SPRING = { stiffness: 400, damping: 35 };
const HOVER_OPACITY_SPRING = { stiffness: 1200, damping: 40 };
const CARD_PATH_SETTLE_THRESHOLD = 0.75;
const CARD_SIZE = 160;
const FOOTER_FADE_ZONE = 73;
const HOVER_LOCK_GRACE_MS = 450;
const TOGGLE_BUTTON_WIDTH = 86;
// 2 buttons + 2px padding on each side + 1px border on each side
// (box-sizing: border-box subtracts the border from the content area).
const TOGGLE_INNER_WIDTH = TOGGLE_BUTTON_WIDTH * 2 + 4 + 2;
const UI_ICON_OPACITY = 0.4;

function CategoryIcon({
  category,
  state,
}: {
  category: IconCategory | "all";
  state: "active" | "hover" | "idle";
}) {
  const color = state === "active" ? "#7478ff" : "#ffffff";
  const opacity = state === "active" ? 1 : state === "hover" ? 0.8 : UI_ICON_OPACITY;
  const svgStyle = {
    display: "block",
    width: 16,
    height: 16,
    flexShrink: 0,
  } as const;

  switch (category) {
    case "all":
      return <MaskIcon src="/ui/diamond-component.svg" size={16} color={color} opacity={opacity} />;
    case "tokens":
      return (
        <span aria-hidden="true" style={{ opacity }}>
          <svg viewBox="0 0 13.5 13.5" fill="none" style={svgStyle}>
            <path
              d="M6.75 12.75C10.0637 12.75 12.75 10.0637 12.75 6.75C12.75 3.43629 10.0637 0.75 6.75 0.75C3.43629 0.75 0.75 3.43629 0.75 6.75C0.75 10.0637 3.43629 12.75 6.75 12.75Z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5.61848 5.21472C6.0145 4.8187 6.2125 4.62069 6.44083 4.5465C6.64168 4.48124 6.85802 4.48124 7.05887 4.5465C7.28719 4.62069 7.4852 4.8187 7.88122 5.21472L8.28515 5.61864C8.68116 6.01466 8.87917 6.21267 8.95336 6.44099C9.01862 6.64184 9.01862 6.85819 8.95336 7.05903C8.87917 7.28736 8.68116 7.48537 8.28515 7.88138L7.88122 8.28531C7.4852 8.68132 7.28719 8.87933 7.05887 8.95352C6.85802 9.01878 6.64168 9.01878 6.44083 8.95352C6.2125 8.87933 6.0145 8.68132 5.61848 8.28531L5.21455 7.88138C4.81854 7.48537 4.62053 7.28736 4.54634 7.05903C4.48108 6.85819 4.48108 6.64184 4.54634 6.44099C4.62053 6.21267 4.81854 6.01466 5.21455 5.61864L5.61848 5.21472Z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    case "defi":
      return (
        <span aria-hidden="true" style={{ opacity }}>
          <svg viewBox="0 0 13.498 14.4037" fill="none" style={svgStyle}>
            <path
              d="M6.749 13.6537C6.96357 13.6537 7.17815 13.6313 7.38919 13.5864C7.7762 13.5041 8.14456 13.3181 8.74899 12.9742M6.749 13.6537C6.53441 13.6537 6.31983 13.6313 6.10879 13.5864C5.72178 13.5041 5.35342 13.3181 4.74899 12.9742M6.749 13.6537V11.8685M6.749 0.75C6.96357 0.75 7.17815 0.77243 7.38919 0.817288C7.7762 0.899549 8.14456 1.08558 8.74899 1.42952M6.749 0.75C6.53441 0.75 6.31983 0.772429 6.10879 0.817288C5.72178 0.899549 5.35342 1.08558 4.74899 1.42952M6.749 0.75L6.74898 2.53516M1.16152 3.97592C1.05423 4.16175 0.966367 4.3588 0.899694 4.564C0.77743 4.94029 0.754355 5.35232 0.75 6.04774M1.16152 3.97592C1.26881 3.79009 1.39553 3.61548 1.5399 3.45514C1.80464 3.16111 2.14993 2.93511 2.75 2.58363M1.16152 3.97592L2.70756 4.86853M1.16153 10.4278C1.26881 10.6136 1.39553 10.7882 1.5399 10.9486C1.80464 11.2426 2.14993 11.4686 2.75 11.8201M1.16153 10.4278C1.05423 10.2419 0.966368 10.0449 0.899694 9.8397C0.77743 9.46341 0.754355 9.05138 0.75 8.35596M1.16153 10.4278L2.70758 9.53515M12.3365 3.97593C12.2292 3.7901 12.1025 3.61548 11.9581 3.45514C11.6933 3.16111 11.348 2.93511 10.748 2.58363M12.3365 3.97593C12.4437 4.16176 12.5316 4.3588 12.5983 4.564C12.7205 4.94029 12.7436 5.35231 12.748 6.04773M12.3365 3.97593L10.7905 4.86849M12.3365 10.4278C12.4437 10.2419 12.5316 10.0449 12.5983 9.8397C12.7205 9.46341 12.7436 9.05139 12.748 8.35597M12.3365 10.4278C12.2292 10.6136 12.1024 10.7882 11.9581 10.9486C11.6933 11.2426 11.348 11.4686 10.748 11.8201M12.3365 10.4278L10.7485 9.51096M6.74899 9.20185L6.749 7.20185M8.48133 6.20169L6.749 7.20185M5.01665 6.20168L6.749 7.20185"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    case "wallets":
      return (
        <span aria-hidden="true" style={{ opacity }}>
          <svg viewBox="0 0 14.8335 13.5" fill="none" style={svgStyle}>
            <path
              d="M0.75006 8.41667V6.08333C0.75006 4.21649 0.75006 3.28307 1.11337 2.57003C1.43295 1.94283 1.94288 1.43289 2.57009 1.11331C3.28313 0.750001 4.21655 0.750001 6.08339 0.750001H8.41673C9.34861 0.750001 9.81455 0.750001 10.1821 0.902241C10.6721 1.10523 11.0615 1.49458 11.2645 1.98463C11.4027 2.31834 11.4154 2.73316 11.4166 3.5042M0.75006 8.41667C0.75006 9.30314 0.75006 10.0797 1.00379 10.6923C1.34211 11.509 1.99102 12.158 2.80778 12.4963C3.42035 12.75 4.19692 12.75 5.75006 12.75H9.08339C10.6365 12.75 11.4131 12.75 12.0257 12.4963C12.8424 12.158 13.4913 11.509 13.8297 10.6923C14.0834 10.0797 14.0834 9.30314 14.0834 8.41667C14.0834 6.86353 14.0834 6.08696 13.8297 5.47439C13.4913 4.65763 12.8424 4.00872 12.0257 3.6704C11.8427 3.59462 11.6451 3.54147 11.4166 3.5042M0.75006 8.41667C0.75006 6.86353 0.75006 6.08696 1.00379 5.47439C1.34211 4.65763 1.99102 4.00872 2.80778 3.6704C3.42035 3.41667 4.19692 3.41667 5.75006 3.41667H9.08339C10.1727 3.41667 10.88 3.41667 11.4166 3.5042M8.75006 6.75H10.7501"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    case "nft":
      return (
        <span aria-hidden="true" style={{ opacity }}>
          <svg viewBox="0 0 14.1667 13.5001" fill="none" style={svgStyle}>
            <path
              d="M13.323 6.0834H11.7748C11.1514 6.0834 10.8398 6.08341 10.577 6.10624C7.65636 6.36001 5.34076 8.65979 5.08524 11.5605C5.06254 11.8181 5.06225 12.123 5.06225 12.7264M13.323 6.0834C13.2221 5.73745 13.0177 5.37201 12.6529 4.71988L11.6599 2.94466C11.2131 2.14593 10.9897 1.74657 10.672 1.45576C10.3909 1.19849 10.0577 1.0038 9.69476 0.884697C9.28449 0.750071 8.82449 0.750071 7.90449 0.750071L6.24754 0.750071C5.32753 0.750071 4.86753 0.750071 4.45727 0.884698C4.09432 1.0038 3.76115 1.19849 3.48006 1.45576C3.16232 1.74657 2.93893 2.14593 2.49213 2.94466L1.52254 4.678C1.0995 5.43427 0.887974 5.81241 0.805047 6.21287C0.731651 6.5673 0.731651 6.93285 0.805047 7.28728C0.887975 7.68773 1.0995 8.06587 1.52254 8.82215L2.49213 10.5555C2.93893 11.3542 3.16232 11.7536 3.48006 12.0444C3.76115 12.3017 4.09432 12.4963 4.45727 12.6154C4.63768 12.6746 4.82771 12.7078 5.06225 12.7264M13.323 6.0834C13.3368 6.13092 13.3487 6.17807 13.3588 6.22554C13.4327 6.57352 13.4359 6.93269 13.368 7.28189C13.2912 7.67638 13.0903 8.05072 12.6883 8.79941L12.3569 9.41674L11.6703 10.6059C11.2194 11.3869 10.9939 11.7774 10.6776 12.0615C10.3977 12.3128 10.0676 12.5027 9.70879 12.6188C9.3033 12.7501 8.85005 12.7501 7.94355 12.7501H6.24754C5.7321 12.7501 5.36106 12.7501 5.06225 12.7264M5.06225 5.41674C4.69153 5.41674 4.391 5.11826 4.391 4.75007C4.391 4.38188 4.69153 4.0834 5.06225 4.0834C5.43297 4.0834 5.7335 4.38188 5.7335 4.75007C5.7335 5.11826 5.43297 5.41674 5.06225 5.41674Z"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    case "infrastructure":
      return (
        <span aria-hidden="true" style={{ opacity }}>
          <svg viewBox="0 0 13.4934 12.8333" fill="none" style={svgStyle}>
            <path
              d="M11.6623 8.74479L12.6135 10.5017C12.9956 11.2074 12.51 12.0833 11.7368 12.0833H1.75668C0.983389 12.0833 0.497818 11.2074 0.879911 10.5017L1.83118 8.74479M11.6623 8.74479H1.83118M11.6623 8.74479L9.85745 5.41146M1.83118 8.74479L3.63599 5.41146M9.85745 5.41146L7.62348 1.28552C7.23688 0.571493 6.25656 0.571495 5.86995 1.28552L3.63599 5.41146M9.85745 5.41146H3.63599"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      );
    default:
      return null;
  }
}

function SidebarSearchIcon() {
  return <MaskIcon src="/sidebar-bg/search.svg" size={16} color="#ffffff" opacity={0.4} />;
}

const SPRING = { type: "spring", stiffness: 300, damping: 12 } as const;
const SPRING_TAP = { type: "spring", stiffness: 400, damping: 14 } as const;

// Quieter variants for the SuggestLogo sheet — base patches are 0.1, halve.
const SUGGEST_SLIDE = { ...slide, gain: 0.05 };
const SUGGEST_PAGE_EXIT = { ...pageExit, gain: 0.05 };

function SuggestLogo() {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [contentHeight, setContentHeight] = useState(0);
  const playSlide = useSound(SUGGEST_SLIDE);
  const playPageExit = useSound(SUGGEST_PAGE_EXIT);
  const playSync = useSound(sync);
  const playHover = useSound(hover);

  useLayoutEffect(() => {
    if (!contentRef.current) return;
    const measure = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(contentRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      onMouseEnter={() => {
        if (!expanded) {
          playSlide();
          setExpanded(true);
        }
      }}
      style={{
        position: "absolute",
        bottom: 12,
        left: 12,
        right: 12,
        zIndex: 10,
      }}
    >
      <motion.div
        animate={{
          scaleX: expanded ? 1 : 0.985,
          scaleY: expanded ? 1 : 0.97,
        }}
        transition={SPRING}
        style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 20,
          padding: expanded ? "12px 8px 8px 8px" : "8px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          transformOrigin: "bottom center",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ width: "100%" }}
        >
          <div className="flex items-center" style={{ gap: 6 }}>
            <MaskIcon
              src="/ui/poap.svg"
              size={16}
              color="#ffffff"
              opacity={expanded ? 0.4 : 0.25}
            />
            <span
              style={{
                fontSize: 14,
                fontWeight: 500,
                lineHeight: "normal",
                color: expanded
                  ? "rgba(255,255,255,0.6)"
                  : "rgba(255,255,255,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              Suggest a logo
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playPageExit();
              setExpanded(false);
            }}
            className="pressable pressable-soft"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              background: "transparent",
              padding: 0,
              transform: expanded ? "scaleY(1)" : "scaleY(-1)",
              transition: "transform 260ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <MaskIcon
              src="/ui/chevron-down.svg"
              size={16}
              color="#ffffff"
              opacity={expanded ? 0.4 : 0.25}
            />
          </button>
        </div>

        <div
          style={{
            overflow: "hidden",
            height: expanded ? contentHeight : 0,
            transition: "height 320ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div
            ref={contentRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              paddingTop: 24,
            }}
          >
            <p
              style={{
                fontSize: 12,
                lineHeight: "normal",
                color: "rgba(255,255,255,0.25)",
                fontWeight: 400,
                textWrap: "balance",
              }}
            >
              this directory is maintained by iconsol. Additions are proposed
              via public GitHub requests.
            </p>
            <a
              href="https://github.com/ikeacrisp/iconsol"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable pressable-soft flex items-center justify-center"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 12,
                background: "rgba(255,255,255,0.03)",
                fontSize: 14,
                fontWeight: 500,
                lineHeight: "normal",
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                transition:
                  "background 180ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onClick={() => playSync()}
              onMouseEnter={(event) => {
                playHover();
                event.currentTarget.style.background = "rgba(255,255,255,0.05)";
                event.currentTarget.style.color = "#ffffff";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.background = "rgba(255,255,255,0.03)";
                event.currentTarget.style.color = "rgba(255,255,255,0.6)";
              }}
            >
              contribute
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function BrandToggle({
  buttonRef,
  active,
  onClick,
  children,
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      className="flex items-center justify-center"
      style={{
        position: "relative",
        zIndex: 1,
        width: TOGGLE_BUTTON_WIDTH,
        height: 30,
        padding: "0 12px",
        borderRadius: 8,
        color: active ? "#ffffff" : "rgba(255,255,255,0.4)",
        fontSize: 14,
        fontWeight: 500,
        lineHeight: "19px",
        background: "transparent",
        transition: "color 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

export function IconGrid({ icons, categories }: IconGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<IconCategory | "all">("all");
  const [solidMode, setSolidMode] = useState(false);
  const playToggleOn = useSound(toggleOn);
  const playToggleOff = useSound(toggleOff);
  const playHover = useSound(hover);
  const playSync = useSound(sync);
  const playSlideDown = useSound(slideDown);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") ?? "");
  const [isScrolling, setIsScrolling] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<IconCategory | "all" | null>(null);
  const [activeHighlightRect, setActiveHighlightRect] = useState({ top: 0, height: 43 });
  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const iconRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const categoryContainerRef = useRef<HTMLDivElement | null>(null);
  const toggleBrandRef = useRef<HTMLButtonElement | null>(null);
  const toggleSolidRef = useRef<HTMLButtonElement | null>(null);
  const gridContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const diagonalUnsubRef = useRef<(() => void) | null>(null);
  const snapLockedRef = useRef(false);
  const hoverLiftCardRef = useRef<string | null>(null);
  const hoverLiftArmedRef = useRef(true);
  const hoverLockCardRef = useRef<string | null>(null);
  const hoverLockPointerRef = useRef<{ x: number; y: number } | null>(null);
  const hoverLockStartedAtRef = useRef(0);
  const toggleActiveX = useMotionValue(0);
  const toggleActiveWidth = useMotionValue(0);
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const cardOpacity = useMotionValue(0);
  const springToggleActiveX = useSpring(toggleActiveX, HOVER_SPRING);
  const springToggleActiveWidth = useSpring(toggleActiveWidth, HOVER_SPRING);
  const springCardX = useSpring(cardX, HOVER_SPRING);
  const springCardY = useSpring(cardY, HOVER_SPRING);
  const springCardOpacity = useSpring(cardOpacity, HOVER_OPACITY_SPRING);

  useEffect(() => {
    setSearchQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Cursor-tracked sidebar shine. Updates the radial highlight position
  // and intensity on mousemove (rAF-throttled), with intensity falling
  // off as the cursor moves further than ~240px from the sidebar edge.
  useEffect(() => {
    const el = sidebarRef.current;
    if (!el || typeof window === "undefined") return;

    let raf = 0;
    let lastX = 0;
    let lastY = 0;

    const apply = () => {
      raf = 0;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = lastX - rect.left;
      const y = lastY - rect.top;
      const dx = Math.max(rect.left - lastX, lastX - rect.right, 0);
      const dy = Math.max(rect.top - lastY, lastY - rect.bottom, 0);
      const distance = Math.hypot(dx, dy);
      const proximity = Math.max(0, 1 - distance / 240);
      el.style.setProperty("--shine-x", `${x}px`);
      el.style.setProperty("--shine-y", `${y}px`);
      el.style.setProperty("--shine-opacity", String(proximity));
    };

    const onMove = (event: globalThis.MouseEvent) => {
      lastX = event.clientX;
      lastY = event.clientY;
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  useLayoutEffect(() => {
    const syncActiveHighlightRect = () => {
      const activeNode = categoryRefs.current[activeCategory];
      if (!activeNode) return;

      setActiveHighlightRect({
        top: activeNode.offsetTop,
        height: activeNode.offsetHeight,
      });
    };

    syncActiveHighlightRect();
    window.addEventListener("resize", syncActiveHighlightRect);
    return () => window.removeEventListener("resize", syncActiveHighlightRect);
  }, [activeCategory]);

  useEffect(() => {
    if (searchParams.get("surprise") === "1" && icons.length > 0) {
      const withFiles = icons.filter((icon) => icon.hasLocalFile);
      const pool = withFiles.length > 0 ? withFiles : icons;
      const random = pool[Math.floor(Math.random() * pool.length)];
      router.replace(`/icon/${random.id}`);
    }
  }, [icons, router, searchParams]);

  // Sidebar uses per-button hover backgrounds — no sliding highlight.

  const toggleMountedRef = useRef(false);
  useEffect(() => {
    const activeToggle = solidMode ? toggleSolidRef.current : toggleBrandRef.current;
    if (!activeToggle) return;

    if (!toggleMountedRef.current) {
      toggleActiveX.jump(activeToggle.offsetLeft);
      toggleActiveWidth.jump(activeToggle.offsetWidth);
      springToggleActiveX.jump(activeToggle.offsetLeft);
      springToggleActiveWidth.jump(activeToggle.offsetWidth);
      toggleMountedRef.current = true;
    } else {
      toggleActiveX.set(activeToggle.offsetLeft);
      toggleActiveWidth.set(activeToggle.offsetWidth);
    }
  }, [solidMode, toggleActiveWidth, toggleActiveX, springToggleActiveX, springToggleActiveWidth]);

  // Track scroll state — show blur while scrolling, snap-align when idle
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const LABEL_HEIGHT = 72; // category label height
    const GRID_PAD_TOP = 72; // paddingTop on the grid wrapper
    const CARD_HEIGHT = 160; // each card row height

    const snapScroll = () => {
      setIsScrolling(false);

      const scrollTop = el.scrollTop;
      // How far logos have scrolled past the label zone
      const overflow = scrollTop - (GRID_PAD_TOP - LABEL_HEIGHT);

      if (overflow <= 0) return; // logos haven't reached the label zone

      // Calculate which row boundary we're near
      const rowIndex = overflow / CARD_HEIGHT;
      const fraction = rowIndex % 1;

      // Only snap if a row is clearly partially occluded (15%-85% range)
      if (fraction > 0.15 && fraction < 0.85) {
        const targetRow = fraction < 0.5 ? Math.floor(rowIndex) : Math.ceil(rowIndex);
        const targetScroll = (GRID_PAD_TOP - LABEL_HEIGHT) + targetRow * CARD_HEIGHT;
        snapLockedRef.current = true;
        el.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    };

    let lastUserScrollY = 0;

    const handleScroll = () => {
      // If snap-locked, check if this scroll event is from the snap animation
      // Unlock once the snap animation finishes (scroll stops changing)
      if (snapLockedRef.current) {
        const currentY = el.scrollTop;
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        scrollTimerRef.current = setTimeout(() => {
          snapLockedRef.current = false;
          setIsScrolling(false);
        }, 200);
        lastUserScrollY = currentY;
        return;
      }

      setIsScrolling(true);
      lastUserScrollY = el.scrollTop;
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(snapScroll, 400);
    };

    // Unlock snap on user-initiated scroll (wheel or touch)
    const unlockSnap = () => { snapLockedRef.current = false; };

    el.addEventListener("scroll", handleScroll, { passive: true });
    el.addEventListener("wheel", unlockSnap, { passive: true });
    el.addEventListener("touchstart", unlockSnap, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      el.removeEventListener("wheel", unlockSnap);
      el.removeEventListener("touchstart", unlockSnap);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);


  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: icons.length };

    for (const icon of icons) {
      counts[icon.category] = (counts[icon.category] || 0) + 1;
    }

    return counts;
  }, [icons]);

  const filtered = useMemo(
    () =>
      searchIcons(icons, {
        query: searchQuery,
        // When the user types a query, search across ALL icons regardless
        // of the currently-active category — otherwise a logo in another
        // category would look like it doesn't exist.
        category: searchQuery.trim() !== "" ? "all" : activeCategory,
      }),
    [activeCategory, icons, searchQuery]
  );

  const activeLabel =
    searchQuery.trim() !== ""
      ? "Related Logo's"
      : categories.find((category) => category.value === activeCategory)?.label ??
        "All Logo’s";

  // Card blur-fade reveal is handled via key-based remount
  // (`${activeCategory}-${solidMode}-${icon.id}`) where the card is rendered.

  useEffect(() => {
    if (diagonalUnsubRef.current) {
      diagonalUnsubRef.current();
      diagonalUnsubRef.current = null;
    }

    cardOpacity.set(0);
  }, [activeCategory, solidMode, searchQuery, cardOpacity]);

  const releaseHoverLift = useCallback(() => {
    hoverLiftCardRef.current = null;
    snapLockedRef.current = false;
  }, []);

  const releaseHoverLock = useCallback(() => {
    hoverLockCardRef.current = null;
    hoverLockPointerRef.current = null;
    hoverLockStartedAtRef.current = 0;
  }, []);

  const deactivateCardHover = useCallback(
    (id: string) => {
      if (hoverLockCardRef.current === id) {
        return;
      }

      releaseHoverLift();
      releaseHoverLock();
    },
    [releaseHoverLift, releaseHoverLock]
  );

  const activateCardHover = useCallback(
    (id: string, pointer?: { x: number; y: number }) => {
      // Cancel any pending diagonal fade-out listener
      if (diagonalUnsubRef.current) {
        diagonalUnsubRef.current();
        diagonalUnsubRef.current = null;
      }

      if (hoverLockCardRef.current && hoverLockCardRef.current !== id) {
        return;
      }

      const element = iconRefs.current[id];
      const gridElement = gridContainerRef.current;
      if (!element || !gridElement) return;

      // Auto-scroll if card is near the edge — skip while snap-locked
      const scrollEl = scrollContainerRef.current;
      if (scrollEl && !snapLockedRef.current) {
        const scrollRect = scrollEl.getBoundingClientRect();
        const cardRect = element.getBoundingClientRect();
        const topEdge = 80; // below category label zone
        const bottomEdge = FOOTER_FADE_ZONE; // above footer fade
        if (cardRect.top < scrollRect.top + topEdge) {
          const delta = cardRect.top - scrollRect.top - topEdge;
          scrollEl.scrollTo({ top: scrollEl.scrollTop + delta, behavior: "smooth" });
        } else if (cardRect.bottom > scrollRect.bottom - bottomEdge) {
          if (hoverLiftArmedRef.current && hoverLiftCardRef.current !== id) {
            hoverLiftCardRef.current = id;
            hoverLiftArmedRef.current = false;
            hoverLockCardRef.current = id;
            hoverLockPointerRef.current = pointer ?? null;
            hoverLockStartedAtRef.current = performance.now();
            snapLockedRef.current = true;

            const targetScrollTop = Math.min(
              scrollEl.scrollTop + CARD_SIZE,
              scrollEl.scrollHeight - scrollEl.clientHeight
            );

            scrollEl.scrollTo({ top: targetScrollTop, behavior: "smooth" });
          }
        } else if (hoverLiftCardRef.current === id) {
          releaseHoverLift();
          hoverLiftArmedRef.current = true;
        } else {
          hoverLiftArmedRef.current = true;
        }
      }

      const elementRect = element.getBoundingClientRect();
      const gridRect = gridElement.getBoundingClientRect();
      const targetX = elementRect.left - gridRect.left;
      const targetY = elementRect.top - gridRect.top;
      const currentX = springCardX.get();
      const currentY = springCardY.get();
      const deltaX = targetX - currentX;
      const deltaY = targetY - currentY;
      const currentOpacity = springCardOpacity.get();

      const sameRow = Math.abs(deltaY) <= CARD_PATH_SETTLE_THRESHOLD;
      const sameCol = Math.abs(deltaX) <= CARD_PATH_SETTLE_THRESHOLD;

      if (currentOpacity < 0.1) {
        // If highlight is already invisible, just teleport and fade in
        cardX.jump(targetX);
        cardY.jump(targetY);
        springCardX.jump(targetX);
        springCardY.jump(targetY);
        cardOpacity.set(1);
      } else if (sameRow || sameCol) {
        // Same row or same column — slide directly
        cardX.set(targetX);
        cardY.set(targetY);
        cardOpacity.set(1);
      } else {
        // Diagonal movement — fade out, teleport, fade in
        cardOpacity.set(0);

        const unsub = springCardOpacity.on("change", (v) => {
          if (v <= 0.2) {
            unsub();
            diagonalUnsubRef.current = null;
            cardX.jump(targetX);
            cardY.jump(targetY);
            springCardX.jump(targetX);
            springCardY.jump(targetY);
            cardOpacity.set(1);
          }
        });
        diagonalUnsubRef.current = unsub;
      }
    },
    [cardOpacity, cardX, cardY, releaseHoverLift, springCardX, springCardY, springCardOpacity]
  );

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <MobileBottomSearch
        value={searchQuery}
        onChange={setSearchQuery}
        onOpenCategories={() => setMobileDrawerOpen(true)}
      />
      {mobileDrawerOpen ? (
        <MobileCategoryDrawer
          categories={categories}
          activeCategory={activeCategory}
          categoryCounts={categoryCounts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setMobileDrawerOpen(false);
          }}
          onClose={() => setMobileDrawerOpen(false)}
        />
      ) : null}
      <div
        className="flex h-full min-h-0 items-stretch"
        style={{
          width: "100%",
          flex: 1,
        }}
      >
        <aside
          className="mobile-dashboard-sidebar shrink-0"
          style={{
            width: 290,
            paddingTop: 0,
            paddingLeft: 24,
            paddingRight: 24,
            paddingBottom: 12,
            boxSizing: "border-box",
            height: "100%",
            position: "relative",
            zIndex: 20,
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 0,
            }}
          >
            <DotField />
          </div>
          <div
            ref={sidebarRef}
            className="flex h-full min-h-0 flex-col frost-dither sidebar-shine"
            style={{
              position: "relative",
              height: `calc(100% - ${FOOTER_FADE_ZONE}px)`,
              borderRadius: 32,
              border: "1px solid #16181B",
              background: SIDEBAR_BG,
              backgroundClip: "padding-box",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              paddingLeft: 12,
              paddingRight: 12,
            }}
          >
            <div className="flex flex-1 flex-col items-center" style={{ gap: 32, paddingTop: 12, paddingBottom: 12 }}>
              <div
                className="flex w-full items-center overflow-hidden"
                style={{
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.03)",
                  height: 32,
                  padding: "8px",
                  gap: 12,
                }}
              >
                <SidebarSearchIcon />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={`Search over ${Math.floor(icons.length / 5) * 5} logos...`}
                  className="sidebar-search-input flex-1 bg-transparent border-none outline-none"
                  style={{
                    color: searchQuery ? "#ffffff" : "rgba(255,255,255,0.25)",
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
                      searchInputRef.current?.focus();
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

              <div
                ref={categoryContainerRef}
                className="relative flex w-full flex-col"
                style={{ gap: 12 }}
              >
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-0 right-0"
                  initial={false}
                  animate={{
                    top: activeHighlightRect.top,
                    height: activeHighlightRect.height,
                    opacity: 1,
                  }}
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  style={{
                    borderRadius: 8,
                    background: "rgba(116,120,255,0.05)",
                    zIndex: 0,
                  }}
                />
                {categories.map((category) => {
                  const active = activeCategory === category.value;
                  const hovered = hoveredCategory === category.value;
                  const visualState = active ? "active" : hovered ? "hover" : "idle";

                  return (
                    <button
                      key={category.value}
                      ref={(node) => {
                        categoryRefs.current[category.value] = node;
                      }}
                      type="button"
                      onClick={() => {
                        if (activeCategory !== category.value) playSync();
                        setActiveCategory(category.value);
                      }}
                      onPointerEnter={() => {
                        if (hoveredCategory !== category.value) playHover();
                        setHoveredCategory(category.value);
                      }}
                      onPointerLeave={() => setHoveredCategory((prev) => (prev === category.value ? null : prev))}
                      onFocus={() => setHoveredCategory(category.value)}
                      onBlur={() => setHoveredCategory(null)}
                      className="flex items-center justify-between overflow-hidden"
                      style={{
                        position: "relative",
                        zIndex: 2,
                        width: "100%",
                        borderRadius: 8,
                        padding: "8px",
                        background:
                          hovered && !active
                            ? "rgba(255,255,255,0.03)"
                            : "transparent",
                      }}
                    >
                      <div className="flex items-center" style={{ gap: 12 }}>
                        <CategoryIcon category={category.value} state={visualState} />
                        <span
                          style={{
                            fontSize: 12,
                            lineHeight: "normal",
                            color:
                              visualState === "active" || visualState === "hover"
                                ? "#ffffff"
                                : "rgba(255,255,255,0.6)",
                          }}
                        >
                          {category.label}
                        </span>
                      </div>

                      <span
                        style={{
                          fontSize: 12,
                          lineHeight: "normal",
                          color:
                            visualState === "active"
                              ? "rgba(116,120,255,0.6)"
                              : visualState === "hover"
                                ? "rgba(255,255,255,0.6)"
                                : "rgba(255,255,255,0.4)",
                          width: 20,
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        {categoryCounts[category.value] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
            <SuggestLogo />
          </div>
        </aside>

        <section
          className="flex min-w-0 flex-1 flex-col overflow-hidden"
          style={{
            minHeight: 0,
            height: "100%",
          }}
        >
          <div className="relative flex-1 min-h-0 overflow-hidden">
            {/* Category label + progressive blur overlay */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 120,
                zIndex: 3,
                pointerEvents: "none",
              }}
            >
              {isScrolling && (
                <>
                  {[
                    { blur: 1, height: "100%" },
                    { blur: 2, height: "88%" },
                    { blur: 3, height: "76%" },
                    { blur: 4, height: "64%" },
                    { blur: 5, height: "52%" },
                    { blur: 6, height: "40%" },
                    { blur: 8, height: "28%" },
                    { blur: 10, height: "18%" },
                  ].map(({ blur, height }, i) => (
                    <div
                      key={i}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height,
                        backdropFilter: `blur(${blur}px)`,
                        WebkitBackdropFilter: `blur(${blur}px)`,
                        maskImage:
                          "linear-gradient(to bottom, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 24px, rgba(0,0,0,0.96) 38px, rgba(0,0,0,0.76) 52px, rgba(0,0,0,0.32) 64px, rgba(0,0,0,0) 84px)",
                        WebkitMaskImage:
                          "linear-gradient(to bottom, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 24px, rgba(0,0,0,0.96) 38px, rgba(0,0,0,0.76) 52px, rgba(0,0,0,0.32) 64px, rgba(0,0,0,0) 84px)",
                      }}
                    />
                  ))}
                  {/* Restore dot-field visibility over the masked top region */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                    }}
                  >
                    <DotField
                      maskImage="linear-gradient(to bottom, rgba(0,0,0,1) 0px, rgba(0,0,0,1) 24px, rgba(0,0,0,0.96) 38px, rgba(0,0,0,0.76) 52px, rgba(0,0,0,0.32) 64px, rgba(0,0,0,0) 84px)"
                    />
                  </div>
                </>
              )}
            </div>
            {/* Category label + Brand/Solid toggle — above blur layers */}
            <div
              className="mobile-dashboard-toolbar"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 4,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingLeft: 24,
                paddingRight: 24,
                paddingTop: 11,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  pointerEvents: "none",
                  zIndex: -1,
                }}
              >
                <DotField />
              </div>
              <BlurFade
                key={activeLabel}
                delay={0}
                duration={0.45}
                yOffset={6}
              >
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    lineHeight: "normal",
                    color: "rgba(255,255,255,0.4)",
                    margin: 0,
                  }}
                >
                  {activeLabel}
                </p>
              </BlurFade>
              <div
                className="relative flex items-center frost-dither"
                style={{
                  pointerEvents: "auto",
                  width: TOGGLE_INNER_WIDTH,
                  borderRadius: 10,
                  background: TOGGLE_SHELL_BG,
                  backgroundClip: "padding-box",
                  border: TOGGLE_SHELL_BORDER,
                  backdropFilter: "blur(25px)",
                  WebkitBackdropFilter: "blur(25px)",
                  padding: 2,
                }}
              >
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute"
                  style={{
                    left: 0,
                    top: 2,
                    bottom: 2,
                    x: springToggleActiveX,
                    width: springToggleActiveWidth,
                    borderRadius: 8,
                    // Opaque so the parent gradient doesn't bleed through
                    // and make the pill look gradient itself.
                    background: "#1F2124",
                  }}
                />
                <BrandToggle
                  buttonRef={toggleBrandRef}
                  active={!solidMode}
                  onClick={() => {
                    playToggleOff();
                    setSolidMode(false);
                  }}
                >
                  Brand
                </BrandToggle>
                <BrandToggle
                  buttonRef={toggleSolidRef}
                  active={solidMode}
                  onClick={() => {
                    playToggleOn();
                    setSolidMode(true);
                  }}
                >
                  Solid
                </BrandToggle>
              </div>
            </div>
            <div
              ref={scrollContainerRef}
              className="dashboard-logo-scroll mobile-scroll-area absolute inset-0 overflow-auto"
              onMouseMove={(event) => {
                const lock = hoverLockCardRef.current;
                const start = hoverLockPointerRef.current;

                if (!lock || !start) {
                  return;
                }

                if (performance.now() - hoverLockStartedAtRef.current < HOVER_LOCK_GRACE_MS) {
                  return;
                }

                if (
                  Math.abs(event.clientX - start.x) > 8 ||
                  Math.abs(event.clientY - start.y) > 8
                ) {
                  releaseHoverLock();
                }
              }}
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, transparent 60px, rgba(0,0,0,0.3) 72px, black 84px, black 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, transparent 60px, rgba(0,0,0,0.3) 72px, black 84px, black 100%)",
              }}
            >
              {filtered.length === 0 ? (
                <div
                  className="flex h-full flex-col items-center justify-center"
                  style={{ gap: 32 }}
                >
                  {/* Illustration */}
                  <div style={{ paddingRight: 32 }}>
                    <svg
                      width="126.91"
                      height="95.18"
                      viewBox="0 0 166.908 149.232"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      overflow="visible"
                    >
                      <g>
                        <g>
                          <g className="empty-state-icon-bounce">
                            <rect
                              x="35.1921"
                              y="32.8522"
                              width="113.699"
                              height="113.699"
                              rx="31.978"
                              transform="rotate(-10 35.1921 32.8522)"
                              fill="url(#emptyGrad0)"
                              fillOpacity="0.05"
                            />
                            <rect
                              x="35.1921"
                              y="32.8522"
                              width="113.699"
                              height="113.699"
                              rx="31.978"
                              transform="rotate(-10 35.1921 32.8522)"
                              stroke="#323436"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray="6 6"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M94.9052 44.1176C117.506 40.1325 138.578 52.5044 141.972 71.7508C145.366 90.9972 129.795 109.83 107.195 113.815C84.5943 117.8 63.5218 105.428 60.1281 86.182C56.7344 66.9356 72.3047 48.1027 94.9052 44.1176ZM99.4994 70.1723C88.9205 72.0377 81.9426 82.6131 83.9139 93.7931C85.8853 104.973 96.0593 112.524 106.638 110.659C117.217 108.794 124.195 98.2181 122.224 87.038C120.253 75.858 110.078 68.307 99.4994 70.1723ZM95.4432 47.1688C84.8643 49.0341 77.0144 54.6637 77.9099 59.7428C78.8055 64.8219 88.1075 67.4273 98.6865 65.562C109.265 63.6966 117.116 58.0668 116.22 52.9877C115.324 47.9086 106.022 45.3034 95.4432 47.1688Z"
                              fill="url(#emptyGrad1)"
                              stroke="#323436"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeDasharray="6 6"
                            />
                          </g>
                          <path
                            className="empty-state-sparkles"
                            pathLength={1}
                            d="M146.244 9.22386L147.395 1.7006M157.579 19.4973L161.607 18.611M152.906 12.5646L160.936 2.93988"
                            stroke="#323436"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </g>
                        <path
                          d="M11.5066 148.106C-20.9894 119.495 36.2988 103.454 27.443 122.619C20.2291 138.23 -18.8231 90.0889 36.2988 90.0889"
                          stroke="white"
                          strokeOpacity="0.1"
                          strokeWidth="3"
                          strokeLinejoin="round"
                          strokeDasharray="6 6"
                          mask="url(#emptySquiggleMask)"
                        />
                      </g>
                      <defs>
                        <mask
                          id="emptySquiggleMask"
                          maskUnits="userSpaceOnUse"
                          x="-40"
                          y="80"
                          width="100"
                          height="80"
                        >
                          <path
                            className="empty-state-squiggle-mask"
                            d="M11.5066 148.106C-20.9894 119.495 36.2988 103.454 27.443 122.619C20.2291 138.23 -18.8231 90.0889 36.2988 90.0889"
                            stroke="white"
                            strokeWidth="8"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            fill="none"
                            pathLength={1}
                          />
                        </mask>
                        <linearGradient
                          id="emptyGrad0"
                          x1="92.0418"
                          y1="32.8522"
                          x2="92.0418"
                          y2="146.552"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="white" stopOpacity="0" />
                          <stop offset="1" stopColor="white" />
                        </linearGradient>
                        <linearGradient
                          id="emptyGrad1"
                          x1="94.9052"
                          y1="44.1176"
                          x2="107.195"
                          y2="113.815"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="white" stopOpacity="0.05" />
                          <stop offset="1" stopColor="white" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Text */}
                  <div
                    className="flex flex-col items-center"
                    style={{ gap: 32 }}
                  >
                    <div
                      className="flex flex-col items-center"
                      style={{
                        gap: 7,
                        textAlign: "center",
                        lineHeight: 1.4,
                      }}
                    >
                      <p
                        style={{
                          fontFamily: '"Geist Pixel", var(--font-geist-sans), sans-serif',
                          fontSize: 18,
                          lineHeight: "22px",
                          whiteSpace: "nowrap",
                          background:
                            "linear-gradient(to right, #ffffff, rgba(255,255,255,0.6))",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        This logo isn&apos;t here yet
                      </p>
                      <p
                        style={{
                          fontSize: 18,
                          lineHeight: "22px",
                          fontWeight: 400,
                          color: "rgba(255,255,255,0.4)",
                          whiteSpace: "nowrap",
                          width: "auto",
                          maxWidth: "100%",
                        }}
                      >
                        you&apos;re early & found a gap
                      </p>
                    </div>

                    {/* Contribute button */}
                    <div
                      className="flex items-center justify-center"
                      style={{ width: "100%" }}
                    >
                      <a
                        href="https://github.com/ikeacrisp/iconsol"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pressable pressable-soft flex items-center justify-center"
                        style={{
                          width: 128,
                          height: 34,
                          background: "rgba(255,255,255,0.03)",
                          padding: 12,
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 500,
                          lineHeight: "normal",
                          color: "rgba(255,255,255,0.4)",
                          whiteSpace: "nowrap",
                          border: "none",
                          cursor: "pointer",
                          textDecoration: "none",
                          boxSizing: "border-box",
                          transition:
                            "background 180ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                        onClick={() => playSync()}
                        onMouseEnter={(event) => {
                          playHover();
                          event.currentTarget.style.background =
                            "rgba(255,255,255,0.05)";
                          event.currentTarget.style.color = "#ffffff";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.background =
                            "rgba(255,255,255,0.03)";
                          event.currentTarget.style.color =
                            "rgba(255,255,255,0.4)";
                        }}
                        onFocus={(event) => {
                          playHover();
                          event.currentTarget.style.background =
                            "rgba(255,255,255,0.05)";
                          event.currentTarget.style.color = "#ffffff";
                        }}
                        onBlur={(event) => {
                          event.currentTarget.style.background =
                            "rgba(255,255,255,0.03)";
                          event.currentTarget.style.color =
                            "rgba(255,255,255,0.4)";
                        }}
                      >
                        contribute
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    paddingTop: 72,
                    paddingRight: 0,
                    paddingBottom: 184,
                    paddingLeft: 0,
                    minHeight: "100%",
                  }}
                >
                  <div
                    ref={gridContainerRef}
                    className="mobile-dashboard-grid"
                    style={{
                      position: "relative",
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, 160px)",
                      gridAutoRows: "160px",
                      justifyContent: "space-between",
                      justifyItems: "start",
                    alignContent: "start",
                    width: "100%",
                    boxSizing: "border-box",
                    paddingLeft: 24,
                    paddingRight: 24,
                    minHeight: "100%",
                  }}
                    onMouseLeave={() => {
                      releaseHoverLift();
                      releaseHoverLock();
                      hoverLiftArmedRef.current = true;
                      cardOpacity.set(0);
                    }}
                  >
                    <motion.div
                      aria-hidden="true"
                      className="dashboard-icon-card is-active pointer-events-none absolute"
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: 160,
                        height: 160,
                        borderRadius: 24,
                        x: springCardX,
                        y: springCardY,
                        opacity: springCardOpacity,
                        background: "rgba(116,120,255,0.05)",
                      }}
                    />
                    {filtered.map((icon, idx) => {
                      const card = (
                        <IconCard
                          icon={icon}
                          solidMode={solidMode}
                          onActivate={(pointer) => activateCardHover(icon.id, pointer)}
                          onDeactivate={() => deactivateCardHover(icon.id)}
                          registerRef={(node) => {
                            iconRefs.current[icon.id] = node;
                          }}
                        />
                      );

                      // Key on category + mode so every filter change remounts
                      // all cards and triggers a fresh blur-fade reveal. Search
                      // typing keeps the key stable for cards that persist; new
                      // matches mount fresh and naturally blur-fade.
                      return (
                        <BlurFade
                          key={`${activeCategory}-${String(solidMode)}-${icon.id}`}
                          delay={Math.min(idx * 0.02, 0.24)}
                          duration={0.5}
                          yOffset={8}
                        >
                          {card}
                        </BlurFade>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function IconCard({
  icon,
  solidMode,
  onActivate,
  onDeactivate,
  registerRef,
}: {
  icon: Icon;
  solidMode: boolean;
  onActivate: (pointer?: { x: number; y: number }) => void;
  onDeactivate: () => void;
  registerRef: (node: HTMLAnchorElement | null) => void;
}) {
  const router = useRouter();
  const playSwoosh = useSound(swoosh, { volume: 0.35 });
  const playSync = useSound(sync);
  const swooshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const href = solidMode ? `/icon/${icon.id}?mode=solid` : `/icon/${icon.id}`;
  const showNeutralBrandShell =
    !solidMode && !logoVariantHasIntrinsicSurface(icon.id, "brand");

  const handleNavigate = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    playSync();

    if (!shouldUseIconViewTransition()) {
      return;
    }

    const startViewTransition = getDocumentViewTransition();

    if (!startViewTransition) {
      return;
    }

    event.preventDefault();
    setPendingIconTransition(icon.id);

    const frame = event.currentTarget.querySelector<HTMLElement>("[data-icon-frame]");
    const art = event.currentTarget.querySelector<HTMLElement>("[data-icon-art]");

    frame?.style.setProperty("view-transition-name", ICON_FRAME_TRANSITION_NAME);
    art?.style.setProperty("view-transition-name", ICON_ART_TRANSITION_NAME);

    const transition = startViewTransition(() => {
      router.push(href);
    });

    transition.finished.finally(() => {
      frame?.style.removeProperty("view-transition-name");
      art?.style.removeProperty("view-transition-name");
    });
  };

  return (
    <Link
      href={href}
      ref={registerRef}
      className="pressable flex flex-col items-center"
      style={{
        position: "relative",
        zIndex: 1,
        width: 160,
        height: 160,
        flex: "0 0 160px",
      }}
      onMouseEnter={(event) => {
        if (swooshTimerRef.current) clearTimeout(swooshTimerRef.current);
        swooshTimerRef.current = setTimeout(() => {
          playSwoosh();
          swooshTimerRef.current = null;
        }, 110);
        onActivate({ x: event.clientX, y: event.clientY });
      }}
      onMouseLeave={() => {
        if (swooshTimerRef.current) {
          clearTimeout(swooshTimerRef.current);
          swooshTimerRef.current = null;
        }
        onDeactivate();
      }}
      onFocus={() => onActivate()}
      onBlur={onDeactivate}
      onClick={handleNavigate}
    >
      <div
        className="dashboard-icon-card flex flex-col items-center justify-center"
        data-icon-frame=""
        data-icon-card=""
        style={{
          width: 160,
          height: 160,
          borderRadius: 24,
          background: showNeutralBrandShell
            ? "rgba(255,255,255,0.05)"
            : "transparent",
          transition: "background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          data-icon-card-inner=""
          className="flex h-full w-full flex-col items-center justify-center"
          style={{ gap: 24, padding: 20 }}
        >
          <div
            className="flex items-center justify-center overflow-hidden"
            data-icon-art=""
            style={{
              width: 42.038,
              height: 42.038,
            }}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={solidMode ? "solid" : "brand"}
                initial={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                transition={{
                  type: "spring",
                  duration: 0.3,
                  bounce: 0,
                }}
                className="flex items-center justify-center"
                style={{ width: "100%", height: "100%", willChange: "transform, opacity, filter" }}
              >
                {solidMode ? (
                  <SolidLogo id={icon.id} size={32} />
                ) : (
                  <BrandLogo id={icon.id} size={42.038} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <span
            style={{
              fontSize: 12,
              lineHeight: "normal",
              color: "rgba(255,255,255,0.6)",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textAlign: "center",
            }}
          >
            {icon.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

function MobileBottomSearch({
  value,
  onChange,
  onOpenCategories,
}: {
  value: string;
  onChange: (v: string) => void;
  onOpenCategories: () => void;
}) {
  return (
    <div
      className="mobile-only"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 20,
        zIndex: 30,
      }}
    >
      <button
        type="button"
        onClick={onOpenCategories}
        aria-label="Open categories"
        className="pressable pressable-soft flex items-center frost-dither"
        style={{
          width: "100%",
          height: 52,
          padding: "0 20px",
          gap: 12,
          borderRadius: 26,
          background: "rgba(20,22,28,0.55)",
          backgroundClip: "padding-box",
          backdropFilter: "blur(40px) saturate(1.1)",
          WebkitBackdropFilter: "blur(40px) saturate(1.1)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <MaskIcon src="/ui/search.svg" size={16} color="#ffffff" opacity={0.4} />
        <span
          style={{
            fontSize: 14,
            color: value
              ? "rgba(255,255,255,0.9)"
              : "rgba(255,255,255,0.4)",
            flex: 1,
            textAlign: "left",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || "Search over 60 logos..."}
        </span>
      </button>
    </div>
  );
}

function MobileCategoryDrawer({
  categories,
  activeCategory,
  categoryCounts,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onClose,
}: {
  categories: { value: IconCategory | "all"; label: string }[];
  activeCategory: IconCategory | "all";
  categoryCounts: Record<string, number>;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onSelectCategory: (cat: IconCategory | "all") => void;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const playSync = useSound(sync);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="mobile-only"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        background: "rgba(10,11,15,0.4)",
        backdropFilter: "blur(40px) saturate(1.1)",
        WebkitBackdropFilter: "blur(40px) saturate(1.1)",
        animation: "modalBackdropIn 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
      }}
    >
      <div
        className="flex flex-col"
        style={{
          margin: "0 12px 12px",
          padding: 16,
          gap: 8,
          borderRadius: 24,
          background: "rgba(16,18,24,0.86)",
          backgroundClip: "padding-box",
          border: "1px solid rgba(255,255,255,0.06)",
          animation: "modalIn 260ms cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform",
        }}
      >
        <div
          className="flex items-center"
          style={{
            height: 44,
            padding: "0 16px",
            gap: 12,
            borderRadius: 22,
            background: "rgba(255,255,255,0.04)",
          }}
        >
          <MaskIcon src="/ui/search.svg" size={16} color="#ffffff" opacity={0.4} />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search over 60 logos..."
            className="sidebar-search-input flex-1 bg-transparent border-none outline-none"
            style={{
              color: "#fff",
              fontSize: 14,
              lineHeight: "20px",
              minWidth: 0,
              caretColor: "rgba(255,255,255,0.6)",
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") onClose();
            }}
          />
        </div>

        <div className="flex flex-col" style={{ gap: 2 }}>
          {categories.map((category) => {
            const active = category.value === activeCategory;
            return (
              <button
                key={category.value}
                type="button"
                onClick={() => onSelectCategory(category.value)}
                className="pressable pressable-soft flex items-center justify-between"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: active ? "rgba(116,120,255,0.06)" : "transparent",
                }}
              >
                <span className="flex items-center" style={{ gap: 12 }}>
                  <CategoryIcon
                    category={category.value}
                    state={active ? "active" : "idle"}
                  />
                  <span
                    style={{
                      fontSize: 15,
                      color: active ? "#fff" : "rgba(255,255,255,0.8)",
                    }}
                  >
                    {category.label}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: active
                      ? "rgba(116,120,255,0.7)"
                      : "rgba(255,255,255,0.4)",
                  }}
                >
                  {categoryCounts[category.value] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => setSuggestOpen((v) => !v)}
          className="pressable pressable-soft flex items-center justify-between"
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
            marginTop: 4,
          }}
          aria-expanded={suggestOpen}
        >
          <span className="flex items-center" style={{ gap: 8 }}>
            <MaskIcon src="/ui/poap.svg" size={16} color="#ffffff" opacity={0.4} />
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              Suggest a logo
            </span>
          </span>
          <span
            style={{
              display: "inline-flex",
              transform: suggestOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <MaskIcon
              src="/ui/chevron-down.svg"
              size={16}
              color="#ffffff"
              opacity={0.4}
            />
          </span>
        </button>
        {suggestOpen ? (
          <div
            style={{
              padding: "8px 16px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                textWrap: "balance",
              }}
            >
              this directory is maintained by iconsol. Additions are proposed
              via public GitHub requests.
            </p>
            <a
              href="https://github.com/ikeacrisp/iconsol"
              target="_blank"
              rel="noopener noreferrer"
              className="pressable pressable-soft flex items-center justify-center"
              style={{
                width: "100%",
                padding: 12,
                borderRadius: 10,
                background: "rgba(255,255,255,0.05)",
                fontSize: 14,
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
              }}
              onClick={() => playSync()}
            >
              contribute
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}

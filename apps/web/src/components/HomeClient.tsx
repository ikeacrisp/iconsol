"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useSound } from "@web-kits/audio/react";
import { confetti } from "@/lib/audio/core";
import { success } from "@/lib/audio/crisp";
import { BlurFade } from "@/components/BlurFade";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MaskIcon } from "@/components/UiIcon";
import { LOGO_ORDER } from "@/lib/logo-assets";
import { HomeSearchBar } from "@/components/HomeSearchBar";
import type { Icon } from "@/lib/icon-data";

const SURPRISE_RECENT_KEY = "iconsol:surprise-recent";
const SURPRISE_RECENT_LIMIT = 5;

function pickSurpriseLogoId(): string {
  let recent: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(SURPRISE_RECENT_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          recent = parsed.filter((v): v is string => typeof v === "string");
        }
      }
    } catch {
      recent = [];
    }
  }

  const eligible = LOGO_ORDER.filter((id) => !recent.includes(id));
  const pool = eligible.length > 0 ? eligible : LOGO_ORDER;

  let randomIndex = 0;
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    window.crypto.getRandomValues(buf);
    randomIndex = buf[0] % pool.length;
  } else {
    randomIndex = Math.floor(Math.random() * pool.length);
  }
  const picked = pool[randomIndex];

  if (typeof window !== "undefined") {
    const updated = [...recent.filter((id) => id !== picked), picked].slice(
      -SURPRISE_RECENT_LIMIT,
    );
    try {
      window.sessionStorage.setItem(SURPRISE_RECENT_KEY, JSON.stringify(updated));
    } catch {
      // sessionStorage may be blocked (private mode etc.) — silently ignore.
    }
  }

  return picked;
}

const IconGlobe = dynamic(
  () => import("@/components/IconGlobe").then((module) => module.IconGlobe),
  { ssr: false }
);

const DESKTOP_BACKGROUND_IMAGE = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-0.0000090122 -58.004 109.09 -0.00001695 756 982)'><stop stop-color='rgba(123,100,254,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), url("data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0.0000090122 49.1 -120.87 0.000022186 756 0.0000075669)'><stop stop-color='rgba(255,255,255,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, rgb(13, 15, 18) 0%, rgb(13, 15, 18) 100%)`;

const MOBILE_BACKGROUND_IMAGE = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 402 874' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-0.0000023961 -51.624 29.004 -0.000015086 201 874)'><stop stop-color='rgba(123,100,254,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), url("data:image/svg+xml;utf8,<svg viewBox='0 0 402 874' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0.0000023961 43.7 -32.137 0.000019746 201 0.0000067347)'><stop stop-color='rgba(255,255,255,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, rgb(13, 15, 18) 0%, rgb(13, 15, 18) 100%)`;


function CopyInstallButton({
  width,
  copied,
  onCopy,
}: {
  width: number;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="pressable pressable-soft flex items-center frost-dither"
      style={{
        width,
        height: 36,
        padding: "8px 10px 8px 12px",
        justifyContent: "space-between",
        background: copied ? "rgba(20,241,149,0.08)" : "rgba(255,255,255,0.03)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: 8,
        overflow: "hidden",
        transition:
          "background 180ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = copied
          ? "rgba(20,241,149,0.1)"
          : "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = copied
          ? "rgba(20,241,149,0.08)"
          : "rgba(255,255,255,0.03)";
      }}
      aria-label="Copy install command"
    >
      <span
        style={{
          fontFamily:
            'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
          fontSize: 14,
          lineHeight: "20px",
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ color: copied ? "rgba(20,241,149,0.85)" : "rgba(255,255,255,0.6)" }}>
          npm
        </span>
        <span style={{ color: copied ? "rgba(20,241,149,0.68)" : "rgba(255,255,255,0.4)" }}>
          {" i iconsol"}
        </span>
      </span>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: copied ? 1 : 0.4,
          transition:
            "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <MaskIcon
          src={copied ? "/ui/check.svg" : "/ui/copy.svg"}
          size={16}
          color={copied ? "#14f195" : "#ffffff"}
          opacity={1}
        />
      </span>
    </button>
  );
}

// Best-match resolver — name/id/ticker/aliases ranked, returns the icon id.
function bestMatchId(icons: Icon[], rawQuery: string): string | null {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return null;
  let best: { idx: number; rank: number } | null = null;
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
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
      icon.aliases.some((a) => a.toLowerCase().includes(q)) ||
      icon.tags.some((t) => t.toLowerCase().includes(q))
    )
      rank = 2;
    if (rank >= 0 && (!best || rank < best.rank)) {
      best = { idx: i, rank };
    }
  }
  return best ? icons[best.idx].id : null;
}

// Build the relevant subset for the globe centred on a specific icon —
// the anchor itself, its curated `relatedIds` ("commonly used with"),
// and same-category siblings. Used both for typed searches (anchor =
// best query match) and for click-to-refocus (anchor = clicked icon).
function relevantIconsForAnchor(icons: Icon[], anchor: Icon | null): Icon[] {
  if (!anchor) return icons;
  const include = new Set<string>([anchor.id]);
  for (const id of anchor.relatedIds ?? []) include.add(id);
  for (const icon of icons) {
    if (icon.category === anchor.category) include.add(icon.id);
  }
  return icons.filter((icon) => include.has(icon.id));
}

// Stable per-id pseudo-random for jitter — same id always gets the same
// seed so the layout is deterministic across renders (until focus
// changes).
function seedFromId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) h = ((h << 5) + h + id.charCodeAt(i)) | 0;
  return Math.abs(h) >>> 0;
}

function makeRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

// Place the focused logo at (lat=0, lon=0) — the front-centre of the
// globe — with relatedIds in a tight inner ring and same-category
// siblings in a slightly looser outer ring, all on the front-facing
// hemisphere so nothing important hides behind. Returns lat/lon in
// degrees (matching IconGlobe's convention) keyed by icon id.
//
// The polar parametrisation `(θ, α)` treats the focused logo as the
// north pole of a local frame: θ is the angular distance from the
// focused logo, α is the azimuth around it. Converting back to globe
// (x,y,z) where +z is "front": x = sin θ cos α, y = sin θ sin α,
// z = cos θ. Then lat = asin y, lon = atan2(x, z).
const TIER_1_THETA = 0.22; // ~13° from the focused logo (tight)
const TIER_2_THETA = 0.42; // ~24° — still on the front face, much closer
function clusterPositions(
  visibleIcons: Icon[],
  focused: Icon,
): Map<string, { lat: number; lon: number }> {
  const map = new Map<string, { lat: number; lon: number }>();
  map.set(focused.id, { lat: 0, lon: 0 });

  const tier1Ids = new Set(focused.relatedIds ?? []);
  const tier1: Icon[] = [];
  const tier2: Icon[] = [];
  for (const icon of visibleIcons) {
    if (icon.id === focused.id) continue;
    if (tier1Ids.has(icon.id)) tier1.push(icon);
    else tier2.push(icon);
  }

  const placeRing = (group: Icon[], baseTheta: number) => {
    const count = group.length;
    if (count === 0) return;
    group.forEach((icon, i) => {
      const rng = makeRng(seedFromId(icon.id));
      const baseAngle = (i / count) * Math.PI * 2;
      // Per-icon angle/radius jitter for organic placement.
      const angleJitter = (rng() - 0.5) * (Math.PI / count) * 0.8;
      const radiusJitter = baseTheta * (1 + (rng() - 0.5) * 0.18);
      const alpha = baseAngle + angleJitter;
      const theta = radiusJitter;
      const sx = Math.sin(theta) * Math.cos(alpha);
      const sy = Math.sin(theta) * Math.sin(alpha);
      const sz = Math.cos(theta);
      const lat = (Math.asin(sy) * 180) / Math.PI;
      const lon = (Math.atan2(sx, sz) * 180) / Math.PI;
      map.set(icon.id, { lat, lon });
    });
  };

  placeRing(tier1, TIER_1_THETA);
  placeRing(tier2, TIER_2_THETA);
  return map;
}

export function HomeClient({ icons }: { icons: Icon[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [desktopQuery, setDesktopQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const [copied, setCopied] = useState(false);
  // Search mode is the single source of truth — sticky once activated by the
  // user typing into the search bar OR clicking the lens header button.
  // Cleared only by clicking the iconsol logo (per product spec).
  // Initialised to true when arriving with ?lens=1 (e.g. from the dashboard
  // header's lens icon) so the lens behaviour is consistent across pages.
  const [searchMode, setSearchMode] = useState(
    () => searchParams?.get("lens") === "1",
  );
  const playConfetti = useSound(confetti);
  // Stretched ~1.5x with playbackRate 0.65 so the chord rings out a bit
  // longer to match the hover wave, and dropped to volume 0.22 so it
  // sits under the visual instead of competing with it.
  const playSurpriseHover = useSound(success, {
    volume: 0.22,
    playbackRate: 0.65,
  });

  // ---------------- Focus resolution ----------------
  const matchedId = useMemo(
    () => bestMatchId(icons, desktopQuery),
    [icons, desktopQuery],
  );

  // Click-to-refocus: when the user clicks any logo on the globe we
  // pin focus to that id. Cleared whenever the typed query changes
  // so typing supersedes a previous click.
  const [manualFocusId, setManualFocusId] = useState<string | null>(null);
  useEffect(() => {
    setManualFocusId(null);
  }, [desktopQuery]);

  // Manual click takes precedence over the typed match. Empty input
  // and no manual click leaves focusedId null so the globe drops back
  // to its idle auto-spinning state.
  const focusedId = manualFocusId ?? matchedId;

  const focusedIcon = useMemo(
    () => (focusedId ? icons.find((i) => i.id === focusedId) ?? null : null),
    [focusedId, icons],
  );

  // The globe clusters around the current focus: focused icon + its
  // curated relatedIds + same-category siblings. So clicking a logo
  // both refocuses and re-clusters the surrounding icons to be
  // relevant to the newly clicked logo.
  const visibleIcons = useMemo(
    () => relevantIconsForAnchor(icons, focusedIcon),
    [icons, focusedIcon],
  );

  // Lay all visible icons out on the front face of the globe — focused
  // at dead centre, relatedIds in a tight ring around it, same-category
  // siblings in a looser ring further out. Skipped while there's no
  // focus so the idle globe still uses the default fibonacci spread.
  const nodePositions = useMemo(
    () => (focusedIcon ? clusterPositions(visibleIcons, focusedIcon) : null),
    [visibleIcons, focusedIcon],
  );

  // Globe radius — when focused, we keep it tight so the cluster sits
  // close around the focused logo and stays clear of the header / search
  // bar keep-out zones. Idle keeps the full radius so the unfocused
  // fibonacci spread fills the sphere.
  const radiusScale = focusedId ? 0.6 : 1;

  const handleQueryChange = useCallback((next: string) => {
    setDesktopQuery(next);
    if (next.length > 0) setSearchMode(true);
  }, []);

  const handleSurprise = useCallback(() => {
    const id = pickSurpriseLogoId();
    if (searchMode) {
      // In search mode: focus the random logo on the globe by typing its id.
      // Setting the query causes bestMatchId to resolve to it.
      setDesktopQuery(id);
      return;
    }
    router.push(`/icon/${id}`);
  }, [router, searchMode]);

  // The home page is designed to fit the viewport on every breakpoint —
  // lock <html>/<body> overflow while it's mounted so iOS rubber-band
  // can't drag the page around when nothing should actually scroll.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchMode(true);
        desktopInputRef.current?.focus({ preventScroll: true });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // When ?lens=1 hands us into search mode (e.g. dashboard's lens icon),
  // focus the input and strip the param from the URL so it doesn't
  // re-trigger on history navigation.
  useEffect(() => {
    if (searchParams?.get("lens") !== "1") return;
    desktopInputRef.current?.focus({ preventScroll: true });
    router.replace("/", { scroll: false });
  }, [router, searchParams]);

  const handleCopy = useCallback(async () => {
    playConfetti();
    await navigator.clipboard.writeText("npm i iconsol");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [playConfetti]);

  // Submit (Enter): if a focused icon exists, open it. Otherwise fall back
  // to the dashboard route.
  const submitDesktop = useCallback(() => {
    if (focusedId) {
      router.push(`/icon/${focusedId}`);
      return;
    }
    const trimmed = desktopQuery.trim();
    router.push(trimmed ? `/dashboard?q=${encodeURIComponent(trimmed)}` : "/dashboard");
  }, [focusedId, desktopQuery, router]);

  const submitMobile = useCallback(() => {
    const trimmed = mobileQuery.trim();
    router.push(trimmed ? `/dashboard?q=${encodeURIComponent(trimmed)}` : "/dashboard");
  }, [mobileQuery, router]);

  // The × button only clears the query — it does NOT exit search mode.
  // The search bar stays at its lower position; only the iconsol logo
  // returns the page to idle. This is the explicit product spec.
  const handleClear = useCallback(() => {
    setDesktopQuery("");
  }, []);

  // Lens header button is a toggle — clicking it while already in search
  // mode returns the page to its idle landing-page state (clears the query
  // and slides the search bar back to centre).
  const handleLensClick = useCallback(() => {
    setSearchMode((prev) => {
      if (prev) {
        setDesktopQuery("");
        return false;
      }
      desktopInputRef.current?.focus({ preventScroll: true });
      return true;
    });
  }, []);

  const handleSearchActivate = useCallback(() => {
    setSearchMode(true);
  }, []);

  // Iconsol logo click — only meaningful when we're in search mode on the
  // home page; reset state in place rather than navigating to a new route.
  const handleLogoClick = useCallback(() => {
    if (searchMode) {
      setSearchMode(false);
      setDesktopQuery("");
    }
  }, [searchMode]);

  // Click on the globe: clicking a non-focused logo refocuses the
  // globe around that logo (re-clusters its relevant + commonly-used
  // neighbours). Clicking the already-focused logo navigates to its
  // detail page — second click commits.
  const handleGlobeIconClick = useCallback(
    (id: string) => {
      if (id === focusedId) {
        router.push(`/icon/${id}`);
      } else {
        setManualFocusId(id);
        setSearchMode(true);
      }
    },
    [router, focusedId],
  );

  return (
    <>
      <div
        className="relative hidden md:block"
        style={{
          height: "100dvh",
          minHeight: "100dvh",
          maxHeight: "100dvh",
          // overflow:clip (rather than hidden) so programmatic scroll-into-view
          // from input focus() can't shift our supposedly-fixed viewport.
          overflow: "clip",
          backgroundColor: "#0d0f12",
          backgroundImage: DESKTOP_BACKGROUND_IMAGE,
          backgroundRepeat: "no-repeat, no-repeat, no-repeat",
          backgroundSize: "100% 100%, 100% 100%, 100% 100%",
          backgroundPosition: "center center, center center, center center",
          isolation: "isolate",
        }}
      >
        {/*
         * Persistent idle globe — full set, autospinning. ALWAYS mounted
         * with the same scale and rotation regardless of search/cluster
         * state. Only opacity + blur change when a cluster is on screen,
         * so the user never sees the globe re-zoom or jump rotation when
         * a focus is committed.
         */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: searchMode && !focusedId ? "auto" : "none",
            zIndex: 0,
            opacity: focusedId ? 0.32 : 1,
            filter: focusedId ? "blur(5px)" : "none",
            WebkitFilter: focusedId ? "blur(5px)" : "none",
            transition:
              "opacity 320ms cubic-bezier(0.65, 0, 0.35, 1), filter 320ms cubic-bezier(0.65, 0, 0.35, 1)",
          }}
        >
          <IconGlobe
            icons={icons}
            mode="idle"
            onIconClick={handleGlobeIconClick}
            interactive={searchMode && !focusedId}
            idleScale={1.14}
            jitterAmplitude={1.5}
          />
        </div>

        {/*
         * Cluster overlay — focused logo + relevant cluster on the front
         * face. Mounted only while a focus is active. Has its own scale
         * + rotation; the persistent idle globe behind it stays put.
         */}
        {focusedId ? (
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: searchMode ? "auto" : "none",
              zIndex: 1,
              // Lift the focused logo + cluster a touch above the
              // viewport's vertical centre so the focused-logo / pill /
              // search bar / surprise stack reads as centred (without
              // the focused logo sitting dead centre).
              transform: "translateY(-72px)",
              transition:
                "transform 520ms cubic-bezier(0.65, 0, 0.35, 1)",
              willChange: "transform",
            }}
          >
            <IconGlobe
              icons={visibleIcons}
              mode="search"
              focusedId={focusedId}
              onIconClick={handleGlobeIconClick}
              interactive={searchMode}
              idleScale={1.32}
              searchScale={1.5}
              radiusScale={radiusScale}
              jitterAmplitude={1.5}
              nodePositions={nodePositions}
              keepOutBottomVy={
                typeof window !== "undefined"
                  ? window.innerHeight - 220 - 18 - 24
                  : 501
              }
            />
          </div>
        ) : null}

        {/* Focused name pill — anchored to the focused logo (24px below
            its bottom edge), independent of the search bar. Animates
            with opacity + scale + blur on every focus change. */}
        <div
          aria-hidden={!focusedIcon}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            // Shift below focused-logo bottom (~44px half-size) + 24px
            // gap, then apply the same cluster lift so the pill
            // follows the focused logo.
            transform: "translate(-50%, calc(-50% + 68px - 72px))",
            zIndex: 4,
            pointerEvents: "none",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {focusedIcon ? (
              <motion.span
                key={focusedIcon.id}
                initial={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.85, filter: "blur(6px)" }}
                transition={{
                  duration: 0.09,
                  ease: [0.65, 0, 0.35, 1],
                }}
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: 12,
                  background: "rgba(13,15,18,0.5)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid #16181B",
                  fontSize: 13,
                  color: "#ffffff",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.01em",
                  willChange: "transform, opacity, filter",
                }}
              >
                {focusedIcon.name}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 3 }}>
          <Header
            variant="home"
            onLensClick={handleLensClick}
            highlightLens={searchMode}
            onLogoClick={handleLogoClick}
          />
        </div>

        {/*
         * `<main>` itself is pointer-events:none so the globe (behind it)
         * can receive drag pointer events through any empty space; the
         * search column re-enables pointer events on its own contents.
         */}
        <main
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 2,
          }}
        >
          {/*
           * Search bar is the positional anchor — `top` represents the
           * search bar's centre. Pill and Surprise me are absolutely
           * positioned relative to it so the focused-logo + pill + bar +
           * surprise stack reads as a single grouping. In search mode the
           * stack lifts toward the page centre (≈55% down) instead of
           * sitting flush against the footer.
           */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: searchMode ? "calc(100dvh - 220px)" : "50%",
              transform: "translate(-50%, -50%)",
              transition: "top 520ms cubic-bezier(0.65, 0, 0.35, 1)",
              willChange: "top",
              width: 520,
              maxWidth: "calc(100% - 48px)",
              pointerEvents: "auto",
              zIndex: 3,
            }}
          >
            <HomeSearchBar
              value={desktopQuery}
              onChange={handleQueryChange}
              onSubmit={submitDesktop}
              onClear={handleClear}
              onActivate={handleSearchActivate}
              inputRef={desktopInputRef}
              showShortcut
              forceClearAffordance={searchMode}
            />

            {/* Surprise me — 24px below the search bar */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "calc(100% + 24px)",
                transform: "translateX(-50%)",
              }}
            >
              <BlurFade delay={0.2} duration={0.5} yOffset={8}>
                <button
                  type="button"
                  onClick={handleSurprise}
                  onMouseEnter={() => playSurpriseHover()}
                  className="surprise-button pressable flex items-center"
                  style={{
                    gap: 6,
                    transition:
                      "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  <span className="surprise-dice" aria-hidden="true">
                    <MaskIcon src="/ui/dice.svg" size={16} color="#ffffff" opacity={0.4} />
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      lineHeight: "normal",
                      color: "rgba(255,255,255,0.6)",
                      display: "inline-flex",
                    }}
                  >
                    {Array.from("Surprise me").map((char, index) => (
                      <span
                        key={index}
                        className="surprise-letter"
                        style={{ animationDelay: `${index * 0.04}s` }}
                      >
                        {char === " " ? " " : char}
                      </span>
                    ))}
                  </span>
                </button>
              </BlurFade>
            </div>
          </div>
        </main>

        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 3,
            pointerEvents: "auto",
          }}
        >
          <Footer variant="home" />
        </div>
      </div>

      <div
        className="flex flex-col md:hidden"
        style={{
          position: "relative",
          minHeight: "100dvh",
          height: "100dvh",
          overflow: "clip",
          backgroundColor: "#0d0f12",
          backgroundImage: MOBILE_BACKGROUND_IMAGE,
          backgroundRepeat: "no-repeat, no-repeat, no-repeat",
          backgroundSize: "100% 100%, 100% 100%, 100% 100%",
          backgroundPosition: "center center, center center, center center",
          zIndex: 1,
          justifyContent: "space-between",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.28,
            transform: "scale(0.62)",
            overflow: "visible",
          }}
        >
          <IconGlobe />
        </div>

        <Header variant="home" />

        <div
          className="flex flex-col items-center"
          style={{
            width: "100%",
            flex: 1,
            minHeight: 0,
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
            paddingLeft: 42,
            paddingRight: 42,
          }}
        >
          <CopyInstallButton width={219} copied={copied} onCopy={handleCopy} />

          <p
            style={{
              maxWidth: 320,
              fontFamily: '"Geist Pixel", var(--font-geist-sans), sans-serif',
              fontSize: 28,
              lineHeight: "40px",
              textAlign: "center",
              color: "transparent",
              backgroundImage:
                "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.2) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              flexShrink: 0,
              marginTop: 24,
              marginBottom: 24,
            }}
          >
            A crisp set of Solana Ecosystem logos
          </p>

          <div
            className="flex items-center justify-center"
            style={{ gap: 8, paddingRight: 20, flexShrink: 0, marginBottom: 64 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ui/mobile-annotation.svg"
              alt=""
              width={20}
              height={20}
              style={{ display: "block", width: 20, height: 20 }}
            />
            <p
              style={{
                fontSize: 14,
                lineHeight: "normal",
                color: "rgba(255,255,255,0.6)",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-geist-sans), sans-serif",
              }}
            >
              Best viewed on Desktop
            </p>
          </div>

          <HomeSearchBar
            value={mobileQuery}
            onChange={setMobileQuery}
            onSubmit={submitMobile}
            inputRef={mobileInputRef}
            showShortcut={false}
          />
        </div>

        <Footer variant="home" />
      </div>
    </>
  );
}

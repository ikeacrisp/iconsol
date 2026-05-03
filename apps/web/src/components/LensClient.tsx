"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSound } from "@web-kits/audio/react";
import { success } from "@/lib/audio/crisp";
import { BlurFade } from "@/components/BlurFade";
import { MaskIcon } from "@/components/UiIcon";
import { LOGO_ORDER } from "@/lib/logo-assets";
import { HomeSearchBar } from "@/components/HomeSearchBar";
import type { Icon } from "@/lib/icon-data";

const SOLANA_FOCUS_ID = "sol";
const SURPRISE_RECENT_KEY = "iconsol:surprise-recent";
const SURPRISE_RECENT_LIMIT = 5;

const IconGlobe = dynamic(
  () => import("@/components/IconGlobe").then((module) => module.IconGlobe),
  { ssr: false },
);

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
      // ignore
    }
  }
  return picked;
}

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
    else if (id.startsWith(q) || ticker.startsWith(q) || name.startsWith(q))
      rank = 1;
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

/**
 * /lens — standalone always-on version of the home page's search-mode
 * experience. The interactive globe is mounted with `mode="search"` from
 * the start (Solana focused by default) so the user lands directly in
 * the explore-by-rotation interaction without needing to type or click
 * the lens header button.
 */
export function LensClient({ icons }: { icons: Icon[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const playSurpriseHover = useSound(success, {
    volume: 0.22,
    playbackRate: 0.65,
  });

  const matchedId = useMemo(() => bestMatchId(icons, query), [icons, query]);
  const focusedId = matchedId ?? SOLANA_FOCUS_ID;

  const focusedIcon = useMemo(
    () => icons.find((i) => i.id === focusedId) ?? null,
    [focusedId, icons],
  );

  // Lock viewport scroll while the lens page is mounted — the experience
  // is designed to fit the viewport.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    const prevOverscroll = body.style.overscrollBehavior;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
      body.style.overscrollBehavior = prevOverscroll;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleSubmit = useCallback(() => {
    if (focusedId) router.push(`/icon/${focusedId}`);
  }, [router, focusedId]);

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  const handleSurprise = useCallback(() => {
    setQuery(pickSurpriseLogoId());
  }, []);

  const handleGlobeIconClick = useCallback(
    (id: string) => {
      router.push(`/icon/${id}`);
    },
    [router],
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
      }}
    >
      <IconGlobe
        icons={icons}
        mode="search"
        focusedId={focusedId}
        onIconClick={handleGlobeIconClick}
        interactive
      />

      {/* Search column — pinned 64px above the footer (footer height 73px). */}
      <div
        className="flex flex-col items-center"
        style={{
          position: "absolute",
          left: "50%",
          top: "calc(100dvh - 155px)",
          transform: "translate(-50%, -50%)",
          width: 520,
          maxWidth: "calc(100% - 48px)",
          pointerEvents: "auto",
          zIndex: 5,
        }}
      >
        {/* Focused icon name pill */}
        <div
          style={{
            height: 28,
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            opacity: focusedIcon ? 1 : 0,
            transition: "opacity 320ms cubic-bezier(0.65, 0, 0.35, 1)",
            pointerEvents: "none",
          }}
        >
          {focusedIcon ? (
            <span
              style={{
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
              }}
            >
              {focusedIcon.name}
            </span>
          ) : null}
        </div>

        <HomeSearchBar
          value={query}
          onChange={setQuery}
          onSubmit={handleSubmit}
          onClear={handleClear}
          inputRef={inputRef}
          showShortcut
          forceClearAffordance
        />

        <BlurFade delay={0.2} duration={0.5} yOffset={8}>
          <button
            type="button"
            onClick={handleSurprise}
            onMouseEnter={() => playSurpriseHover()}
            className="surprise-button pressable flex items-center"
            style={{
              gap: 6,
              marginTop: 24,
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
                  {char === " " ? " " : char}
                </span>
              ))}
            </span>
          </button>
        </BlurFade>
      </div>
    </div>
  );
}

"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSound } from "@web-kits/audio/react";
import { confetti } from "@/lib/audio/core";
import { success } from "@/lib/audio/crisp";
import { BlurFade } from "@/components/BlurFade";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MaskIcon } from "@/components/UiIcon";
import { ICON_COUNT } from "@/lib/icon-count";
import { LOGO_ORDER } from "@/lib/logo-assets";
import { easingGradient, easingGradientMulti } from "@/lib/easing-gradient";

/**
 * Pick a random logo id, but exclude the last `RECENT_LIMIT` picks so the
 * same logo can't appear twice within that window. State persists across
 * navigations via sessionStorage so /icon/{id} → back → "Surprise me"
 * still respects the no-repeat rule.
 */
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

  // Prefer crypto for a uniform draw; fall back to Math.random.
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

const IconGlobe = dynamic(
  () => import("@/components/IconGlobe").then((module) => module.IconGlobe),
  { ssr: false }
);

const DESKTOP_BACKGROUND_IMAGE = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-0.0000090122 -58.004 109.09 -0.00001695 756 982)'><stop stop-color='rgba(123,100,254,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), url("data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0.0000090122 49.1 -120.87 0.000022186 756 0.0000075669)'><stop stop-color='rgba(255,255,255,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, rgb(13, 15, 18) 0%, rgb(13, 15, 18) 100%)`;

const MOBILE_BACKGROUND_IMAGE = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 402 874' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-0.0000023961 -51.624 29.004 -0.000015086 201 874)'><stop stop-color='rgba(123,100,254,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), url("data:image/svg+xml;utf8,<svg viewBox='0 0 402 874' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0.0000023961 43.7 -32.137 0.000019746 201 0.0000067347)'><stop stop-color='rgba(255,255,255,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, rgb(13, 15, 18) 0%, rgb(13, 15, 18) 100%)`;

const SEARCH_GLOW_MASK =
  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.12) 44%, rgba(0,0,0,0.52) 58%, rgba(0,0,0,1) 100%)";
const SEARCH_GLOW_BACKGROUND =
  "radial-gradient(84% 160% at 25% 100%, rgba(134,98,255,0.62) 0%, rgba(126,93,255,0.42) 24%, rgba(113,84,238,0.24) 44%, rgba(93,69,196,0.1) 58%, rgba(18,20,26,0) 68%), radial-gradient(84% 160% at 75% 100%, rgba(91,227,255,0.62) 0%, rgba(78,212,250,0.42) 24%, rgba(63,175,224,0.24) 44%, rgba(44,128,170,0.1) 58%, rgba(18,20,26,0) 68%)";
const HOME_SEARCH_PLACEHOLDER = `Search over ${ICON_COUNT} logos...`;

function SearchGlowLayer({ rounded = 24 }: { rounded?: number }) {
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

function HomeSearchBar({
  value,
  onChange,
  onSubmit,
  inputRef,
  showShortcut,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  showShortcut: boolean;
}) {
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
      onClick={() => inputRef.current?.focus()}
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
          placeholder={HOME_SEARCH_PLACEHOLDER}
          className="flex-1 bg-transparent border-none outline-none"
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 14,
            lineHeight: "normal",
            caretColor: "rgba(255,255,255,0.6)",
            minWidth: 0,
          }}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSubmit();
          }}
        />
      </div>
      {showShortcut ? (
        <button
          type="button"
          aria-label="Focus search"
          onClick={(event) => {
            event.stopPropagation();
            inputRef.current?.focus();
          }}
          className="pressable pressable-soft flex items-center justify-center"
          style={{
            width: "fit-content",
            height: "fit-content",
            padding: 0,
            borderRadius: 8,
            background: "transparent",
            backdropFilter: "none",
            WebkitBackdropFilter: "none",
            flexShrink: 0,
            opacity: 0.4,
            position: "relative",
            zIndex: 2,
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
        </button>
      ) : null}
    </div>
  );
}


export default function Home() {
  const router = useRouter();
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const [desktopQuery, setDesktopQuery] = useState("");
  const [mobileQuery, setMobileQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const playConfetti = useSound(confetti);
  // Stretched ~1.5x with playbackRate 0.65 so the chord rings out a bit
  // longer to match the hover wave, and dropped to volume 0.22 so it
  // sits under the visual instead of competing with it.
  const playSurpriseHover = useSound(success, {
    volume: 0.22,
    playbackRate: 0.65,
  });

  const handleSurprise = useCallback(() => {
    const id = pickSurpriseLogoId();
    router.push(`/icon/${id}`);
  }, [router]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        desktopInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleCopy = useCallback(async () => {
    playConfetti();
    await navigator.clipboard.writeText("npm i iconsol");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [playConfetti]);

  const submitSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      router.push(trimmed ? `/dashboard?q=${encodeURIComponent(trimmed)}` : "/dashboard");
    },
    [router]
  );

  return (
    <>
      <div
        className="relative hidden overflow-hidden md:block"
        style={{
          height: "100dvh",
          minHeight: "100dvh",
          maxHeight: "100dvh",
          backgroundColor: "#0d0f12",
          backgroundImage: DESKTOP_BACKGROUND_IMAGE,
          backgroundRepeat: "no-repeat, no-repeat, no-repeat",
          backgroundSize: "100% 100%, 100% 100%, 100% 100%",
          backgroundPosition: "center center, center center, center center",
          isolation: "isolate",
        }}
      >
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          <IconGlobe />
        </div>

        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 2 }}>
          <Header variant="home" />
        </div>

        <main
          className="flex h-full items-center justify-center"
          style={{ position: "relative", paddingLeft: 24, paddingRight: 24 }}
        >
          <div className="flex flex-col items-center" style={{ width: 520, maxWidth: "100%" }}>
            <HomeSearchBar
              value={desktopQuery}
              onChange={setDesktopQuery}
              onSubmit={() => submitSearch(desktopQuery)}
              inputRef={desktopInputRef}
              showShortcut
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
                      {char === " " ? " " : char}
                    </span>
                  ))}
                </span>
              </button>
            </BlurFade>
          </div>
        </main>

        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 2 }}>
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
            onSubmit={() => submitSearch(mobileQuery)}
            inputRef={mobileInputRef}
            showShortcut={false}
          />
        </div>

        <Footer variant="home" />
      </div>
    </>
  );
}

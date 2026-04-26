"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSound } from "@web-kits/audio/react";
import { confetti } from "@/lib/audio/core";
import { BlurFade } from "@/components/BlurFade";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MaskIcon } from "@/components/UiIcon";
import { ICON_COUNT } from "@/lib/icon-count";
import { easingGradient, easingGradientMulti } from "@/lib/easing-gradient";

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
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.18)",
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

function MobileFooter() {
  return (
    <footer
      style={{
        width: "100%",
        minHeight: 71,
        padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))",
        flexShrink: 0,
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ width: "100%", minHeight: 23, gap: 12 }}
      >
        <p
          style={{
            fontSize: 12,
            lineHeight: "normal",
            color: "rgba(255,255,255,0.6)",
            whiteSpace: "nowrap",
          }}
        >
          built by{" "}
          <a
            href="https://x.com/juicebox_it"
            target="_blank"
            rel="noopener noreferrer"
            className="pressable pressable-soft"
            style={{
              display: "inline-flex",
              alignItems: "center",
              verticalAlign: "middle",
              opacity: 0.6,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ui/juicebox-logo.svg"
              alt="Juicebox"
              style={{ display: "block", height: 16, width: "auto" }}
            />
          </a>
        </p>
        <div className="flex items-center" style={{ gap: 10 }}>
          <a
            href="https://opensource.org/license/mit"
            target="_blank"
            rel="noopener noreferrer"
            className="pressable pressable-soft"
            style={{
              fontSize: 12,
              lineHeight: "normal",
              color: "rgba(255,255,255,0.6)",
              whiteSpace: "nowrap",
              textDecoration: "none",
            }}
          >
            MIT Licensed
          </a>
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <p
              style={{
                fontFamily:
                  'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
                fontSize: 12,
                lineHeight: "16px",
                color: "rgba(255,255,255,0.4)",
                whiteSpace: "nowrap",
              }}
            >
              v0.1.0
            </p>
          </div>
        </div>
      </div>
    </footer>
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
                onClick={() => router.push("/dashboard?surprise=1")}
                className="pressable flex items-center"
                style={{
                  gap: 6,
                  marginTop: 24,
                  transition:
                    "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <MaskIcon src="/ui/dice.svg" size={16} color="#ffffff" opacity={0.4} />
                <span style={{ fontSize: 14, lineHeight: "normal", color: "rgba(255,255,255,0.6)" }}>
                  Surprise me
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

        <header
          style={{
            width: "100%",
            padding: "24px 24px 0",
            flexShrink: 0,
            minHeight: 84,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div className="flex items-center justify-between" style={{ width: "100%", minHeight: 36 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/iconsol-logo.svg"
              alt="iconsol"
              width={106.324}
              height={23.898}
              style={{ width: 106.324, height: 23.898 }}
            />

            <div className="flex items-center" style={{ gap: 14 }}>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="pressable pressable-soft flex items-center justify-center"
                style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", opacity: 0.7 }}
              >
                <MaskIcon src="/ui/grid-dashboard.svg" size={16} color="#ffffff" opacity={1} />
              </button>
              <a
                href="https://github.com/ikeacrisp/iconsol"
                target="_blank"
                rel="noopener noreferrer"
                className="pressable pressable-soft flex items-center justify-center"
                style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", opacity: 0.7 }}
              >
                <MaskIcon src="/ui/github.svg" size={16} color="#ffffff" opacity={1} />
              </a>
            </div>
          </div>
        </header>

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

        <MobileFooter />
      </div>
    </>
  );
}

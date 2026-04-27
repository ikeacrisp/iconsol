"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { ComponentType, MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSound } from "@web-kits/audio/react";
import { ImageIcon, MaskIcon } from "@/components/UiIcon";
import { ICON_COUNT } from "@/lib/icon-count";
import { confetti } from "@/lib/audio/core";

type Framework = "react" | "react-native" | "swift" | "html" | "svg";

const FRAMEWORK_CONFIG: Record<
  Framework,
  { label: string; npmPrefix: string; npmPkg: string }
> = {
  react: { label: "React", npmPrefix: "npm", npmPkg: " i iconsol" },
  "react-native": { label: "React Native", npmPrefix: "npm", npmPkg: " i iconsol" },
  swift: { label: "Swift", npmPrefix: "npm", npmPkg: " i iconsol" },
  html: { label: "HTML", npmPrefix: "npm", npmPkg: " i iconsol" },
  svg: { label: "SVG", npmPrefix: "npm", npmPkg: " i iconsol" },
};

function SearchIcon() {
  return <MaskIcon src="/ui/search.svg" size={16} color="#ffffff" opacity={1} />;
}

function CopyIcon({ copied = false }: { copied?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{ position: "relative", display: "inline-block", width: 16, height: 16 }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={copied ? "check" : "copy"}
          initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.32, bounce: 0 }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            willChange: "transform, opacity, filter",
          }}
        >
          <MaskIcon
            src={copied ? "/ui/check.svg" : "/ui/copy.svg"}
            size={copied ? 14 : 16}
            color={copied ? "#28E0B9" : "#ffffff"}
            opacity={1}
          />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function GridIcon() {
  return <MaskIcon src="/ui/grid-dashboard.svg" size={16} color="#ffffff" opacity={1} />;
}

function GithubIcon() {
  return <MaskIcon src="/ui/github.svg" size={16} color="#ffffff" opacity={1} />;
}

const GITHUB_REPO_URL = "https://github.com/ikeacrisp/iconsol";

function GithubLink() {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="iconsol on GitHub"
      className="pressable pressable-soft flex items-center justify-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        flexShrink: 0,
        opacity: hovered ? 1 : 0.4,
        background: hovered ? "rgba(255,255,255,0.03)" : "transparent",
        transition:
          "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        textDecoration: "none",
      }}
    >
      <GithubIcon />
    </a>
  );
}

function ChevronDownIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 24,
        height: 24,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width="10.0001"
        height="6.00007"
        viewBox="0 0 10.0001 6.00007"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: "block" }}
      >
        <path
          d="M1.00007 1.00007C2.06213 2.46195 3.30715 3.77135 4.70219 4.89427C4.87744 5.03534 5.1227 5.03534 5.29795 4.89427C6.69299 3.77135 7.93801 2.46195 9.00007 1.00007"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function ReactIcon() {
  return <ImageIcon src="/ui/react-badge.svg" size={20} alt="React" />;
}

function ReactNativeIcon() {
  return <ImageIcon src="/ui/react-badge.svg" size={20} alt="React Native" />;
}

function SwiftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20.5 17.6c-.1-.2-.2-.4-.4-.6 3.5-4.6 1.4-9.2.6-10.5C18.6 3 14.4 1 10.4 1H1v22h11.7c1.7 0 3.4-.4 4.7-1 .4-.2.7-.4 1-.7v.1c1 .8 2.4.7 3 .4 1-.2 1.7-1 2.2-2 .3-.6.4-1.4.4-2.2zM15 18.6c-3-1.7-5.6-4.2-7.6-7.2 2 1.8 4.4 3.3 7 4.4-2-1.5-3.8-3.3-5.4-5.3 2.7 2.6 5.7 4.4 9.6 5.5-.1-1.6-.7-3-1.5-4.3 1 2 1.4 4.3 1.2 6.5-.5.4-1 .8-1.7 1.1-.5-.4-1-.6-1.6-.7z"
        fill="#F05138"
      />
    </svg>
  );
}

function HtmlIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 2h18l-1.6 18L12 22l-7.4-2L3 2z" fill="#E44D26" />
      <path d="M12 4v16.4l6-1.7L19.3 4H12z" fill="#F16529" />
      <path
        d="M7.5 8.5l.2 2h4.3v-2H7.5zm.4 4l.6 6.4 3.5 1v-2.1l-1.7-.5-.1-1.4H8.4l.1 2H7.9zM12 8.5v2h4.4l-.4 4.4-4 1.1v2.1l3.5-1 .6-6.4h-3.7v-2h3.9l.2-2H12z"
        fill="#fff"
      />
    </svg>
  );
}

function SvgIcon() {
  return <ImageIcon src="/ui/svg-file.svg" size={20} alt="SVG" />;
}

const FRAMEWORK_ICONS: Record<Framework, ComponentType> = {
  react: ReactIcon,
  "react-native": ReactNativeIcon,
  swift: SwiftIcon,
  html: HtmlIcon,
  svg: SvgIcon,
};

function AnimatedFrameworkIcon({ framework }: { framework: Framework }) {
  const [displayed, setDisplayed] = useState(framework);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (framework === displayed) return;
    setVisible(false);
    const timer = window.setTimeout(() => {
      setDisplayed(framework);
      setVisible(true);
    }, 110);
    return () => window.clearTimeout(timer);
  }, [displayed, framework]);

  const Icon = FRAMEWORK_ICONS[displayed];

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.94)",
        transition:
          "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <Icon />
    </div>
  );
}

function NpmBox({
  framework,
  copied,
  onCopy,
}: {
  framework: Framework;
  copied: boolean;
  onCopy: () => void;
}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const [contentWidth, setContentWidth] = useState<number>();
  const config = FRAMEWORK_CONFIG[framework];

  useLayoutEffect(() => {
    if (textRef.current) {
      setContentWidth(textRef.current.scrollWidth);
    }
  }, [framework]);

  return (
    <button
      type="button"
      onClick={onCopy}
      className="squircle-60 pressable pressable-soft flex items-center overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: 8,
        padding: "8px 12px",
        gap: 42,
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "rgba(255,255,255,0.07)";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "rgba(255,255,255,0.05)";
      }}
      aria-label={`Copy ${config.label} install command`}
    >
      <span
        style={{
          width: contentWidth,
          overflow: "hidden",
          display: "inline-block",
          transition: "width 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <span
          ref={textRef}
          className="inline-block whitespace-nowrap"
          style={{ fontSize: 14, lineHeight: "normal" }}
        >
          <span style={{ color: "rgba(255,255,255,0.6)" }}>{config.npmPrefix}</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>{config.npmPkg}</span>
        </span>
      </span>
      <div
        style={{
          opacity: copied ? 0.75 : 1,
          transition: "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <CopyIcon copied={copied} />
      </div>
    </button>
  );
}

function MenuIcon() {
  return (
    <span
      aria-hidden="true"
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20 }}
    >
      <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M1 1H17M1 9H17"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

function MobileHeader({
  onMenuOpen,
  className,
}: {
  onMenuOpen: () => void;
  className?: string;
}) {
  return (
    <header className={className} style={{ width: "100%", padding: "20px 20px", flexShrink: 0 }}>
      <div className="flex items-center justify-between" style={{ width: "100%", minHeight: 32 }}>
        <Link href="/" aria-label="Go to iconsol home" style={{ display: "inline-flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/iconsol-logo.svg"
            alt="iconsol"
            width={88.618}
            height={19.919}
            style={{ width: 88.618, height: 19.919 }}
          />
        </Link>
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open menu"
          className="pressable pressable-soft flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "transparent",
            opacity: 0.4,
            transition:
              "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <MenuIcon />
        </button>
      </div>
    </header>
  );
}

function MenuLink({
  href,
  onClose,
  label,
  external = false,
}: {
  href: string;
  onClose: () => void;
  label: string;
  external?: boolean;
}) {
  const style = {
    display: "block",
    padding: "14px 14px",
    borderRadius: 12,
    background: "rgba(255,255,255,0.03)",
    color: "rgba(255,255,255,0.8)",
    fontSize: 15,
    fontWeight: 500,
    textDecoration: "none",
  } as const;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="pressable pressable-soft"
        onClick={onClose}
        style={style}
      >
        {label}
      </a>
    );
  }

  return (
    <Link href={href} onClick={onClose} className="pressable pressable-soft" style={style}>
      {label}
    </Link>
  );
}

function MobileMenu({
  onClose,
  framework,
  setFramework,
  copied,
  onCopy,
}: {
  onClose: () => void;
  framework: Framework;
  setFramework: (framework: Framework) => void;
  copied: boolean;
  onCopy: () => void;
}) {
  const npmCommand = FRAMEWORK_CONFIG[framework].npmPrefix + FRAMEWORK_CONFIG[framework].npmPkg;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="mobile-only"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        background: "rgba(10,11,15,0.72)",
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        animation: "modalBackdropIn 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="flex flex-col"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "20px 20px 24px",
          gap: 24,
          animation: "modalIn 260ms cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform",
        }}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/"
            aria-label="Go to iconsol home"
            onClick={onClose}
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/iconsol-logo.svg"
              alt="iconsol"
              width={88.618}
              height={19.919}
              style={{ width: 88.618, height: 19.919 }}
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="pressable pressable-soft flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.8)",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>

        <button
          type="button"
          onClick={onCopy}
          className="pressable pressable-soft flex items-center justify-between"
          style={{
            width: "100%",
            height: 44,
            padding: "10px 14px",
            borderRadius: 12,
            background: copied ? "rgba(40,224,185,0.04)" : "rgba(255,255,255,0.04)",
            transition: "background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          aria-label="Copy install command"
        >
          <span
            style={{
              fontFamily:
                'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
              fontSize: 14,
              lineHeight: "20px",
              transition: "color 180ms cubic-bezier(0.16, 1, 0.3, 1)",
              color: copied ? "rgba(40,224,185,0.6)" : "rgba(255,255,255,0.6)",
            }}
          >
            {npmCommand}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: copied ? 1 : 0.4,
              transition: "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <CopyIcon copied={copied} />
          </span>
        </button>

        <div
          className="flex flex-col"
          style={{
            gap: 4,
            padding: 6,
            borderRadius: 12,
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", padding: "6px 10px" }}>
            Framework
          </span>
          {(Object.keys(FRAMEWORK_CONFIG) as Framework[]).map((option) => {
            const active = option === framework;
            const Icon = FRAMEWORK_ICONS[option];
            return (
              <button
                key={option}
                type="button"
                onClick={() => setFramework(option)}
                className="pressable pressable-soft flex items-center"
                style={{
                  width: "100%",
                  borderRadius: 8,
                  padding: "8px 10px",
                  gap: 12,
                  background: active ? "rgba(255,255,255,0.05)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.6)",
                }}
              >
                <span className="flex items-center justify-center" style={{ width: 28, height: 28 }}>
                  <Icon />
                </span>
                <span style={{ fontSize: 14 }}>{FRAMEWORK_CONFIG[option].label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col" style={{ gap: 4 }}>
          <MenuLink href="/docs" onClose={onClose} label="Docs" />
          <MenuLink
            href="https://github.com/ikeacrisp/iconsol"
            onClose={onClose}
            label="GitHub"
            external
          />
          <MenuLink href="/submit" onClose={onClose} label="Submit a logo" />
        </div>
      </div>
    </div>
  );
}

interface HeaderProps {
  variant?: "home" | "dashboard";
  highlightGrid?: boolean;
  showInlineSearch?: boolean;
}

export function Header({
  variant = "home",
  highlightGrid = false,
  showInlineSearch = variant === "dashboard",
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [framework, setFramework] = useState<Framework>("react");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nextQuery = new URLSearchParams(window.location.search).get("q") ?? "";
    setSearchQuery(nextQuery);
  }, [pathname]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handlePointerDown = (event: MouseEvent | globalThis.MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [dropdownOpen]);

  const npmCommand = FRAMEWORK_CONFIG[framework].npmPrefix + FRAMEWORK_CONFIG[framework].npmPkg;
  const playConfetti = useSound(confetti);

  const handleCopy = useCallback(async () => {
    playConfetti();
    await navigator.clipboard.writeText(npmCommand);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }, [npmCommand, playConfetti]);

  const handleSearchSubmit = useCallback(() => {
    const query = searchQuery.trim();
    router.push(query ? `/dashboard?q=${encodeURIComponent(query)}` : "/dashboard");
  }, [router, searchQuery]);

  const isDashboard = variant === "dashboard" || variant === "home";

  if (isDashboard) {
    return (
      <>
        <MobileHeader onMenuOpen={() => setDropdownOpen(true)} className="mobile-only" />
        {dropdownOpen ? (
          <MobileMenu
            onClose={() => setDropdownOpen(false)}
            framework={framework}
            setFramework={setFramework}
            copied={copied}
            onCopy={handleCopy}
          />
        ) : null}
        <header className="desktop-only" style={{ width: "100%", padding: 24, flexShrink: 0 }}>
          <div className="flex items-center justify-between" style={{ width: "100%", minHeight: 36 }}>
            <Link
              href="/"
              aria-label="Go to iconsol home"
              style={{ display: "inline-flex", alignItems: "center", flexShrink: 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/iconsol-logo.svg"
                alt="iconsol"
                width={88.618}
                height={19.919}
                style={{ width: 88.618, height: 19.919 }}
              />
            </Link>

            <div className="flex items-center" style={{ gap: 12, flexShrink: 0 }}>
              <div className="flex items-center" style={{ gap: 6 }}>
                <Link
                  href="/dashboard"
                  aria-label="Open dashboard"
                  className="pressable pressable-soft flex items-center justify-center"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: highlightGrid ? "rgba(255,255,255,0.02)" : "transparent",
                    opacity: 0.4,
                    transition:
                      "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.opacity = "1";
                    event.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.opacity = "0.4";
                    event.currentTarget.style.background = highlightGrid
                      ? "rgba(255,255,255,0.02)"
                      : "transparent";
                  }}
                >
                  <GridIcon />
                </Link>

                <GithubLink />
              </div>

              <div
                className="flex items-center frost-dither"
                style={{
                  width: 176,
                  height: 32,
                  padding: "8px 10px",
                  background: copied ? "rgba(40,224,185,0.03)" : "rgba(255,255,255,0.03)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  borderRadius: 8,
                  overflow: "hidden",
                  justifyContent: "space-between",
                  transition: "background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <button
                  type="button"
                  onClick={async () => {
                    playConfetti();
                    await navigator.clipboard.writeText("npm i iconsol");
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1800);
                  }}
                  className="pressable pressable-soft flex items-center"
                  style={{
                    flex: "1 1 auto",
                    minWidth: 0,
                    height: "100%",
                    background: "transparent",
                    padding: 0,
                    gap: 8,
                    justifyContent: "flex-start",
                  }}
                  aria-label="Copy install command"
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 16,
                      height: 16,
                      flexShrink: 0,
                      opacity: copied ? 1 : 0.4,
                      transition: "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <CopyIcon copied={copied} />
                  </span>
                  <span
                    style={{
                      fontFamily:
                        'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: "normal",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span
                      style={{
                        color: copied ? "rgba(40,224,185,0.6)" : "rgba(255,255,255,0.6)",
                        transition: "color 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      npm
                    </span>
                    <span
                      style={{
                        color: copied ? "rgba(40,224,185,0.4)" : "rgba(255,255,255,0.4)",
                        transition: "color 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                      }}
                    >
                      {" i iconsol"}
                    </span>
                  </span>
                </button>

                <div
                  aria-hidden="true"
                  style={{
                    width: 1.5,
                    alignSelf: "stretch",
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 50,
                    flexShrink: 0,
                    margin: "0 8px",
                  }}
                />

                <button
                  type="button"
                  className="pressable pressable-soft flex items-center justify-center"
                  style={{
                    width: 16,
                    height: 16,
                    padding: 0,
                    background: "transparent",
                    flexShrink: 0,
                    opacity: 0.4,
                    transition: "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.opacity = "1";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.opacity = "0.4";
                  }}
                  aria-label="More install options"
                  aria-haspopup="menu"
                  aria-expanded={false}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                    style={{ display: "block" }}
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>
      </>
    );
  }

  return (
    <>
      <MobileHeader onMenuOpen={() => setDropdownOpen(true)} className="mobile-only" />
      {dropdownOpen ? (
        <MobileMenu
          onClose={() => setDropdownOpen(false)}
          framework={framework}
          setFramework={setFramework}
          copied={copied}
          onCopy={handleCopy}
        />
      ) : null}

      <header className="desktop-only" style={{ width: "100%", padding: isDashboard && showInlineSearch ? 42 : 24 }}>
        <div className="flex items-center justify-between" style={{ width: "100%" }}>
          <div className="flex items-center" style={{ gap: isDashboard ? 180 : 0 }}>
            <Link
              href="/"
              aria-label="Go to iconsol home"
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/iconsol-logo.svg"
                alt="iconsol"
                width={88.618}
                height={19.919}
                style={{ width: 88.618, height: 19.919 }}
              />
            </Link>

            {isDashboard && showInlineSearch ? (
              <div style={{ width: 428, maxWidth: "calc(100vw - 420px)" }}>
                <div
                  className="flex items-center justify-between overflow-hidden"
                  style={{
                    height: 56,
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: 16,
                    padding: "0 18px 0 24px",
                  }}
                >
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleSearchSubmit();
                    }}
                    placeholder={`Search over ${ICON_COUNT} logos...`}
                    className="flex-1 bg-transparent border-none outline-none"
                    style={{
                      color: "#fff",
                      fontSize: 14,
                      lineHeight: "20px",
                      caretColor: "rgba(255,255,255,0.6)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    aria-label="Search icons"
                    className="pressable pressable-soft"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 24,
                      height: 24,
                      flexShrink: 0,
                      opacity: 0.4,
                      transition: "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.opacity = "0.4";
                    }}
                  >
                    <SearchIcon />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex items-center" style={{ gap: 14, flexShrink: 0 }}>
            <Link
              href="/dashboard"
              aria-label="Open dashboard"
              className="pressable pressable-soft"
              style={{
                display: "inline-flex",
                opacity: 0.4,
                transition:
                  "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.opacity = "0.4";
              }}
            >
              <span
                className="squircle-60 flex items-center justify-center"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: highlightGrid ? "rgba(255,255,255,0.02)" : "transparent",
                }}
              >
                <GridIcon />
              </span>
            </Link>

            <div ref={dropdownRef} className="flex items-center" style={{ gap: 6, position: "relative" }}>
              <NpmBox framework={framework} copied={copied} onCopy={handleCopy} />

              <button
                type="button"
                onClick={() => setDropdownOpen((value) => !value)}
                className="squircle-60 pressable pressable-soft flex items-center"
                style={{ gap: 0, color: "rgba(255,255,255,0.4)" }}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                aria-label="Choose framework"
              >
                <div
                  className="squircle-60 flex items-center justify-center"
                  style={{ width: 32, height: 32, borderRadius: 8 }}
                >
                  <AnimatedFrameworkIcon framework={framework} />
                </div>
                <ChevronDownIcon />
              </button>

              {dropdownOpen ? (
                <div
                  role="menu"
                  className="squircle-60 overflow-hidden"
                  style={{
                    position: "absolute",
                    top: "calc(100% + 10px)",
                    left: 0,
                    width: "100%",
                    borderRadius: 12,
                    background: "rgba(255,255,255,0.02)",
                    padding: 12,
                    boxShadow: "0 12px 32px rgba(0,0,0,0.32)",
                    animation: "dropdownIn 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                    transformOrigin: "top right",
                    zIndex: 20,
                    willChange: "transform",
                  }}
                >
                  {(Object.keys(FRAMEWORK_CONFIG) as Framework[]).map((option) => {
                    const Icon = FRAMEWORK_ICONS[option];
                    const active = option === framework;
                    return (
                      <button
                        key={option}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setFramework(option);
                          setDropdownOpen(false);
                        }}
                        className="squircle-60 pressable pressable-soft flex items-center justify-between"
                        style={{
                          width: "100%",
                          borderRadius: 8,
                          padding: 4,
                          background: active ? "rgba(255,255,255,0.05)" : "transparent",
                          color: active ? "#fff" : "rgba(255,255,255,0.4)",
                          gap: 12,
                          justifyContent: "flex-start",
                          minHeight: 40,
                        }}
                      >
                        <span
                          className="squircle-60 flex items-center justify-center"
                          style={{ width: 32, height: 32, borderRadius: 8 }}
                        >
                          <Icon />
                        </span>
                        <span style={{ fontSize: 14, lineHeight: "normal" }}>
                          {FRAMEWORK_CONFIG[option].label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

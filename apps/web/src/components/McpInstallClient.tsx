"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { useSound } from "@web-kits/audio/react";
import { MaskIcon } from "@/components/UiIcon";
import { confetti, sync } from "@/lib/audio/core";

type ToolId = "claude-code" | "codex" | "cursor" | "v0";

type Tool = {
  id: ToolId;
  name: string;
  description: string;
  configPath: string;
  configSnippet: (serverConfig: string) => string;
  Logo: () => ReactNode;
};

// ─── Agent logos ────────────────────────────────────────────────────────────
// All four are stroked/filled with currentColor so they inherit the tab
// label's text color and alpha automatically — active tabs get #bbbcff,
// idle tabs get rgba(255,255,255,0.6), and the logo matches.

function ClaudeLogo() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      style={{ flex: "none", display: "block" }}
      aria-hidden="true"
    >
      <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" />
    </svg>
  );
}

function CodexLogo() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      style={{ flex: "none", display: "block" }}
      aria-hidden="true"
    >
      <path
        clipRule="evenodd"
        d="M8.086.457a6.105 6.105 0 013.046-.415c1.333.153 2.521.72 3.564 1.7a.117.117 0 00.107.029c1.408-.346 2.762-.224 4.061.366l.063.03.154.076c1.357.703 2.33 1.77 2.918 3.198.278.679.418 1.388.421 2.126a5.655 5.655 0 01-.18 1.631.167.167 0 00.04.155 5.982 5.982 0 011.578 2.891c.385 1.901-.01 3.615-1.183 5.14l-.182.22a6.063 6.063 0 01-2.934 1.851.162.162 0 00-.108.102c-.255.736-.511 1.364-.987 1.992-1.199 1.582-2.962 2.462-4.948 2.451-1.583-.008-2.986-.587-4.21-1.736a.145.145 0 00-.14-.032c-.518.167-1.04.191-1.604.185a5.924 5.924 0 01-2.595-.622 6.058 6.058 0 01-2.146-1.781c-.203-.269-.404-.522-.551-.821a7.74 7.74 0 01-.495-1.283 6.11 6.11 0 01-.017-3.064.166.166 0 00.008-.074.115.115 0 00-.037-.064 5.958 5.958 0 01-1.38-2.202 5.196 5.196 0 01-.333-1.589 6.915 6.915 0 01.188-2.132c.45-1.484 1.309-2.648 2.577-3.493.282-.188.55-.334.802-.438.286-.12.573-.22.861-.304a.129.129 0 00.087-.087A6.016 6.016 0 015.635 2.31C6.315 1.464 7.132.846 8.086.457zm-.804 7.85a.848.848 0 00-1.473.842l1.694 2.965-1.688 2.848a.849.849 0 001.46.864l1.94-3.272a.849.849 0 00.007-.854l-1.94-3.393zm5.446 6.24a.849.849 0 000 1.695h4.848a.849.849 0 000-1.696h-4.848z"
      />
    </svg>
  );
}

function CursorLogo() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      style={{ flex: "none", display: "block" }}
      aria-hidden="true"
    >
      <path d="M22.106 5.68L12.5.135a.998.998 0 00-.998 0L1.893 5.68a.84.84 0 00-.419.726v11.186c0 .3.16.577.42.727l9.607 5.547a.999.999 0 00.998 0l9.608-5.547a.84.84 0 00.42-.727V6.407a.84.84 0 00-.42-.726zm-.603 1.176L12.228 22.92c-.063.108-.228.064-.228-.061V12.34a.59.59 0 00-.295-.51l-9.11-5.26c-.107-.062-.063-.228.062-.228h18.55c.264 0 .428.286.296.514z" />
    </svg>
  );
}

function V0Logo() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      fillRule="evenodd"
      style={{ flex: "none", display: "block" }}
      aria-hidden="true"
    >
      <path
        clipRule="evenodd"
        d="M14.252 8.25h5.624c.088 0 .176.006.26.018l-5.87 5.87a1.889 1.889 0 01-.019-.265V8.25h-2.25v5.623a4.124 4.124 0 004.125 4.125h5.624v-2.25h-5.624c-.09 0-.179-.006-.265-.018l5.874-5.875a1.9 1.9 0 01.02.27v5.623H24v-5.624A4.124 4.124 0 0019.876 6h-5.624v2.25zM0 7.5v.006l7.686 9.788c.924 1.176 2.813.523 2.813-.973V7.5H8.25v6.87L2.856 7.5H0z"
      />
    </svg>
  );
}

const TOOLS: readonly Tool[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    description:
      "Run `claude mcp add iconsol https://iconsol.me/api/mcp` or paste the config below into `~/.claude/mcp.json`.",
    configPath: "~/.claude/mcp.json",
    configSnippet: (s) => s,
    Logo: ClaudeLogo,
  },
  {
    id: "codex",
    name: "Codex (OpenAI CLI)",
    description:
      "Add the iconsol entry to your `~/.codex/config.toml` MCP servers section.",
    configPath: "~/.codex/config.toml",
    configSnippet: () =>
      `[mcp_servers.iconsol]\nurl = "https://iconsol.me/api/mcp"`,
    Logo: CodexLogo,
  },
  {
    id: "cursor",
    name: "Cursor",
    description:
      "Drop the JSON below into `.cursor/mcp.json` at the root of your workspace (or `~/.cursor/mcp.json` for all projects).",
    configPath: ".cursor/mcp.json",
    configSnippet: (s) => s,
    Logo: CursorLogo,
  },
  {
    id: "v0",
    name: "V0",
    description:
      "Open V0 → Settings → MCP Servers → Add Server, and paste the URL `https://iconsol.me/api/mcp`.",
    configPath: "V0 → Settings → MCP Servers",
    configSnippet: (s) => s,
    Logo: V0Logo,
  },
] as const;

const HOVER_SPRING = { stiffness: 400, damping: 35 } as const;

export function McpInstallClient({ configSnippet }: { configSnippet: string }) {
  const [activeTool, setActiveTool] = useState<ToolId>("claude-code");
  // The scrollable wrapper around the main content. Stays in the page's
  // flex column between <Header /> and <Footer />, takes flex:1 + overflow:auto,
  // so the page itself never grows past 100dvh — only the body scrolls.
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const active = useMemo(
    () => TOOLS.find((tool) => tool.id === activeTool) ?? TOOLS[0],
    [activeTool]
  );

  const activeSnippet = useMemo(
    () => active.configSnippet(configSnippet),
    [active, configSnippet]
  );

  return (
    <div
      ref={scrollRef}
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      <main
        style={{
          width: "100%",
          maxWidth: 880,
          margin: "0 auto",
          // 84px = the home-variant Header's intrinsic height
          // (padding 24 + min-height 36 + padding 24); +24px so the
          // title sits 24px below the header container.
          padding: "108px 24px 120px",
        }}
      >
        <ScrollRevealBlock scrollRef={scrollRef}>
          <h1
            style={{
              fontSize: 32,
              lineHeight: 1.1,
              fontWeight: 600,
              marginBottom: 12,
              letterSpacing: "-0.01em",
              textWrap: "balance",
            }}
          >
            Install the iconsol MCP server
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.55,
              color: "rgba(255,255,255,0.6)",
              marginBottom: 40,
              maxWidth: 580,
              textWrap: "balance",
            }}
          >
            Point your AI agent at{" "}
            <code style={inlineCode}>iconsol.me/api/mcp</code> to let it search,
            preview, and embed every logo in the directory directly in your
            editor or chat.
          </p>
        </ScrollRevealBlock>

        <ScrollRevealBlock scrollRef={scrollRef}>
          <Section heading="1. Pick your agent">
            <ToolTabs activeTool={activeTool} onSelect={setActiveTool} />
          </Section>
        </ScrollRevealBlock>

        <ScrollRevealBlock scrollRef={scrollRef}>
          <Section heading={`2. Add to ${active.name}`}>
            <AnimatedToolBody tool={active} snippet={activeSnippet} />
          </Section>
        </ScrollRevealBlock>

        <ScrollRevealBlock scrollRef={scrollRef}>
          <Section heading="3. Restart your agent">
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: "rgba(255,255,255,0.6)",
                textWrap: "balance",
              }}
            >
              Some agents need to be relaunched to pick up new MCP servers.
              After that, ask it to{" "}
              <span style={{ color: "rgba(255,255,255,0.85)" }}>
                “find the Solana logo”
              </span>{" "}
              and you should see iconsol respond.
            </p>
          </Section>
        </ScrollRevealBlock>
      </main>
    </div>
  );
}

// Wraps a chunk of body content so it springs from blurred → sharp as it
// scrolls into the visible portion of the body scroller. When the content
// passes behind the header or footer (less than 50 % in view of the scroll
// container) it goes back to the blurred initial state.
function ScrollRevealBlock({
  scrollRef,
  children,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ filter: "blur(8px)", opacity: 0 }}
      whileInView={{ filter: "blur(0px)", opacity: 1 }}
      viewport={{ root: scrollRef, amount: 0.5 }}
      transition={{ type: "spring", duration: 0.6, bounce: 0 }}
      style={{ willChange: "filter, opacity" }}
    >
      {children}
    </motion.div>
  );
}

// Smoothly handles the 2 things that change when the user picks a different
// agent: the descriptive paragraph + config path text, AND the ConfigBlock
// height. Both inner blocks are crossfaded by AnimatePresence (no layout
// scaling, so nothing visually stretches) and the wrapper around the
// ConfigBlock animates `height` from the previously-measured value to the
// next-measured value so the panel resizes smoothly without squishing the
// pre tag.
function AnimatedToolBody({ tool, snippet }: { tool: Tool; snippet: string }) {
  return (
    <>
      <AnimatedTextSwap toolId={tool.id}>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 14,
            textWrap: "balance",
          }}
        >
          {tool.description}
        </p>
        <p
          style={{
            fontSize: 12,
            lineHeight: 1.4,
            color: "rgba(255,255,255,0.4)",
            fontFamily:
              'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
            marginBottom: 12,
          }}
        >
          {tool.configPath}
        </p>
      </AnimatedTextSwap>
      <ConfigBlock snippet={snippet} />
    </>
  );
}

// Crossfades two pieces of copy when the active tool changes. Uses absolute
// positioning during the transition so the OUTGOING node doesn't push the
// incoming one down — both nodes occupy the same spot and slide via opacity
// + a tiny y-offset, then the incoming node settles into normal flow.
function AnimatedTextSwap({
  toolId,
  children,
}: {
  toolId: string;
  children: ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={toolId}
          initial={{ opacity: 0, y: 4, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -4, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.28, bounce: 0 }}
          style={{ willChange: "transform, opacity, filter" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Tabs ───────────────────────────────────────────────────────────────────
// Smoothly animated purple highlight pill that slides between the tab
// buttons. Positions are remeasured on the active-tool change so it always
// lands exactly under the right label.

function ToolTabs({
  activeTool,
  onSelect,
}: {
  activeTool: ToolId;
  onSelect: (id: ToolId) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = useRef<Record<ToolId, HTMLButtonElement | null>>({
    "claude-code": null,
    codex: null,
    cursor: null,
    v0: null,
  });
  const pillX = useMotionValue(0);
  const pillW = useMotionValue(0);
  const springX = useSpring(pillX, HOVER_SPRING);
  const springW = useSpring(pillW, HOVER_SPRING);
  const [pillReady, setPillReady] = useState(false);

  const measureActive = useCallback(() => {
    const container = containerRef.current;
    const node = buttonRefs.current[activeTool];
    if (!container || !node) return;
    const cRect = container.getBoundingClientRect();
    const nRect = node.getBoundingClientRect();
    const nextX = nRect.left - cRect.left;
    const nextW = nRect.width;
    if (!pillReady) {
      // First measurement: jump so we don't see the pill animate in from 0.
      pillX.set(nextX);
      pillW.set(nextW);
      springX.jump(nextX);
      springW.jump(nextW);
      setPillReady(true);
      return;
    }
    pillX.set(nextX);
    pillW.set(nextW);
  }, [activeTool, pillReady, pillX, pillW, springX, springW]);

  useLayoutEffect(() => {
    measureActive();
  }, [measureActive]);

  useEffect(() => {
    const handle = () => measureActive();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
  }, [measureActive]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Select your AI agent"
      style={{
        position: "relative",
        display: "flex",
        flexWrap: "wrap",
        gap: 6,
        padding: 6,
        border: "1px solid #16181B",
        borderRadius: 12,
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <motion.div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 6,
          left: 0,
          height: "calc(100% - 12px)",
          x: springX,
          width: springW,
          borderRadius: 8,
          background: "rgba(116,120,255,0.10)",
          pointerEvents: "none",
          opacity: pillReady ? 1 : 0,
        }}
      />
      {TOOLS.map((tool) => {
        const isActive = tool.id === activeTool;
        const Logo = tool.Logo;
        return (
          <button
            key={tool.id}
            ref={(node) => {
              buttonRefs.current[tool.id] = node;
            }}
            role="tab"
            type="button"
            aria-selected={isActive}
            onClick={() => onSelect(tool.id)}
            className="pressable pressable-soft"
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 8,
              background: "transparent",
              color: isActive ? "#bbbcff" : "rgba(255,255,255,0.6)",
              fontSize: 13,
              fontWeight: 500,
              lineHeight: "normal",
              transition: "color 160ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <Logo />
            <span>{tool.name}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Config block + copy effects ────────────────────────────────────────────
// Mirrors the IconDetail code-panel copy: a CopyIcon that swaps between
// /ui/copy.svg and /ui/check.svg with a scale + opacity + blur spring,
// plus a dithered-dot wave that radiates from the copy button across the
// code panel. The code-falling-on-spam-clicks easter egg is intentionally
// NOT included here.

function burstNoise(x: number, y: number) {
  const value = 43758.5453 * Math.sin(127.1 * x + 311.7 * y);
  return value - Math.floor(value);
}

function CopyBurstOverlay({
  trigger,
  origin,
}: {
  trigger: number;
  origin?: { x?: number; y?: number };
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = ref.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cellSize = 8;
    const dotSize = 6;
    const columns = Math.ceil(rect.width / cellSize) + 1;
    const rows = Math.ceil(rect.height / cellSize) + 1;
    const startX = origin?.x ?? Math.max(0, rect.width - 26);
    const startY = origin?.y ?? 26;
    const maxRadius =
      Math.hypot(
        Math.max(startX, rect.width - startX),
        Math.max(startY, rect.height - startY)
      ) + 40;
    const duration = prefersReducedMotion ? 280 : 680;
    const bandWidth = 130;
    const startedAt = performance.now();
    let frame = 0;

    const render = () => {
      const elapsed = (performance.now() - startedAt) / duration;
      if (elapsed >= 1) {
        context.clearRect(0, 0, rect.width, rect.height);
        return;
      }

      const radius = elapsed * maxRadius;
      const expansion = radius / maxRadius;
      const opacity = (1 - expansion) * (1 - expansion);
      context.clearRect(0, 0, rect.width, rect.height);

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const distance = Math.abs(
            Math.hypot(
              cellSize * column + cellSize / 2 - startX,
              cellSize * row + cellSize / 2 - startY
            ) - radius
          );

          if (distance > bandWidth) continue;

          const ramp = 1 - distance / bandWidth;
          const intensity = ramp * ramp;
          if (burstNoise(column, row) > 0.78 * intensity) continue;

          // 0.12 instead of 0.03: the IconDetail panel sits on a much
          // darker, opaque fill so its overlay blend reads at a low
          // alpha; here the MCP config card is nearly transparent over
          // a dark gradient page, so the dots need to write straight
          // white pixels at a higher alpha to be visible.
          const alpha = 0.12 * intensity * opacity;
          context.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          context.fillRect(cellSize * column, cellSize * row, dotSize, dotSize);
        }
      }

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, [origin, trigger]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

function CopyIcon({ copied = false }: { copied?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "inline-block",
        width: 16,
        height: 16,
      }}
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

function ConfigBlock({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);
  const [burstTick, setBurstTick] = useState(0);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const measureRef = useRef<HTMLDivElement | null>(null);
  const playConfetti = useSound(confetti);
  const playSync = useSound(sync);

  // Re-measure the inner content (which is keyed by snippet via
  // AnimatePresence below) every time the snippet changes. We animate the
  // outer wrapper's `height` to this number so the panel resizes smoothly
  // — without applying `layout`/scale to the inner content, which is what
  // was causing the previous stretchy "squish" effect on the pre tag.
  useLayoutEffect(() => {
    if (!measureRef.current) return;
    const next = measureRef.current.offsetHeight;
    setMeasuredHeight(next);
  }, [snippet]);

  // Track viewport size changes so the height stays accurate across
  // resizes (font load, scrollbar toggle, etc).
  useEffect(() => {
    const node = measureRef.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      setMeasuredHeight(node.offsetHeight);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [snippet]);

  const onCopy = () => {
    playSync();
    setBurstTick((value) => value + 1);
    playConfetti();
    navigator.clipboard
      .writeText(snippet)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      })
      .catch(() => undefined);
  };

  return (
    <div
      style={{
        position: "relative",
        border: "1px solid #16181B",
        borderRadius: 16,
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}
    >
      <motion.div
        animate={{ height: measuredHeight ?? "auto" }}
        transition={{ type: "spring", duration: 0.4, bounce: 0 }}
        style={{ position: "relative", overflow: "hidden" }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={snippet}
            ref={measureRef}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ type: "spring", duration: 0.32, bounce: 0 }}
            style={{ willChange: "transform, opacity, filter" }}
          >
            <pre
              style={{
                margin: 0,
                padding: "20px 56px 20px 20px",
                fontFamily:
                  'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
                fontSize: 12,
                lineHeight: "20px",
                color: "rgba(255,255,255,0.85)",
                whiteSpace: "pre",
                overflowX: "auto",
              }}
            >
              {snippet}
            </pre>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <CopyBurstOverlay trigger={burstTick} />

      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy MCP config"
        className="pressable pressable-soft"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 32,
          height: 32,
          padding: 8,
          borderRadius: 8,
          background: copied
            ? "rgba(40,224,185,0.05)"
            : "rgba(255,255,255,0.05)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          zIndex: 2,
          transition: "background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 16,
            height: 16,
            transform: "translate(-50%, -50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CopyIcon copied={copied} />
        </span>
      </button>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: "rgba(255,255,255,0.85)",
          marginBottom: 12,
          textWrap: "balance",
        }}
      >
        {heading}
      </h2>
      {children}
    </section>
  );
}

const inlineCode: React.CSSProperties = {
  fontFamily:
    'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
  fontSize: 13,
  padding: "2px 6px",
  borderRadius: 6,
  background: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.85)",
};

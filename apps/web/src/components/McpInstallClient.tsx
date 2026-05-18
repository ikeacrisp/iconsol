"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { MaskIcon } from "@/components/UiIcon";

type ToolId = "claude-code" | "codex" | "cursor" | "v0";

type Tool = {
  id: ToolId;
  name: string;
  description: string;
  configPath: string;
  configSnippet: (serverConfig: string) => string;
};

const TOOLS: readonly Tool[] = [
  {
    id: "claude-code",
    name: "Claude Code",
    description:
      "Run `claude mcp add iconsol https://iconsol.me/api/mcp` or paste the config below into `~/.claude/mcp.json`.",
    configPath: "~/.claude/mcp.json",
    configSnippet: (s) => s,
  },
  {
    id: "codex",
    name: "Codex (OpenAI CLI)",
    description:
      "Add the iconsol entry to your `~/.codex/config.toml` MCP servers section.",
    configPath: "~/.codex/config.toml",
    configSnippet: () =>
      `[mcp_servers.iconsol]\nurl = "https://iconsol.me/api/mcp"`,
  },
  {
    id: "cursor",
    name: "Cursor",
    description:
      "Drop the JSON below into `.cursor/mcp.json` at the root of your workspace (or `~/.cursor/mcp.json` for all projects).",
    configPath: ".cursor/mcp.json",
    configSnippet: (s) => s,
  },
  {
    id: "v0",
    name: "V0",
    description:
      "Open V0 → Settings → MCP Servers → Add Server, and paste the URL `https://iconsol.me/api/mcp`.",
    configPath: "V0 → Settings → MCP Servers",
    configSnippet: (s) => s,
  },
] as const;

const HOVER_SPRING = { stiffness: 400, damping: 35 } as const;

export function McpInstallClient({ configSnippet }: { configSnippet: string }) {
  const [activeTool, setActiveTool] = useState<ToolId>("claude-code");

  const active = useMemo(
    () => TOOLS.find((tool) => tool.id === activeTool) ?? TOOLS[0],
    [activeTool]
  );

  const activeSnippet = useMemo(
    () => active.configSnippet(configSnippet),
    [active, configSnippet]
  );

  return (
    <main
      style={{
        flex: 1,
        width: "100%",
        maxWidth: 880,
        margin: "0 auto",
        padding: "64px 24px 96px",
      }}
    >
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
        Point your AI agent at <code style={inlineCode}>iconsol.me/api/mcp</code>{" "}
        to let it search, preview, and embed every logo in the directory directly
        in your editor or chat.
      </p>

      <Section heading="1. Pick your agent">
        <ToolTabs activeTool={activeTool} onSelect={setActiveTool} />
      </Section>

      <Section heading={`2. Add to ${active.name}`}>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 14,
            textWrap: "balance",
          }}
        >
          {active.description}
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
          {active.configPath}
        </p>
        <ConfigBlock snippet={activeSnippet} />
      </Section>

      <Section heading="3. Restart your agent">
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.6)",
            textWrap: "balance",
          }}
        >
          Some agents need to be relaunched to pick up new MCP servers. After
          that, ask it to{" "}
          <span style={{ color: "rgba(255,255,255,0.85)" }}>
            “find the Solana logo”
          </span>{" "}
          and you should see iconsol respond.
        </p>
      </Section>
    </main>
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
            {tool.name}
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

          const alpha = 0.03 * intensity * opacity;
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
        mixBlendMode: "overlay",
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

  const onCopy = () => {
    setBurstTick((value) => value + 1);
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
          position: "relative",
          zIndex: 0,
        }}
      >
        {snippet}
      </pre>

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

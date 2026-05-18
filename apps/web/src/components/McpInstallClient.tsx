"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MaskIcon } from "@/components/UiIcon";

type ToolId =
  | "claude-code"
  | "codex"
  | "cursor"
  | "v0"
  | "cline"
  | "continue"
  | "windsurf";

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
  {
    id: "cline",
    name: "Cline",
    description:
      "Open Cline → MCP Servers → Edit JSON, and paste the snippet below.",
    configPath: "Cline → MCP Servers → Edit JSON",
    configSnippet: (s) => s,
  },
  {
    id: "continue",
    name: "Continue",
    description:
      "Edit `~/.continue/config.json` and add the `mcpServers` block below.",
    configPath: "~/.continue/config.json",
    configSnippet: (s) => s,
  },
  {
    id: "windsurf",
    name: "Windsurf",
    description:
      "Open Windsurf → Settings → MCP → Edit Config, and paste the snippet below.",
    configPath: "Windsurf → Settings → MCP",
    configSnippet: (s) => s,
  },
] as const;

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
        }}
      >
        Point your AI agent at <code style={inlineCode}>iconsol.me/api/mcp</code>{" "}
        to let it search, preview, and embed every logo in the directory directly
        in your editor or chat.
      </p>

      <Section heading="1. Pick your agent">
        <div
          role="tablist"
          aria-label="Select your AI agent"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
            padding: 6,
            border: "1px solid #16181B",
            borderRadius: 12,
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {TOOLS.map((tool) => {
            const isActive = tool.id === activeTool;
            return (
              <button
                key={tool.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveTool(tool.id)}
                className="pressable pressable-soft"
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: isActive
                    ? "rgba(116,120,255,0.10)"
                    : "transparent",
                  color: isActive ? "#bbbcff" : "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: "normal",
                  transition:
                    "background 160ms cubic-bezier(0.16, 1, 0.3, 1), color 160ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {tool.name}
              </button>
            );
          })}
        </div>
      </Section>

      <Section heading={`2. Add to ${active.name}`}>
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.6,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 14,
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
          }}
        >
          Some agents need to be relaunched to pick up new MCP servers. After
          that, ask it to{" "}
          <span style={{ color: "rgba(255,255,255,0.85)" }}>
            “find the Phantom logo”
          </span>{" "}
          and you should see iconsol respond.
        </p>
      </Section>
    </main>
  );
}

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
          letterSpacing: "0",
        }}
      >
        {heading}
      </h2>
      {children}
    </section>
  );
}

function ConfigBlock({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard
      .writeText(snippet)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
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
        }}
      >
        {snippet}
      </pre>

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
          background: "rgba(255,255,255,0.05)",
          transition:
            "background 160ms cubic-bezier(0.16, 1, 0.3, 1), opacity 160ms cubic-bezier(0.16, 1, 0.3, 1)",
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
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={copied ? "check" : "copy"}
              initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MaskIcon
                src={copied ? "/ui/check.svg" : "/ui/copy.svg"}
                size={16}
                color={copied ? "#28E0B9" : "#ffffff"}
                opacity={1}
              />
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
    </div>
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

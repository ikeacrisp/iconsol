"use client";

import { useState } from "react";
import { useSound } from "@web-kits/audio/react";
import type { Icon } from "@/lib/icon-data";
import { CATEGORY_COLORS } from "@/lib/icon-data";
import { confetti } from "@/lib/audio/core";

interface IconDetailPanelProps {
  icon: Icon;
  onClose: () => void;
}

type CopiedKey = "svg" | "jsx" | "npm" | null;

export function IconDetailPanel({ icon, onClose }: IconDetailPanelProps) {
  const [bg, setBg] = useState<"dark" | "light" | "grid">("dark");
  const [copied, setCopied] = useState<CopiedKey>(null);
  const playConfetti = useSound(confetti);

  const color = CATEGORY_COLORS[icon.category];
  const componentName = toPascalCase(icon.id);

  const svgImportCode = `import { ${componentName} } from "@solana-icons/react";`;
  const jsxCode = `<${componentName} size={32} />`;
  const npmCode = `npm install @solana-icons/react`;

  const copyText = async (text: string, key: CopiedKey) => {
    playConfetti();
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const previewBg: Record<typeof bg, string> = {
    dark: "#0a0a0f",
    light: "#f8fafc",
    grid: "repeating-conic-gradient(#1e1e2e 0% 25%, #13131a 0% 50%) 0 0 / 12px 12px",
  };

  return (
    <div
      className="sticky top-[calc(3.5rem+1rem)] rounded-2xl overflow-hidden"
      style={{
        background: "var(--color-sol-surface)",
        border: `1px solid ${color}44`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--color-sol-border)" }}
      >
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-medium"
            style={{
              background: `${color}22`,
              color,
            }}
          >
            {icon.category}
          </span>
          {icon.ticker && (
            <span className="text-xs" style={{ color: "var(--color-sol-muted)" }}>
              {icon.ticker}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-md text-xs transition-colors hover:bg-white/10"
          style={{ color: "var(--color-sol-muted)" }}
        >
          ✕
        </button>
      </div>

      {/* Preview */}
      <div className="p-4">
        <div
          className="rounded-xl flex items-center justify-center h-36 mb-3"
          style={{ background: previewBg[bg] }}
        >
          {icon.hasLocalFile ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={icon.src}
              alt={icon.name}
              width={80}
              height={80}
              className="object-contain drop-shadow-lg"
              style={{ maxWidth: 80, maxHeight: 80 }}
            />
          ) : (
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{ background: `${color}22`, color }}
            >
              {icon.name.charAt(0)}
            </div>
          )}
        </div>

        {/* BG toggle */}
        <div className="flex gap-1 justify-center mb-4">
          {(["dark", "light", "grid"] as const).map((b) => (
            <button
              key={b}
              onClick={() => setBg(b)}
              className="px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all capitalize"
              style={
                bg === b
                  ? { background: `${color}22`, color, border: `1px solid ${color}55` }
                  : {
                      background: "transparent",
                      color: "var(--color-sol-muted)",
                      border: "1px solid transparent",
                    }
              }
            >
              {b}
            </button>
          ))}
        </div>

        {/* Name */}
        <h2
          className="font-semibold text-base mb-1"
          style={{ color: "var(--color-sol-text)" }}
        >
          {icon.name}
        </h2>
        {icon.website && (
          <a
            href={icon.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs hover:underline"
            style={{ color: "var(--color-sol-muted)" }}
          >
            {icon.website.replace("https://", "")} ↗
          </a>
        )}

        {/* Tags */}
        {icon.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {icon.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px]"
                style={{
                  background: "var(--color-sol-dark)",
                  color: "var(--color-sol-muted)",
                  border: "1px solid var(--color-sol-border)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div
        className="px-4 pb-4 flex flex-col gap-2"
        style={{ borderTop: "1px solid var(--color-sol-border)", paddingTop: 16 }}
      >
        {/* Download SVG */}
        {icon.hasLocalFile && icon.fileType === "svg" && (
          <a
            href={icon.src}
            download={`${icon.id}.svg`}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: `${color}18`,
              border: `1px solid ${color}44`,
              color,
            }}
          >
            <DownloadIcon />
            Download SVG
          </a>
        )}

        {/* Download PNG */}
        {icon.hasLocalFile && (
          <a
            href={icon.src}
            download={`${icon.id}.${icon.fileType}`}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "var(--color-sol-dark)",
              border: "1px solid var(--color-sol-border)",
              color: "var(--color-sol-text-dim)",
            }}
          >
            <DownloadIcon />
            Download {icon.fileType?.toUpperCase() ?? "File"}
          </a>
        )}

        {/* Copy JSX */}
        <CopyButton
          label={copied === "jsx" ? "Copied!" : "Copy React import"}
          onCopy={() => copyText(`${svgImportCode}\n\n${jsxCode}`, "jsx")}
          active={copied === "jsx"}
          color={color}
        />

        {/* Code snippet */}
        <div
          className="rounded-lg p-3 font-mono text-[10px] leading-5"
          style={{
            background: "var(--color-sol-dark)",
            border: "1px solid var(--color-sol-border)",
            color: "var(--color-sol-text-dim)",
          }}
        >
          <div style={{ color: "#9945ff" }}>{svgImportCode}</div>
          <div className="mt-1">{jsxCode}</div>
        </div>

        {/* Copy npm */}
        <CopyButton
          label={copied === "npm" ? "Copied!" : "Copy npm install"}
          onCopy={() => copyText(npmCode, "npm")}
          active={copied === "npm"}
          color={color}
          subtle
        />
      </div>
    </div>
  );
}

function CopyButton({
  label,
  onCopy,
  active,
  color,
  subtle,
}: {
  label: string;
  onCopy: () => void;
  active: boolean;
  color: string;
  subtle?: boolean;
}) {
  return (
    <button
      onClick={onCopy}
      className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium transition-all"
      style={
        subtle
          ? {
              background: "transparent",
              border: "1px solid var(--color-sol-border)",
              color: "var(--color-sol-muted)",
            }
          : active
            ? {
                background: `${color}30`,
                border: `1px solid ${color}66`,
                color,
              }
            : {
                background: "var(--color-sol-surface)",
                border: "1px solid var(--color-sol-border)",
                color: "var(--color-sol-text-dim)",
              }
      }
    >
      <CopyIcon />
      {label}
    </button>
  );
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");
}

function CopyIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

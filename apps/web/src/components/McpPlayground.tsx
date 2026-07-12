"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSound } from "@web-kits/audio/react";
import { sync } from "@/lib/audio/core";
import { MaskIcon } from "@/components/UiIcon";
import {
  mcpConnect,
  mcpGetLogo,
  mcpSearchLogos,
  type McpConnection,
  type McpLogo,
  type WireFrame,
} from "@/lib/mcp-client";

const MONO =
  'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace';

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  { value: "tokens", label: "Tokens" },
  { value: "defi", label: "DeFi" },
  { value: "wallets", label: "Wallets" },
  { value: "nft", label: "NFT" },
  { value: "infrastructure", label: "Infra" },
] as const;

type CategoryValue = (typeof CATEGORY_FILTERS)[number]["value"];

const SUGGESTIONS: ReadonlyArray<{
  label: string;
  query: string;
  category: CategoryValue;
}> = [
  { label: "jupiter", query: "jupiter", category: "all" },
  { label: "usdc", query: "usdc", category: "all" },
  { label: "staking", query: "staking", category: "all" },
  { label: "wallets", query: "", category: "wallets" },
  { label: "everything", query: "", category: "all" },
];

// Method labels reuse the site's code-token palette so the wire panel
// reads like the rest of iconsol's code surfaces.
const METHOD_COLORS: Record<string, string> = {
  initialize: "#ce7fff",
  "tools/list": "#48b6fb",
  "tools/call · search_logos": "#2fd5b2",
  "tools/call · get_logo": "#fc6",
};

type ConnState =
  | { status: "idle" }
  | { status: "connecting" }
  | { status: "connected"; info: McpConnection }
  | { status: "error"; message: string };

interface SearchState {
  count: number;
  logos: McpLogo[];
  ms: number;
}

export function McpPlayground() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [conn, setConn] = useState<ConnState>({ status: "idle" });
  const [frames, setFrames] = useState<WireFrame[]>([]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryValue>("all");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<SearchState | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [detail, setDetail] = useState<McpLogo | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const searchSeq = useRef(0);

  const pushFrame = useCallback((frame: WireFrame) => {
    setFrames((prev) => [frame, ...prev]);
  }, []);

  /* ── connection: starts when the playground scrolls into view ── */
  const doConnect = useCallback(async () => {
    setConn({ status: "connecting" });
    try {
      const info = await mcpConnect(pushFrame);
      setConn({ status: "connected", info });
    } catch (err) {
      setConn({ status: "error", message: String(err) });
    }
  }, [pushFrame]);

  const connRef = useRef(conn.status);
  connRef.current = conn.status;

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && connRef.current === "idle") {
          observer.disconnect();
          void doConnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [doConnect]);

  /* ── search (debounced, stale-guarded) ── */
  const runSearch = useCallback(
    async (q: string, cat: CategoryValue) => {
      const mySeq = ++searchSeq.current;
      setSearching(true);
      setSearchError(null);
      try {
        const res = await mcpSearchLogos(q, cat, pushFrame);
        if (searchSeq.current !== mySeq) return;
        setResults(res);
      } catch (err) {
        if (searchSeq.current !== mySeq) return;
        setResults(null);
        setSearchError(String(err));
      } finally {
        if (searchSeq.current === mySeq) setSearching(false);
      }
    },
    [pushFrame]
  );

  useEffect(() => {
    if (conn.status !== "connected") return;
    if (!query.trim() && category === "all") {
      searchSeq.current++; // invalidate any in-flight search
      return;
    }
    const t = setTimeout(() => void runSearch(query, category), 300);
    return () => clearTimeout(t);
  }, [query, category, conn.status, runSearch]);

  /** Clears results when the inputs return to their empty state. */
  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (!value.trim() && category === "all") {
      setResults(null);
      setSearching(false);
      setSearchError(null);
    }
  };

  const handleCategoryChange = (value: CategoryValue) => {
    setCategory(value);
    if (!query.trim() && value === "all") {
      setResults(null);
      setSearching(false);
      setSearchError(null);
    }
  };

  /* ── detail ── */
  const openDetail = useCallback(
    async (id: string) => {
      setDetailLoading(true);
      try {
        const logo = await mcpGetLogo(id, pushFrame);
        setDetail(logo);
      } catch {
        // The failed frame is already on the wire — that IS the error UI.
      } finally {
        setDetailLoading(false);
      }
    },
    [pushFrame]
  );

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setDetail(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const connected = conn.status === "connected";

  return (
    <div ref={rootRef} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* ── search row ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <div
          style={{
            position: "relative",
            flex: "1 1 260px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 40,
            padding: "0 14px",
            borderRadius: 12,
            border: "1px solid #16181B",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <MaskIcon src="/ui/search.svg" size={16} color="#ffffff" opacity={0.4} />
          <input
            type="text"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
            placeholder="Search 59 logos by name, ticker, or tag..."
            disabled={!connected}
            aria-label="Search logos over MCP"
            className="sidebar-search-input flex-1 bg-transparent border-none outline-none"
            style={{
              color: "#fff",
              fontSize: 14,
              lineHeight: "normal",
              minWidth: 0,
              caretColor: "rgba(255,255,255,0.6)",
            }}
          />
          {searching ? <Spinner /> : null}
        </div>

        <div
          role="radiogroup"
          aria-label="Filter by category"
          style={{
            display: "flex",
            gap: 4,
            padding: 4,
            borderRadius: 12,
            border: "1px solid #16181B",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          {CATEGORY_FILTERS.map((filter) => {
            const isActive = filter.value === category;
            return (
              <button
                key={filter.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                disabled={!connected}
                onClick={() => handleCategoryChange(filter.value)}
                className="pressable pressable-soft"
                style={{
                  padding: "0 10px",
                  height: 30,
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 500,
                  background: isActive ? "rgba(116,120,255,0.10)" : "transparent",
                  color: isActive ? "#bbbcff" : "rgba(255,255,255,0.6)",
                  transition: `color 160ms ${EASE}, background 160ms ${EASE}`,
                }}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── connection error ── */}
      {conn.status === "error" ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px solid rgba(255,107,107,0.25)",
            background: "rgba(255,107,107,0.05)",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              fontFamily: MONO,
              overflowWrap: "anywhere",
            }}
          >
            {conn.message}
          </p>
          <button
            type="button"
            onClick={() => void doConnect()}
            className="pressable pressable-soft"
            style={{
              flexShrink: 0,
              padding: "8px 14px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              color: "#fff",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      {/* ── detail ── */}
      <AnimatePresence initial={false}>
        {detail ? (
          <motion.div
            key={detail.id}
            initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
            transition={{ type: "spring", duration: 0.32, bounce: 0 }}
            style={{ willChange: "transform, opacity, filter" }}
          >
            <LogoDetail
              logo={detail}
              onClose={() => setDetail(null)}
              onOpenRelated={(id) => void openDetail(id)}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── results ── */}
      {searchError ? (
        <p style={{ fontSize: 13, color: "rgba(255,107,107,0.85)", fontFamily: MONO }}>
          {searchError}
        </p>
      ) : results ? (
        results.logos.length === 0 ? (
          <div
            style={{
              padding: "36px 20px",
              borderRadius: 12,
              border: "1px dashed rgba(255,255,255,0.08)",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              No logos match &ldquo;{query}&rdquo; — search covers names, tickers,
              aliases, and tags.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                fontFamily: MONO,
              }}
            >
              {results.count} result{results.count === 1 ? "" : "s"} · {results.ms}
              ms ·{" "}
              <span style={{ color: METHOD_COLORS["tools/call · search_logos"] }}>
                search_logos
              </span>
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(186px, 1fr))",
                gap: 8,
                maxHeight: 452,
                overflowY: "auto",
                opacity: searching ? 0.5 : 1,
                pointerEvents: searching ? "none" : "auto",
                transition: `opacity 160ms ${EASE}`,
              }}
            >
              {results.logos.map((logo) => {
                const isSelected = detail?.id === logo.id;
                return (
                  <button
                    key={logo.id}
                    type="button"
                    onClick={() => void openDetail(logo.id)}
                    aria-pressed={isSelected}
                    className="pressable pressable-soft"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 12,
                      border: isSelected
                        ? "1px solid rgba(116,120,255,0.35)"
                        : "1px solid rgba(255,255,255,0.05)",
                      background: isSelected
                        ? "rgba(116,120,255,0.05)"
                        : "rgba(255,255,255,0.02)",
                      textAlign: "left",
                      transition: `border 160ms ${EASE}, background 160ms ${EASE}`,
                    }}
                  >
                    <LogoThumb src={logo.src} name={logo.name} size={32} />
                    <span style={{ minWidth: 0 }}>
                      <span
                        style={{
                          display: "block",
                          fontSize: 13,
                          fontWeight: 500,
                          color: "#fff",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {logo.name}
                      </span>
                      <span
                        style={{
                          display: "block",
                          fontSize: 11,
                          color: "rgba(255,255,255,0.4)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {logo.ticker ?? logo.category}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )
      ) : (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 6,
            padding: "16px 18px",
            borderRadius: 12,
            border: "1px dashed rgba(255,255,255,0.08)",
          }}
        >
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginRight: 4 }}>
            Try
          </span>
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              disabled={!connected}
              onClick={() => {
                setQuery(suggestion.query);
                setCategory(suggestion.category);
                if (!suggestion.query && suggestion.category === "all") {
                  void runSearch("", "all");
                }
              }}
              className="pressable pressable-soft"
              style={{
                padding: "5px 12px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                fontFamily: MONO,
                opacity: connected ? 1 : 0.5,
                transition: `opacity 160ms ${EASE}`,
              }}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}

      {/* ── wire ── */}
      <WirePanel conn={conn} frames={frames} onClear={() => setFrames([])} />

      {detailLoading ? <span style={{ display: "none" }} aria-live="polite">Loading logo</span> : null}
    </div>
  );
}

/* ── logo thumb ──────────────────────────────────────────────────────────── */

function LogoThumb({ src, name, size }: { src: string; name: string; size: number }) {
  return (
    <span
      style={{
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: size >= 48 ? 12 : 8,
        background: "rgba(255,255,255,0.05)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- MCP returns
          same-origin SVG URLs; next/image adds nothing for them */}
      <img
        src={src}
        alt={`${name} logo`}
        width={Math.round(size * 0.62)}
        height={Math.round(size * 0.62)}
        loading="lazy"
        style={{ display: "block" }}
      />
    </span>
  );
}

/* ── detail card ─────────────────────────────────────────────────────────── */

function LogoDetail({
  logo,
  onClose,
  onOpenRelated,
}: {
  logo: McpLogo;
  onClose: () => void;
  onOpenRelated: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        gap: 16,
        padding: 20,
        borderRadius: 16,
        border: "1px solid #16181B",
        background: "rgba(255,255,255,0.02)",
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close logo detail"
        className="pressable pressable-soft"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          width: 28,
          height: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <CloseIcon />
      </button>

      <LogoThumb src={logo.src} name={logo.name} size={56} />

      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              paddingRight: 32,
              marginBottom: 4,
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", lineHeight: 1.2 }}>
              {logo.name}
            </h3>
            {logo.ticker ? (
              <span
                style={{
                  padding: "2px 7px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 11,
                  fontFamily: MONO,
                }}
              >
                {logo.ticker}
              </span>
            ) : null}
            <span
              style={{
                padding: "2px 7px",
                borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)",
                fontSize: 11,
                textTransform: "capitalize",
              }}
            >
              {logo.category}
            </span>
          </div>
          {logo.description ? (
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.55,
                color: "rgba(255,255,255,0.6)",
                maxWidth: 560,
              }}
            >
              {logo.description}
            </p>
          ) : null}
        </div>

        <dl style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {logo.mintAddress ? (
            <MetaRow label="mint">
              <CopyValue value={logo.mintAddress} label="mint address" />
            </MetaRow>
          ) : null}
          <MetaRow label="svg">
            <CopyValue value={absoluteUrl(logo.src)} label="SVG URL" />
          </MetaRow>
          {logo.website ? (
            <MetaRow label="site">
              <a
                href={logo.website}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: 12,
                  fontFamily: MONO,
                  color: "rgba(255,255,255,0.6)",
                  textDecorationLine: "underline",
                  textUnderlineOffset: 3,
                  textDecorationColor: "rgba(255,255,255,0.2)",
                }}
              >
                {logo.website.replace(/^https?:\/\//, "")}
              </a>
            </MetaRow>
          ) : null}
        </dl>

        {logo.relatedIds?.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>related</span>
            {logo.relatedIds.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onOpenRelated(id)}
                className="pressable pressable-soft"
                style={{
                  padding: "2px 8px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 11,
                  fontFamily: MONO,
                }}
              >
                {id}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
      <dt
        style={{
          flexShrink: 0,
          width: 34,
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          fontFamily: MONO,
        }}
      >
        {label}
      </dt>
      <dd style={{ minWidth: 0, display: "flex" }}>{children}</dd>
    </div>
  );
}

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const playSync = useSound(sync);
  return (
    <button
      type="button"
      title={value}
      aria-label={`Copy ${label}`}
      className="pressable pressable-soft"
      onClick={() => {
        playSync();
        navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1600);
          })
          .catch(() => undefined);
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minWidth: 0,
        fontSize: 12,
        fontFamily: MONO,
        color: copied ? "#28E0B9" : "rgba(255,255,255,0.6)",
        transition: `color 180ms ${EASE}`,
      }}
    >
      <span
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </span>
      <span style={{ flexShrink: 0, display: "flex" }}>
        <MaskIcon
          src={copied ? "/ui/check.svg" : "/ui/copy.svg"}
          size={12}
          color={copied ? "#28E0B9" : "#ffffff"}
          opacity={copied ? 1 : 0.4}
        />
      </span>
    </button>
  );
}

/* ── wire panel ──────────────────────────────────────────────────────────── */

function WirePanel({
  conn,
  frames,
  onClear,
}: {
  conn: ConnState;
  frames: WireFrame[];
  onClear: () => void;
}) {
  const [expandedSeq, setExpandedSeq] = useState<number | null>(null);

  return (
    <div
      style={{
        border: "1px solid #16181B",
        borderRadius: 16,
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span
            aria-hidden="true"
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              flexShrink: 0,
              background:
                conn.status === "connected"
                  ? "#28E0B9"
                  : conn.status === "error"
                    ? "#ff6b6b"
                    : "#fc6",
              transition: `background 180ms ${EASE}`,
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontFamily: MONO,
              color: "rgba(255,255,255,0.4)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {conn.status === "connected"
              ? `${conn.info.serverName} v${conn.info.serverVersion} · ${conn.info.initMs}ms · ${conn.info.tools.length} tools`
              : conn.status === "error"
                ? "connection failed"
                : conn.status === "connecting"
                  ? "connecting..."
                  : "waiting"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            onClear();
            setExpandedSeq(null);
          }}
          disabled={frames.length === 0}
          className="pressable pressable-soft"
          style={{
            flexShrink: 0,
            fontSize: 11,
            fontFamily: MONO,
            color: "rgba(255,255,255,0.4)",
            opacity: frames.length === 0 ? 0.4 : 1,
            transition: `opacity 160ms ${EASE}`,
          }}
        >
          clear
        </button>
      </div>

      {frames.length === 0 ? (
        <p
          style={{
            padding: "24px 16px",
            textAlign: "center",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Every JSON-RPC request to the server appears here as it happens.
        </p>
      ) : (
        <div style={{ maxHeight: 380, overflowY: "auto" }}>
          {frames.map((frame) => (
            <FrameRow
              key={frame.seq}
              frame={frame}
              expanded={expandedSeq === frame.seq}
              onToggle={() =>
                setExpandedSeq((prev) => (prev === frame.seq ? null : frame.seq))
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FrameRow({
  frame,
  expanded,
  onToggle,
}: {
  frame: WireFrame;
  expanded: boolean;
  onToggle: () => void;
}) {
  const failed = !frame.ok || frame.toolError;
  const methodColor = METHOD_COLORS[frame.label] ?? "rgba(255,255,255,0.6)";

  return (
    <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="pressable pressable-soft"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "9px 16px",
          textAlign: "left",
        }}
      >
        <ChevronIcon expanded={expanded} />
        <span
          style={{
            fontSize: 11,
            fontFamily: MONO,
            color: methodColor,
            whiteSpace: "nowrap",
          }}
        >
          {frame.label}
        </span>
        {frame.summary ? (
          <span
            style={{
              fontSize: 11,
              fontFamily: MONO,
              color: "rgba(255,255,255,0.4)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              minWidth: 0,
              flex: 1,
            }}
          >
            {frame.summary}
          </span>
        ) : (
          <span style={{ flex: 1 }} />
        )}
        <span
          aria-label={failed ? "error" : "ok"}
          style={{
            width: 5,
            height: 5,
            borderRadius: 999,
            flexShrink: 0,
            background: failed ? "#ff6b6b" : "#28E0B9",
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontFamily: MONO,
            color: "rgba(255,255,255,0.4)",
            flexShrink: 0,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {frame.ms}ms
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.32, bounce: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                padding: "2px 16px 14px 38px",
              }}
            >
              <JsonBlock title="request" value={frame.request} />
              <JsonBlock title="response" value={frame.response} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <p
        style={{
          fontSize: 10,
          fontFamily: MONO,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 4,
        }}
      >
        {title}
      </p>
      <pre
        style={{
          margin: 0,
          padding: 12,
          borderRadius: 8,
          background: "rgba(255,255,255,0.03)",
          fontFamily: MONO,
          fontSize: 11,
          lineHeight: "18px",
          maxHeight: 240,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
        }}
      >
        <HighlightedJson value={value} />
      </pre>
    </div>
  );
}

/**
 * Lightweight JSON syntax highlighting using the site's code-token palette:
 * keys #7478ff, strings #2fd5b2, numbers #fc6, literals #ce7fff,
 * punctuation rgba(255,255,255,0.4).
 */
function HighlightedJson({ value }: { value: unknown }) {
  const text = JSON.stringify(value, null, 2) ?? "undefined";
  const tokens: React.ReactNode[] = [];
  const pattern =
    /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|\b(true|false|null)\b/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(
        <span key={key++} style={{ color: "rgba(255,255,255,0.4)" }}>
          {text.slice(lastIndex, match.index)}
        </span>
      );
    }
    if (match[1] !== undefined) {
      const isKey = match[2] !== undefined;
      tokens.push(
        <span key={key++} style={{ color: isKey ? "#7478ff" : "#2fd5b2" }}>
          {match[1]}
        </span>
      );
      if (isKey) {
        tokens.push(
          <span key={key++} style={{ color: "rgba(255,255,255,0.4)" }}>
            {match[2]}
          </span>
        );
      }
    } else if (match[3] !== undefined) {
      tokens.push(
        <span key={key++} style={{ color: "#fc6" }}>
          {match[3]}
        </span>
      );
    } else if (match[4] !== undefined) {
      tokens.push(
        <span key={key++} style={{ color: "#ce7fff" }}>
          {match[4]}
        </span>
      );
    }
    lastIndex = pattern.lastIndex;
  }
  if (lastIndex < text.length) {
    tokens.push(
      <span key={key++} style={{ color: "rgba(255,255,255,0.4)" }}>
        {text.slice(lastIndex)}
      </span>
    );
  }
  return <>{tokens}</>;
}

/* ── small icons ─────────────────────────────────────────────────────────── */

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="animate-spin"
      style={{
        width: 14,
        height: 14,
        flexShrink: 0,
        borderRadius: 999,
        border: "1.5px solid rgba(255,255,255,0.15)",
        borderTopColor: "rgba(255,255,255,0.6)",
      }}
    />
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.4)"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        flexShrink: 0,
        transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
        transition: `transform 200ms ${EASE}`,
      }}
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.6)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function absoluteUrl(src: string): string {
  if (!src || src.startsWith("http")) return src;
  if (typeof window === "undefined") return src;
  return `${window.location.origin}${src}`;
}

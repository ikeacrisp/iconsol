"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORIES } from "@/lib/icon-data";
import { easingGradient } from "@/lib/easing-gradient";

const MODAL_FADE_BG = easingGradient(
  "180deg",
  "rgba(255,255,255,0)",
  "rgba(255,255,255,0.01)",
);

type Tab = "request" | "contribute";

type ContributeModalProps = {
  open: boolean;
  onClose: () => void;
};

const REPO_URL = "https://github.com/ikeacrisp/iconsol";
const ISSUE_URL = `${REPO_URL}/issues/new`;

const requestableCategories = CATEGORIES.filter((c) => c.value !== "all");

const fieldLabel: React.CSSProperties = {
  fontSize: 12,
  lineHeight: "normal",
  color: "rgba(255,255,255,0.4)",
  fontWeight: 500,
};

const fieldInput: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  lineHeight: "normal",
  color: "#ffffff",
  outline: "none",
  fontFamily: "inherit",
};

export function ContributeModal({ open, onClose }: ContributeModalProps) {
  const [tab, setTab] = useState<Tab>("request");
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [website, setWebsite] = useState("");
  const [category, setCategory] = useState<string>("tokens");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setTab("request");
      setClosing(false);
      // Focus first field after enter animation
      const id = window.setTimeout(() => firstFieldRef.current?.focus(), 180);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  // Escape-to-close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") startClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const startClose = () => {
    if (closing) return;
    setClosing(true);
    // Match CSS exit animation duration
    window.setTimeout(() => {
      onClose();
      setClosing(false);
      // clear form on close
      setName("");
      setTicker("");
      setWebsite("");
      setCategory("tokens");
      setNotes("");
    }, 180);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    // Pre-fill a GitHub issue so the request becomes an actionable record
    // in the same public tracker the "contribute" tab points to.
    const title = `Logo request: ${name || "(unnamed)"}`;
    const body = [
      `**Name:** ${name || "—"}`,
      `**Ticker:** ${ticker || "—"}`,
      `**Category:** ${category}`,
      `**Website:** ${website || "—"}`,
      "",
      notes ? `**Notes:**\n${notes}` : "",
    ]
      .filter(Boolean)
      .join("\n");
    const params = new URLSearchParams({
      title,
      body,
      labels: "logo-request",
    });
    window.open(`${ISSUE_URL}?${params.toString()}`, "_blank", "noopener,noreferrer");

    setSubmitting(false);
    startClose();
  };

  if (!open && !closing) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Contribute to iconsol"
      onMouseDown={(e) => {
        // Close only when the press started on the backdrop itself, not on
        // a child that later scrolls/clicks out of the modal.
        if (e.target === e.currentTarget) startClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(10,11,15,0.5)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        animation: `${closing ? "modalBackdropIn 180ms var(--ease-ui) reverse" : "modalBackdropIn 220ms var(--ease-ui)"}`,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className="frost-dither"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          maxHeight: "min(88vh, 720px)",
          display: "flex",
          flexDirection: "column",
          background: MODAL_FADE_BG,
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          border: "2px solid rgba(255,255,255,0.05)",
          borderRadius: 24,
          overflow: "hidden",
          animation: closing
            ? "modalOut 180ms var(--ease-ui) forwards"
            : "modalIn 240ms var(--ease-ui)",
        }}
      >
        {/* Header: tabs + close */}
        <div
          className="flex items-center justify-between"
          style={{ padding: "16px 16px 0 16px", gap: 12 }}
        >
          <div
            className="relative flex items-center"
            style={{
              height: 40,
              borderRadius: 12,
              background: "rgba(255,255,255,0.02)",
              border: "1.5px solid rgba(255,255,255,0.04)",
              padding: 4,
            }}
          >
            {(["request", "contribute"] as Tab[]).map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className="pressable pressable-soft"
                  style={{
                    position: "relative",
                    zIndex: 1,
                    minWidth: 92,
                    height: 30,
                    padding: "0 14px",
                    borderRadius: 8,
                    background: active ? "rgba(255,255,255,0.05)" : "transparent",
                    color: active ? "#ffffff" : "rgba(255,255,255,0.4)",
                    fontSize: 13,
                    fontWeight: 500,
                    lineHeight: "normal",
                    textTransform: "capitalize",
                    transition:
                      "color 180ms var(--ease-ui), background-color 180ms var(--ease-ui)",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={startClose}
            aria-label="Close"
            className="pressable pressable-soft flex items-center justify-center"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.6)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* Scroll area */}
        <div
          style={{
            padding: "20px 20px 24px 20px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {tab === "request" ? (
            <form
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  lineHeight: "19px",
                  color: "rgba(255,255,255,0.5)",
                  margin: 0,
                  textWrap: "balance",
                }}
              >
                Request a logo to be added to the directory. Submitting opens a
                pre-filled GitHub issue in a new tab.
              </p>

              <Field label="Logo name" required>
                <input
                  ref={firstFieldRef}
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Solana"
                  style={fieldInput}
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Ticker">
                  <input
                    type="text"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    placeholder="SOL"
                    style={fieldInput}
                  />
                </Field>
                <Field label="Category" required>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      ...fieldInput,
                      appearance: "none",
                      WebkitAppearance: "none",
                      backgroundImage:
                        "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      paddingRight: 32,
                    }}
                  >
                    {requestableCategories.map((c) => (
                      <option
                        key={c.value}
                        value={c.value}
                        style={{ background: "#0d0f12", color: "#fff" }}
                      >
                        {c.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Website">
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://solana.com"
                  style={fieldInput}
                />
              </Field>

              <Field label="Notes">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything worth knowing — brand guidelines link, preferred variant, etc."
                  rows={3}
                  style={{
                    ...fieldInput,
                    resize: "vertical",
                    minHeight: 80,
                    lineHeight: "19px",
                  }}
                />
              </Field>

              <button
                type="submit"
                disabled={submitting || !name}
                className="pressable pressable-soft"
                style={{
                  height: 40,
                  borderRadius: 10,
                  background: name
                    ? "rgba(116,120,255,0.18)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${
                    name ? "rgba(116,120,255,0.35)" : "rgba(255,255,255,0.05)"
                  }`,
                  color: name ? "#ffffff" : "rgba(255,255,255,0.35)",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "normal",
                  cursor: name ? "pointer" : "not-allowed",
                  marginTop: 4,
                  transition:
                    "background-color 180ms var(--ease-ui), color 180ms var(--ease-ui), border-color 180ms var(--ease-ui)",
                }}
              >
                {submitting ? "Opening issue…" : "Submit request"}
              </button>
            </form>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: "19px",
                  color: "rgba(255,255,255,0.5)",
                  margin: 0,
                  textWrap: "balance",
                }}
              >
                Want to add a logo yourself? Fork the repo, drop the SVG in the
                matching category folder, add a manifest entry, and open a PR.
              </p>

              <ol
                style={{
                  margin: 0,
                  paddingLeft: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 13,
                  lineHeight: "19px",
                }}
              >
                <li>
                  Fork{" "}
                  <a
                    href={REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#7478ff", textDecoration: "none" }}
                  >
                    ikeacrisp/iconsol
                  </a>
                </li>
                <li>
                  Add your SVG to{" "}
                  <code
                    style={{
                      fontFamily:
                        "var(--font-geist-mono), ui-monospace, monospace",
                      fontSize: 12,
                      background: "rgba(255,255,255,0.04)",
                      padding: "1px 6px",
                      borderRadius: 4,
                    }}
                  >
                    apps/web/public/icons/{"{category}"}/
                  </code>
                </li>
                <li>
                  Add a manifest entry in{" "}
                  <code
                    style={{
                      fontFamily:
                        "var(--font-geist-mono), ui-monospace, monospace",
                      fontSize: 12,
                      background: "rgba(255,255,255,0.04)",
                      padding: "1px 6px",
                      borderRadius: 4,
                    }}
                  >
                    src/lib/manifest.json
                  </code>
                </li>
                <li>Open a pull request</li>
              </ol>

              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => startClose()}
                className="pressable pressable-soft flex items-center justify-center"
                style={{
                  height: 40,
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  color: "#ffffff",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "normal",
                  textDecoration: "none",
                  gap: 8,
                  marginTop: 4,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-.99-.02-1.95-3.2.7-3.87-1.54-3.87-1.54-.52-1.32-1.28-1.67-1.28-1.67-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.66.79.55A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
                </svg>
                Open GitHub
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 6,
        minWidth: 0,
      }}
    >
      <span style={fieldLabel}>
        {label}
        {required ? (
          <span style={{ color: "rgba(116,120,255,0.8)", marginLeft: 4 }}>*</span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

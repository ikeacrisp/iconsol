import iconsolPackage from "../../../../packages/react/package.json";

const SOLANA_FOOTER_LOGO = "/ui/footer-solana-wordmark.svg";
const DASHBOARD_FOOTER_LOGO_WIDTH = 64;
// viewBox is 25.11525 × 3.67872 — preserve exact aspect ratio
const DASHBOARD_FOOTER_LOGO_HEIGHT =
  (3.67872 / 25.11525) * DASHBOARD_FOOTER_LOGO_WIDTH;
const SOLANA_URL = "https://solana.com";
const JUICEBOX_URL = "https://juicebox.it";
const MIT_LICENSE_URL = "https://github.com/ikeacrisp/iconsol/blob/main/LICENSE";
const PACKAGE_VERSION_LABEL = `v${iconsolPackage.version}`;
const RELEASE_URL = `https://github.com/ikeacrisp/iconsol/releases/tag/${PACKAGE_VERSION_LABEL}`;

function FooterBrandRow() {
  return (
    <div
      className="flex items-center"
      style={{ gap: 6, flexWrap: "wrap" }}
    >
      <p
        style={{
          fontSize: 12,
          lineHeight: "normal",
          color: "rgba(255,255,255,0.4)",
          whiteSpace: "nowrap",
        }}
      >
        © Twenty&rsquo;26{" "}
        <a
          href={JUICEBOX_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="pressable pressable-soft"
          style={{ color: "inherit", textDecoration: "none" }}
        >
          Juicebox
        </a>
        .
      </p>
      <div className="flex items-center" style={{ gap: 4 }}>
        <p
          style={{
            fontSize: 12,
            lineHeight: "normal",
            color: "rgba(255,255,255,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          Built for
        </p>
        <a
          href={SOLANA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="pressable pressable-soft"
          aria-label="Open Solana"
          style={{ display: "inline-flex", alignItems: "center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={SOLANA_FOOTER_LOGO}
            alt="Solana"
            width={DASHBOARD_FOOTER_LOGO_WIDTH}
            height={DASHBOARD_FOOTER_LOGO_HEIGHT}
            style={{
              display: "block",
              width: DASHBOARD_FOOTER_LOGO_WIDTH,
              height: DASHBOARD_FOOTER_LOGO_HEIGHT,
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
        </a>
      </div>
    </div>
  );
}

function FooterMetaRow() {
  return (
    <div className="flex items-center" style={{ gap: 12 }}>
      <a
        href={MIT_LICENSE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="pressable pressable-soft"
        style={{
          fontSize: 12,
          lineHeight: "15px",
          color: "rgba(255,255,255,0.6)",
          whiteSpace: "nowrap",
          textDecoration: "none",
        }}
      >
        MIT Licensed
      </a>
      <a
        href={RELEASE_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${PACKAGE_VERSION_LABEL} release on GitHub`}
        className="pressable pressable-soft"
        style={{
          width: 52,
          height: 23,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 8,
          background: "rgba(255,255,255,0.05)",
          textDecoration: "none",
        }}
      >
        <p
          style={{
            fontFamily:
              'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
            fontSize: 10,
            lineHeight: "normal",
            color: "rgba(255,255,255,0.4)",
            whiteSpace: "nowrap",
          }}
        >
          {PACKAGE_VERSION_LABEL}
        </p>
      </a>
    </div>
  );
}

export function Footer({
  variant = "dashboard",
}: {
  variant?: "home" | "dashboard";
}) {
  // Both variants now share the same layout per product direction —
  // juicebox wordmark replaces the "iconsol" text.
  void variant;
  return (
    <footer
      style={{
        width: "100%",
        padding: 24,
        flexShrink: 0,
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ width: "100%", minHeight: 25, gap: 24, flexWrap: "wrap" }}
      >
        <FooterBrandRow />
        <FooterMetaRow />
      </div>
    </footer>
  );
}

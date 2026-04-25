"use client";

interface HeroProps {
  stats: {
    total: number;
    withFiles: number;
    tokens: number;
    defi: number;
    wallets: number;
    nft: number;
    infrastructure: number;
  };
}

export function Hero({ stats }: HeroProps) {
  return (
    <section className="pt-16 pb-10 px-4 text-center">
      {/* Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-6"
        style={{
          background: "rgba(153, 69, 255, 0.12)",
          border: "1px solid rgba(153, 69, 255, 0.3)",
          color: "var(--color-sol-purple)",
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "#14f195" }} />
        {stats.withFiles} icons available · {stats.total} in manifest
      </div>

      {/* Headline */}
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4 leading-tight">
        <span style={{ color: "var(--color-sol-text)" }}>High-quality </span>
        <span
          style={{
            background: "linear-gradient(135deg, #9945ff, #14f195)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Solana icons
        </span>
      </h1>
      <p className="text-base max-w-xl mx-auto mb-8 leading-relaxed" style={{ color: "var(--color-sol-text-dim)" }}>
        Tokens, DeFi protocols, wallets, NFT platforms, and infrastructure.
        Download SVG, copy as React component, or install the npm package.
      </p>

      {/* NPM install pill */}
      <div
        className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-mono mx-auto"
        style={{
          background: "var(--color-sol-surface)",
          border: "1px solid var(--color-sol-border)",
        }}
      >
        <span style={{ color: "var(--color-sol-muted)" }}>$</span>
        <span style={{ color: "var(--color-sol-text)" }}>npm install @solana-icons/react</span>
        <CopyNpmButton />
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 mt-10">
        {[
          { label: "Tokens", value: stats.tokens },
          { label: "DeFi", value: stats.defi },
          { label: "Wallets", value: stats.wallets },
          { label: "NFT", value: stats.nft },
          { label: "Infra", value: stats.infrastructure },
        ].map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-xl font-bold" style={{ color: "var(--color-sol-text)" }}>
              {stat.value}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--color-sol-muted)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CopyNpmButton() {
  const copy = () => {
    navigator.clipboard?.writeText("npm install @solana-icons/react");
  };
  return (
    <button
      onClick={copy}
      title="Copy to clipboard"
      className="flex items-center justify-center w-6 h-6 rounded-md transition-colors hover:bg-white/10"
      style={{ color: "var(--color-sol-muted)" }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </svg>
    </button>
  );
}

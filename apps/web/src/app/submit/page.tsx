import { Header } from "@/components/Header";

export default function SubmitPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-sol-dark)" }}>
      <Header />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--color-sol-text)" }}>
          Submit an Icon
        </h1>
        <p className="mb-10" style={{ color: "var(--color-sol-text-dim)" }}>
          Help grow the Solana Icons library by contributing missing logos.
        </p>

        {[
          {
            step: "1",
            title: "Fork the repository",
            content: (
              <a
                href="https://github.com/ikeacrisp/iconsol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline"
                style={{ color: "var(--color-sol-purple)" }}
              >
                github.com/ikeacrisp/iconsol ↗
              </a>
            ),
          },
          {
            step: "2",
            title: "Add your SVG",
            content: (
              <p className="text-sm" style={{ color: "var(--color-sol-text-dim)" }}>
                Place your SVG in the correct category folder:
                <br />
                <code
                  className="block mt-2 px-3 py-2 rounded-lg text-xs font-mono"
                  style={{
                    background: "var(--color-sol-dark)",
                    border: "1px solid var(--color-sol-border)",
                    color: "var(--color-sol-green)",
                  }}
                >
                  icons/&#123;tokens|defi|wallets|nft|infrastructure&#125;/&#123;id&#125;.svg
                </code>
              </p>
            ),
          },
          {
            step: "3",
            title: "SVG requirements",
            content: (
              <ul className="text-sm space-y-1.5 list-none" style={{ color: "var(--color-sol-text-dim)" }}>
                {[
                  "Valid viewBox attribute (e.g., 0 0 24 24)",
                  "No hardcoded width/height on root <svg>",
                  'No fill="black" — use currentColor or brand colors',
                  "Cleaned paths — run through SVGO before submitting",
                  "File size < 20KB",
                  "Square aspect ratio preferred",
                ].map((req) => (
                  <li key={req} className="flex items-start gap-2">
                    <span style={{ color: "var(--color-sol-green)" }}>✓</span>
                    {req}
                  </li>
                ))}
              </ul>
            ),
          },
          {
            step: "4",
            title: "Update the manifest",
            content: (
              <p className="text-sm" style={{ color: "var(--color-sol-text-dim)" }}>
                Add an entry to{" "}
                <code
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{ background: "var(--color-sol-dark)", color: "var(--color-sol-purple)" }}
                >
                  icons/manifest.json
                </code>{" "}
                with your icon&apos;s metadata (id, name, category, aliases, tags).
              </p>
            ),
          },
          {
            step: "5",
            title: "Open a Pull Request",
            content: (
              <p className="text-sm" style={{ color: "var(--color-sol-text-dim)" }}>
                Submit a PR to the{" "}
                <code
                  className="px-1.5 py-0.5 rounded text-xs"
                  style={{ background: "var(--color-sol-dark)", color: "var(--color-sol-purple)" }}
                >
                  main
                </code>{" "}
                branch with your changes. Include the icon source/brand kit URL in the PR description.
              </p>
            ),
          },
        ].map(({ step, title, content }) => (
          <div
            key={step}
            className="flex gap-4 mb-6 p-5 rounded-xl"
            style={{
              background: "var(--color-sol-surface)",
              border: "1px solid var(--color-sol-border)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{
                background: "rgba(153, 69, 255, 0.2)",
                color: "var(--color-sol-purple)",
              }}
            >
              {step}
            </div>
            <div className="flex-1">
              <h3
                className="font-semibold text-sm mb-2"
                style={{ color: "var(--color-sol-text)" }}
              >
                {title}
              </h3>
              {content}
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

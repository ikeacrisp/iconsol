import Link from "next/link";
import { Header } from "@/components/Header";

export default function DocsPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--color-sol-dark)" }}>
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: "var(--color-sol-text)" }}
        >
          Documentation
        </h1>
        <p className="mb-10" style={{ color: "var(--color-sol-text-dim)" }}>
          Install and use Solana Icons in your React project.
        </p>

        <Section title="Installation">
          <CodeBlock code={`npm i iconsol\n# or\npnpm add iconsol\n# or\nyarn add iconsol`} />
        </Section>

        <Section title="Basic Usage">
          <p className="mb-3 text-sm" style={{ color: "var(--color-sol-text-dim)" }}>
            Import any icon as a named export. Each component accepts standard SVG props plus a{" "}
            <code
              className="px-1.5 py-0.5 rounded text-xs"
              style={{ background: "var(--color-sol-surface)", color: "var(--color-sol-purple)" }}
            >
              size
            </code>{" "}
            prop.
          </p>
          <CodeBlock
            code={`import { Jupiter, Phantom, Raydium, Sol } from "iconsol";

export default function App() {
  return (
    <div>
      <Sol size={32} />
      <Jupiter size={24} />
      <Phantom size={24} className="text-purple-400" />
      <Raydium size={20} color="#9945ff" />
    </div>
  );
}`}
          />
        </Section>

        <Section title="Props">
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--color-sol-border)" }}
          >
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "var(--color-sol-surface)" }}>
                  {["Prop", "Type", "Default", "Description"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-2.5 text-xs font-medium"
                      style={{ color: "var(--color-sol-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["size", "number | string", "24", "Width and height of the icon"],
                  ["color", "string", "currentColor", "Icon color"],
                  ["className", "string", "—", "CSS class names"],
                  ["...props", "SVGProps", "—", "Any standard SVG attribute"],
                ].map(([prop, type, def, desc], i) => (
                  <tr
                    key={prop}
                    style={{
                      borderTop: i === 0 ? "1px solid var(--color-sol-border)" : "1px solid var(--color-sol-border)",
                      background: i % 2 === 0 ? "transparent" : "var(--color-sol-surface)",
                    }}
                  >
                    <td className="px-4 py-2.5">
                      <code
                        className="text-xs"
                        style={{ color: "var(--color-sol-purple)" }}
                      >
                        {prop}
                      </code>
                    </td>
                    <td
                      className="px-4 py-2.5 text-xs font-mono"
                      style={{ color: "var(--color-sol-green)" }}
                    >
                      {type}
                    </td>
                    <td
                      className="px-4 py-2.5 text-xs"
                      style={{ color: "var(--color-sol-muted)" }}
                    >
                      {def}
                    </td>
                    <td
                      className="px-4 py-2.5 text-xs"
                      style={{ color: "var(--color-sol-text-dim)" }}
                    >
                      {desc}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Tree Shaking">
          <p className="text-sm mb-3" style={{ color: "var(--color-sol-text-dim)" }}>
            The package is fully tree-shakeable. Only the icons you import are included in your bundle.
          </p>
          <CodeBlock
            code={`// ✅ Only Jupiter component is bundled
import { Jupiter } from "iconsol";

// ✅ Also works — still tree-shaken by bundlers
import { Jupiter, Phantom } from "iconsol";`}
          />
        </Section>

        <Section title="Available Icons">
          <p className="text-sm" style={{ color: "var(--color-sol-text-dim)" }}>
            Browse and search all available icons on the{" "}
            <Link href="/" className="underline" style={{ color: "var(--color-sol-purple)" }}>
              home page
            </Link>
            . Click any icon to see the exact import name.
          </p>
        </Section>

        <Section title="JSON API">
          <p className="mb-3 text-sm" style={{ color: "var(--color-sol-text-dim)" }}>
            A public, read-only HTTP API for fetching logo metadata. Served with CORS
            enabled and cached at the edge.
          </p>
          <CodeBlock
            code={`# List & search
GET https://iconsol.me/api/logos
GET https://iconsol.me/api/logos?q=jupiter
GET https://iconsol.me/api/logos?category=defi

# Fetch one by id
GET https://iconsol.me/api/logos/jup`}
          />
          <p className="mt-4 mb-2 text-sm" style={{ color: "var(--color-sol-text-dim)" }}>
            Response shape:
          </p>
          <CodeBlock
            code={`{
  "id": "jup",
  "name": "Jupiter",
  "ticker": "JUP",
  "category": "tokens",
  "tags": ["governance", "dex", "aggregator"],
  "aliases": ["jupiter", "jup.ag"],
  "website": "https://jup.ag",
  "description": "Jupiter is Solana's leading swap and routing layer ...",
  "relatedIds": ["jupsol", "jupusd", "jupiter-lend", "sol"],
  "src": "https://iconsol.me/brand/jup.svg"
}`}
          />
        </Section>

        <Section title="MCP Server">
          <p className="mb-3 text-sm" style={{ color: "var(--color-sol-text-dim)" }}>
            Use iconsol from Claude Desktop, Cursor, Windsurf, or any MCP-aware client.
            Add the endpoint once and the assistant can look up any Solana logo on demand.
          </p>
          <CodeBlock
            code={`// mcp.json
{
  "mcpServers": {
    "iconsol": {
      "url": "https://iconsol.me/api/mcp"
    }
  }
}`}
          />
          <p className="mt-4 mb-2 text-sm" style={{ color: "var(--color-sol-text-dim)" }}>
            Two tools are exposed:
          </p>
          <CodeBlock
            code={`search_logos({ query?: string, category?: "tokens"|"defi"|"wallets"|"nft"|"infrastructure"|"all" })
  → { count, logos: Logo[] }

get_logo({ id: string })
  → Logo`}
          />
        </Section>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--color-sol-text)" }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre
      className="rounded-xl px-5 py-4 overflow-x-auto text-xs leading-6 font-mono"
      style={{
        background: "var(--color-sol-surface)",
        border: "1px solid var(--color-sol-border)",
        color: "var(--color-sol-text)",
      }}
    >
      <code>{code}</code>
    </pre>
  );
}

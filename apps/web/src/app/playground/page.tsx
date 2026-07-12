import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { McpPlayground } from "@/components/McpPlayground";

export const metadata = {
  title: "MCP Playground — iconsol",
  description:
    "A live client for the iconsol MCP server. Search every Solana logo over JSON-RPC and watch the protocol traffic as it happens.",
};

// Same purple-top / white-bottom radial-gradient pair used as the landing
// page backdrop, layered over the dark base — matches /mcp exactly.
const PAGE_BACKGROUND_IMAGE = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-0.0000090122 -58.004 109.09 -0.00001695 756 982)'><stop stop-color='rgba(123,100,254,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), url("data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0.0000090122 49.1 -120.87 0.000022186 756 0.0000075669)'><stop stop-color='rgba(255,255,255,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, rgb(13, 15, 18) 0%, rgb(13, 15, 18) 100%)`;

export default function PlaygroundPage() {
  return (
    <div
      style={{
        height: "100dvh",
        minHeight: "100dvh",
        maxHeight: "100dvh",
        overflow: "hidden",
        position: "relative",
        color: "#fff",
        backgroundColor: "#0d0f12",
        backgroundImage: PAGE_BACKGROUND_IMAGE,
        backgroundRepeat: "no-repeat, no-repeat, no-repeat",
        backgroundSize: "100% 100%, 100% 100%, 100% 100%",
        backgroundPosition: "center center, center center, center center",
        isolation: "isolate",
      }}
    >
      <div
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
            padding: "108px 24px 160px",
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
            MCP Playground
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
            A live client for the iconsol MCP server — the same{" "}
            <code style={inlineCode}>search_logos</code> and{" "}
            <code style={inlineCode}>get_logo</code> tools an AI agent gets.
            Nothing is mocked; every request appears on the wire below.{" "}
            <Link
              href="/mcp"
              style={{
                color: "rgba(255,255,255,0.85)",
                textDecorationLine: "underline",
                textUnderlineOffset: 3,
                textDecorationColor: "rgba(255,255,255,0.25)",
              }}
            >
              Install it in your agent
            </Link>
            .
          </p>
          <McpPlayground />
        </main>
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <Header variant="home" />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <div style={{ pointerEvents: "auto" }}>
          <Footer variant="home" />
        </div>
      </div>
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

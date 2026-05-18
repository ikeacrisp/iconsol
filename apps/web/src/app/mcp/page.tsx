import { Footer } from "@/components/Footer";
import { Header, MCP_CONFIG_SNIPPET } from "@/components/Header";
import { McpInstallClient } from "@/components/McpInstallClient";

export const metadata = {
  title: "MCP Server — iconsol",
  description:
    "Add the iconsol MCP server to Claude Code, Codex, Cursor, V0, and other AI agents in two clicks.",
};

// Same purple-top / white-bottom radial-gradient pair used as the landing
// page backdrop, layered over the dark base. Kept inline so /mcp matches
// the rest of the site visually without a shared component refactor.
const PAGE_BACKGROUND_IMAGE = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(-0.0000090122 -58.004 109.09 -0.00001695 756 982)'><stop stop-color='rgba(123,100,254,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), url("data:image/svg+xml;utf8,<svg viewBox='0 0 1512 982' xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='none'><rect x='0' y='0' height='100%25' width='100%25' fill='url(%23grad)' opacity='1'/><defs><radialGradient id='grad' gradientUnits='userSpaceOnUse' cx='0' cy='0' r='10' gradientTransform='matrix(0.0000090122 49.1 -120.87 0.000022186 756 0.0000075669)'><stop stop-color='rgba(255,255,255,0.05)' offset='0'/><stop stop-color='rgba(13,15,18,0)' offset='1'/></radialGradient></defs></svg>"), linear-gradient(90deg, rgb(13, 15, 18) 0%, rgb(13, 15, 18) 100%)`;

export default function McpPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0d0f12",
        backgroundImage: PAGE_BACKGROUND_IMAGE,
        backgroundRepeat: "no-repeat, no-repeat, no-repeat",
        backgroundSize: "100% 100%, 100% 100%, 100% 100%",
        backgroundPosition: "center center, center center, center center",
        isolation: "isolate",
      }}
    >
      <Header variant="home" />
      <McpInstallClient configSnippet={MCP_CONFIG_SNIPPET} />
      <Footer variant="home" />
    </div>
  );
}

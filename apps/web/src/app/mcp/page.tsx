import { Header, MCP_CONFIG_SNIPPET } from "@/components/Header";
import { McpInstallClient } from "@/components/McpInstallClient";

export const metadata = {
  title: "MCP Server — iconsol",
  description:
    "Add the iconsol MCP server to Claude Code, Codex, Cursor, V0, and other AI agents in two clicks.",
};

export default function McpPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0b0f",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header variant="home" />
      <McpInstallClient configSnippet={MCP_CONFIG_SNIPPET} />
    </div>
  );
}

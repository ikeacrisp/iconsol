/**
 * Minimal browser-side MCP client for the site's own /api/mcp endpoint
 * (Streamable HTTP, stateless, JSON responses). Every call records a
 * WireFrame so the playground can render the raw protocol traffic.
 *
 * Client-safe — no Node.js imports.
 */

export const MCP_ENDPOINT = "/api/mcp";

export interface McpLogo {
  id: string;
  name: string;
  ticker?: string;
  category: string;
  mintAddress?: string;
  tags?: string[];
  aliases?: string[];
  website?: string;
  description?: string;
  relatedIds?: string[];
  src: string;
}

export interface McpToolInfo {
  name: string;
  title?: string;
  description?: string;
}

export interface WireFrame {
  seq: number;
  /** Human label, e.g. "tools/call · search_logos" */
  label: string;
  /** One-line summary of the call arguments */
  summary: string;
  request: unknown;
  response: unknown;
  ms: number;
  /** Transport + JSON-RPC level success */
  ok: boolean;
  /** Tool-level error (result.isError) */
  toolError: boolean;
}

export type OnFrame = (frame: WireFrame) => void;

interface RpcEnvelope {
  jsonrpc: "2.0";
  id: number;
  result?: Record<string, unknown>;
  error?: { code: number; message: string };
}

let seq = 0;

function summarize(method: string, params?: Record<string, unknown>): string {
  if (method !== "tools/call" || !params) return "";
  const args = params.arguments as Record<string, unknown> | undefined;
  const pairs = Object.entries(args ?? {})
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join(", ");
  return pairs ? `{ ${pairs} }` : "{ }";
}

async function rpc(
  method: string,
  params: Record<string, unknown> | undefined,
  onFrame: OnFrame
): Promise<RpcEnvelope> {
  const id = ++seq;
  const request: Record<string, unknown> = { jsonrpc: "2.0", id, method };
  if (params !== undefined) request.params = params;

  const toolName =
    method === "tools/call" && params ? String(params.name) : undefined;
  const label = toolName ? `tools/call · ${toolName}` : method;

  const started = performance.now();
  let response: unknown;
  let ok = false;
  let toolError = false;

  try {
    const res = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify(request),
    });
    response = await res.json();
    const envelope = response as RpcEnvelope;
    ok = res.ok && !envelope.error;
    toolError = Boolean(
      (envelope.result as { isError?: boolean } | undefined)?.isError
    );
  } catch (err) {
    response = { transportError: String(err) };
  }

  onFrame({
    seq: id,
    label,
    summary: summarize(method, params),
    request,
    response,
    ms: Math.round(performance.now() - started),
    ok,
    toolError,
  });

  if (!ok) {
    const envelope = response as RpcEnvelope;
    throw new Error(
      envelope?.error?.message ??
        (response as { transportError?: string })?.transportError ??
        "Request failed"
    );
  }
  return response as RpcEnvelope;
}

/** Parses the JSON payload MCP tools return as a single text content block. */
function toolPayload<T>(envelope: RpcEnvelope): T {
  const content = (
    envelope.result as { content?: Array<{ type: string; text: string }> }
  )?.content;
  const text = content?.find((c) => c.type === "text")?.text;
  if (!text) throw new Error("Tool returned no text content");
  return JSON.parse(text) as T;
}

export interface McpConnection {
  serverName: string;
  serverVersion: string;
  initMs: number;
  tools: McpToolInfo[];
}

export async function mcpConnect(onFrame: OnFrame): Promise<McpConnection> {
  const started = performance.now();
  const init = await rpc(
    "initialize",
    {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "iconsol-playground", version: "1.0.0" },
    },
    onFrame
  );
  const initMs = Math.round(performance.now() - started);
  const list = await rpc("tools/list", {}, onFrame);

  const serverInfo = (
    init.result as { serverInfo?: { name?: string; version?: string } }
  )?.serverInfo;

  return {
    serverName: serverInfo?.name ?? "iconsol",
    serverVersion: serverInfo?.version ?? "?",
    initMs,
    tools: ((list.result as { tools?: McpToolInfo[] })?.tools ??
      []) as McpToolInfo[],
  };
}

export interface McpSearchResult {
  count: number;
  logos: McpLogo[];
  ms: number;
}

export async function mcpSearchLogos(
  query: string,
  category: string,
  onFrame: OnFrame
): Promise<McpSearchResult> {
  const args: Record<string, unknown> = {};
  if (query.trim()) args.query = query.trim();
  if (category !== "all") args.category = category;

  const started = performance.now();
  const envelope = await rpc(
    "tools/call",
    { name: "search_logos", arguments: args },
    onFrame
  );
  const payload = toolPayload<{ count: number; logos: McpLogo[] }>(envelope);
  return { ...payload, ms: Math.round(performance.now() - started) };
}

export async function mcpGetLogo(
  id: string,
  onFrame: OnFrame
): Promise<McpLogo> {
  const envelope = await rpc(
    "tools/call",
    { name: "get_logo", arguments: { id } },
    onFrame
  );
  const payload = toolPayload<McpLogo | { error: string; id: string }>(
    envelope
  );
  if ("error" in payload) {
    throw new Error(`Logo "${id}" not found`);
  }
  return payload;
}

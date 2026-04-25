import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { getAllIcons, getIconById } from "@/lib/icons";
import { searchIcons } from "@/lib/search";
import type { Icon, IconCategory } from "@/lib/icon-data";

const CATEGORY_ENUM = z.enum([
  "all",
  "tokens",
  "defi",
  "wallets",
  "nft",
  "infrastructure",
]);

function toAbsoluteSrc(origin: string, src: string) {
  if (!src) return src;
  if (src.startsWith("http")) return src;
  return `${origin}${src}`;
}

function serializeIcon(origin: string, icon: Icon) {
  return {
    id: icon.id,
    name: icon.name,
    ticker: icon.ticker,
    category: icon.category,
    tags: icon.tags,
    aliases: icon.aliases,
    website: icon.website,
    description: icon.description,
    relatedIds: icon.relatedIds,
    src: toAbsoluteSrc(origin, icon.src),
  };
}

function createServer(origin: string) {
  const server = new McpServer(
    { name: "iconsol", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.registerTool(
    "search_logos",
    {
      title: "Search Solana logos",
      description:
        "Search the iconsol directory of Solana ecosystem logos by keyword and/or category. Matches across name, id, ticker, aliases, and tags.",
      inputSchema: {
        query: z
          .string()
          .optional()
          .describe("Keyword to match against name, id, ticker, aliases, tags"),
        category: CATEGORY_ENUM.optional().describe(
          "Filter to one of: tokens, defi, wallets, nft, infrastructure, all"
        ),
      },
    },
    async ({ query, category }) => {
      const results = searchIcons(getAllIcons(), {
        query,
        category: (category ?? "all") as IconCategory | "all",
      }).map((icon) => serializeIcon(origin, icon));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ count: results.length, logos: results }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "get_logo",
    {
      title: "Get a Solana logo",
      description:
        "Fetch a single logo from iconsol by its id. Returns name, category, website, description, tags, and the direct SVG URL.",
      inputSchema: {
        id: z.string().describe("The logo id, e.g. 'jup', 'sol', 'phantom'"),
      },
    },
    async ({ id }) => {
      const icon = getIconById(id);
      if (!icon) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: JSON.stringify({ error: "not_found", id }),
            },
          ],
        };
      }
      return {
        content: [
          { type: "text", text: JSON.stringify(serializeIcon(origin, icon), null, 2) },
        ],
      };
    }
  );

  return server;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, mcp-session-id",
  "Access-Control-Expose-Headers": "mcp-session-id",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

async function handle(request: Request) {
  const origin = new URL(request.url).origin;
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = createServer(origin);
  await server.connect(transport);

  const response = await transport.handleRequest(request);
  const merged = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS_HEADERS)) {
    merged.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: merged,
  });
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;

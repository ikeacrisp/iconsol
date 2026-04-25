import { NextResponse } from "next/server";

// Dev-only tooling endpoint. Disabled on production deploys so the in-memory
// store cannot be written to or read by unauthenticated clients.
const ENABLED =
  process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

type AgentationAnnotation = {
  id: string;
  comment: string;
  element?: string;
  elementPath?: string;
  selectedText?: string;
  nearbyText?: string;
  cssClasses?: string;
  timestamp?: number;
  sessionId?: string;
  url?: string;
};

type AgentationEventPayload =
  | {
      kind: "add" | "update" | "delete";
      annotation: AgentationAnnotation;
      url?: string;
      submittedAt?: number;
    }
  | {
      kind: "clear";
      annotations: AgentationAnnotation[];
      url?: string;
      submittedAt?: number;
    }
  | {
      kind: "submit";
      output: string;
      annotations: AgentationAnnotation[];
      url?: string;
      submittedAt?: number;
    };

type LegacyAgentationPayload = {
  output?: string;
  annotations?: AgentationAnnotation[];
  url?: string;
  submittedAt?: number;
};

type AgentationStore = {
  latest: AgentationEventPayload | null;
  annotations: Record<string, AgentationAnnotation>;
  updatedAt: number | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __agentationStore: AgentationStore | undefined;
}

function getStore() {
  if (!globalThis.__agentationStore) {
    globalThis.__agentationStore = { latest: null, annotations: {}, updatedAt: null };
  }

  return globalThis.__agentationStore;
}

export async function POST(request: Request) {
  if (!ENABLED) return new NextResponse("Not Found", { status: 404 });

  const body = (await request.json()) as AgentationEventPayload | LegacyAgentationPayload;
  const store = getStore();

  if ("kind" in body) {
    store.latest = body;
    store.updatedAt = body.submittedAt ?? Date.now();

    if (body.kind === "add" || body.kind === "update") {
      store.annotations[body.annotation.id] = body.annotation;
    }

    if (body.kind === "delete") {
      delete store.annotations[body.annotation.id];
    }

    if (body.kind === "clear") {
      for (const annotation of body.annotations) {
        delete store.annotations[annotation.id];
      }
    }

    if (body.kind === "submit") {
      for (const annotation of body.annotations) {
        store.annotations[annotation.id] = annotation;
      }
    }
  } else {
    const annotations = body.annotations ?? [];

    store.latest = {
      kind: "submit",
      output: body.output ?? "",
      annotations,
      url: body.url,
      submittedAt: body.submittedAt,
    };
    store.updatedAt = body.submittedAt ?? Date.now();

    for (const annotation of annotations) {
      store.annotations[annotation.id] = annotation;
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  if (!ENABLED) return new NextResponse("Not Found", { status: 404 });

  const store = getStore();

  return NextResponse.json({
    latest: store.latest,
    annotations: Object.values(store.annotations),
    count: Object.keys(store.annotations).length,
    updatedAt: store.updatedAt,
  });
}

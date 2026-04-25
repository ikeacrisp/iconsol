"use client";

import { Agentation } from "agentation";
import { useCallback } from "react";

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
      url: string;
      submittedAt: number;
    }
  | {
      kind: "clear";
      annotations: AgentationAnnotation[];
      url: string;
      submittedAt: number;
    }
  | {
      kind: "submit";
      output: string;
      annotations: AgentationAnnotation[];
      url: string;
      submittedAt: number;
    };

export function AgentationToolbar({ enabled }: { enabled: boolean }) {
  const postEvent = useCallback(async (payload: AgentationEventPayload) => {
    await fetch("/api/agentation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  }, []);

  const handleAnnotationAdd = useCallback(
    (annotation: AgentationAnnotation) =>
      postEvent({
        kind: "add",
        annotation,
        url: window.location.href,
        submittedAt: Date.now(),
      }),
    [postEvent]
  );

  const handleAnnotationUpdate = useCallback(
    (annotation: AgentationAnnotation) =>
      postEvent({
        kind: "update",
        annotation,
        url: window.location.href,
        submittedAt: Date.now(),
      }),
    [postEvent]
  );

  const handleAnnotationDelete = useCallback(
    (annotation: AgentationAnnotation) =>
      postEvent({
        kind: "delete",
        annotation,
        url: window.location.href,
        submittedAt: Date.now(),
      }),
    [postEvent]
  );

  const handleAnnotationsClear = useCallback(
    (annotations: AgentationAnnotation[]) =>
      postEvent({
        kind: "clear",
        annotations,
        url: window.location.href,
        submittedAt: Date.now(),
      }),
    [postEvent]
  );

  const handleSubmit = useCallback(
    (output: string, annotations: AgentationAnnotation[]) =>
      postEvent({
        kind: "submit",
        output,
        annotations,
        url: window.location.href,
        submittedAt: Date.now(),
      }),
    [postEvent]
  );

  if (!enabled) {
    return null;
  }

  return (
    <Agentation
      onAnnotationAdd={handleAnnotationAdd}
      onAnnotationUpdate={handleAnnotationUpdate}
      onAnnotationDelete={handleAnnotationDelete}
      onAnnotationsClear={handleAnnotationsClear}
      onSubmit={handleSubmit}
    />
  );
}

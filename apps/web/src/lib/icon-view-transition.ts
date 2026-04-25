"use client";

const PENDING_ICON_KEY = "iconsol-pending-icon-transition";

export const ICON_FRAME_TRANSITION_NAME = "iconsol-icon-frame";
export const ICON_ART_TRANSITION_NAME = "iconsol-icon-art";

type ViewTransition = {
  finished: Promise<void>;
};

type TransitionCapableDocument = Document & {
  startViewTransition?: (
    updateCallback: () => void | Promise<void>
  ) => ViewTransition;
};

export function setPendingIconTransition(id: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(PENDING_ICON_KEY, id);
}

export function getPendingIconTransition() {
  if (typeof window === "undefined") return null;
  return window.sessionStorage.getItem(PENDING_ICON_KEY);
}

export function clearPendingIconTransition() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(PENDING_ICON_KEY);
}

export function getDocumentViewTransition() {
  if (typeof document === "undefined") return null;

  const nextDocument = document as TransitionCapableDocument;
  return nextDocument.startViewTransition?.bind(nextDocument) ?? null;
}

export function shouldUseIconViewTransition() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return Boolean(getDocumentViewTransition());
}

"use client";

const PENDING_ICON_KEY = "iconsol-pending-icon-transition";
const ICON_BACK_KEY = "iconsol:icon-back";

/** Allowed pages an /icon/[id] view can return to via the back button. */
export type IconBackOrigin = "/" | "/lens" | "/dashboard";

/**
 * Record the page the user came from when opening /icon/[id]. The detail
 * page reads this on its back button so the user lands back on the same
 * origin (home / lens view / dashboard), regardless of how many related
 * logos they clicked through inside the detail view.
 */
export function setIconBackOrigin(origin: IconBackOrigin) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ICON_BACK_KEY, origin);
}

export function getIconBackOrigin(): IconBackOrigin | null {
  if (typeof window === "undefined") return null;
  const stored = window.sessionStorage.getItem(ICON_BACK_KEY);
  if (stored === "/" || stored === "/lens" || stored === "/dashboard") {
    return stored;
  }
  return null;
}

export function clearIconBackOrigin() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ICON_BACK_KEY);
}

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

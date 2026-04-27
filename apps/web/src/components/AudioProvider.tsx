"use client";

import { SoundProvider, useSound } from "@web-kits/audio/react";
import { useEffect, useRef } from "react";
import { tick } from "@/lib/audio/core";

/**
 * Browsers keep AudioContext suspended until the user actually interacts
 * with the page. The first sound triggered by a hover/click can fire
 * before the context has finished resuming, so it's silently dropped.
 *
 * This component listens for the very first user gesture and triggers
 * a near-silent warm-up sound from inside that handler, which guarantees
 * the context is unlocked before any real sound plays.
 */
function AudioContextUnlock() {
  const playWarmup = useSound(tick, { volume: 0.0001 });
  const unlockedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (unlockedRef.current) return;

    const events: (keyof WindowEventMap)[] = [
      "pointerdown",
      "keydown",
      "touchstart",
    ];

    const unlock = () => {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      // Play inside the gesture so the AudioContext can resume.
      playWarmup();
      for (const ev of events) {
        window.removeEventListener(ev, unlock);
      }
    };

    for (const ev of events) {
      window.addEventListener(ev, unlock, { passive: true });
    }

    return () => {
      for (const ev of events) {
        window.removeEventListener(ev, unlock);
      }
    };
  }, [playWarmup]);

  return null;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  return (
    <SoundProvider volume={0.7}>
      <AudioContextUnlock />
      {children}
    </SoundProvider>
  );
}

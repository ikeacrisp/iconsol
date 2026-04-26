"use client";

import { SoundProvider } from "@web-kits/audio/react";

export function AudioProvider({ children }: { children: React.ReactNode }) {
  return <SoundProvider volume={0.7}>{children}</SoundProvider>;
}

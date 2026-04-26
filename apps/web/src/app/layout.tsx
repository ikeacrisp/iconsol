import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { AudioProvider } from "@/components/AudioProvider";
import "./globals.css";

const AgentationToolbar = dynamic(
  () => import("@/components/AgentationToolbar").then((m) => m.AgentationToolbar)
);

export const metadata: Metadata = {
  title: "iconsol",
  description:
    "A curated directory of high-quality logos and icons for the Solana ecosystem. Tokens, DeFi protocols, wallets, NFT platforms, and infrastructure. Download SVG, copy as React, React Native, Swift, HTML, or SVG.",
  keywords: [
    "solana",
    "icons",
    "logos",
    "defi",
    "web3",
    "react",
    "react native",
    "swift",
    "html",
    "svg",
    "iconsol",
  ],
  openGraph: {
    title: "iconsol",
    description: "Solana ecosystem logos and icons",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const showAgentation =
    process.env.NODE_ENV === "development" || process.env.VERCEL_ENV === "preview";

  return (
    <html lang="en" className="dark">
      <body className={`${GeistSans.className} ${GeistSans.variable} ${GeistMono.variable}`}>
        <AudioProvider>{children}</AudioProvider>
        {showAgentation && <AgentationToolbar enabled />}
      </body>
    </html>
  );
}

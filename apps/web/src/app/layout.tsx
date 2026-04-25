import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

const AgentationToolbar = dynamic(
  () => import("@/components/AgentationToolbar").then((m) => m.AgentationToolbar)
);

export const metadata: Metadata = {
  title: "iconsol",
  description:
    "A curated directory of high-quality logos and icons for the Solana ecosystem. Tokens, DeFi protocols, wallets, NFT platforms, and infrastructure. Download SVG, copy as React/Vue/Svelte component, or npm install.",
  keywords: [
    "solana",
    "icons",
    "logos",
    "defi",
    "web3",
    "react",
    "vue",
    "svelte",
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
        {children}
        {showAgentation && <AgentationToolbar enabled />}
      </body>
    </html>
  );
}

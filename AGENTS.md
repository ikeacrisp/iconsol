# AGENTS.md

This file provides guidance to Codex when working with code in this repository.

## Project Overview

**iconsol** — A curated directory of Solana ecosystem logos and icons. Monorepo with pnpm workspaces + Turborepo. The web app is a Next.js 15 App Router site deployed to Vercel at **iconsol.me**.

## Common Commands

```bash
pnpm --filter web dev       # Start dev server (port 3030)
pnpm --filter web build     # Production build
pnpm --filter web lint      # Lint
```

## Architecture

### Monorepo Structure
```
apps/web/               # Next.js 15 web app
  src/
    app/                # App Router pages
      page.tsx          # Homepage (LP)
      dashboard/        # Dashboard with icon grid
      icon/[id]/        # Icon detail page (dynamic)
      globals.css       # Global styles + @theme tokens
      layout.tsx        # Root layout with font
      icon.svg          # Favicon
    components/         # Shared UI components
      Header.tsx        # Header (home/dashboard variants)
      Footer.tsx        # Footer (home/dashboard variants)
      IconGrid.tsx      # Dashboard sidebar + icon grid
      IconDetail.tsx    # Icon detail two-panel view
    lib/
      icon-data.ts      # Client-safe types + categories
      icons.ts          # Server-only icon utilities
      manifest.json     # Icon manifest (id, name, category, etc.)
  public/
    icons/              # Icon assets organized by category
      tokens/           # Token icons (SVG/PNG)
      defi/             # DeFi protocol icons
      wallets/          # Wallet icons
      nft/              # NFT platform icons
      infrastructure/   # Infrastructure icons
    iconsol-logo.svg    # Site logo
```

## Design System Rules

### Design-to-Code Implementation Rules

When implementing designs from the design tool using the MCP server:

1. **Treat MCP output as a design spec, NOT final code.** The output is React + Tailwind — translate it into this project's conventions below.
2. **Use inline `style={{}}` for exact design values** (colors, spacing, borders, sizes). This project does NOT use Tailwind utility classes for design-specific values — it uses inline styles to match the design precisely.
3. **Use Tailwind only for layout utilities** like `flex`, `items-center`, `flex-1`, `shrink-0`, `overflow-clip`, `whitespace-nowrap`.
4. **Validate the final UI against the source screenshot** for 1:1 visual parity before marking complete.
5. **Implement one component at a time**, not full pages. Build atoms → molecules → organisms.

### Font

- **Geist Sans** + **Geist Mono** — loaded from the `geist` package via `next/font` in `app/layout.tsx`
- Applied as `className` on `<body>`; CSS vars: `--font-geist-sans`, `--font-geist-mono`
- `Geist Pixel` (display only) — `@font-face` from `/public/GeistPixel-Square.otf`
- All text uses Geist — do NOT import or reference other fonts

### Color Tokens

Defined in `globals.css` `@theme` block. However, **most colors in the UI use direct rgba/hex values from the design source**, not these tokens:

```
Page background:       #0a0b0f
Panel borders:         #16171b (2px solid)
Toggle borders:        #16171b (1.5px solid)
Card background:       rgba(255,255,255,0.02)
Card border:           rgba(255,255,255,0.05)
Input/button bg:       rgba(255,255,255,0.05)
Active category bg:    rgba(149,128,255,0.05)
Active category count: rgba(149,128,255,0.6)
Primary text:          #fff
Secondary text:        rgba(255,255,255,0.6)
Muted text:            rgba(255,255,255,0.4)
Code keywords:         #ce7fff
Code identifiers:      #7478ff
Code strings:          #2fd5b2
Code tags:             #48b6fb
Code attributes:       #fc6
Code default:          rgba(255,255,255,0.4)
```

### Spacing System

The design uses **specific pixel values from the design source**, NOT a spacing scale:

```
Page padding:          42px
Panel inner padding:   24px
Component padding:     12px, 6px (buttons/toggles)
Card padding:          20px
Icon sizes:            16px (category), 20px (actions), 42px (grid cards)
Gaps:                  6px, 12px, 14px, 24px, 42px, 78px
Border radius:         8px (buttons), 12px (cards/toggles), 24px (search/code), 59.545px (icon preview)
```

### Border Patterns

```
Panel borders:         border: 2px solid #16171b (selective sides — top/right/bottom OR top/left/bottom)
Toggle outer:          border: 1.5px solid #16171b; border-radius: 12px
Card borders:          border: 1px solid rgba(255,255,255,0.05)
```

### Component Patterns

**Header** (`components/Header.tsx`)
- Props: `variant: "home" | "dashboard"`, `highlightGrid: boolean`
- Home: no inline search, grid icon has no bg
- Dashboard: inline search bar (428px, 180px gap from logo), grid icon may have bg
- npm box: `gap-[42px]`, `rounded-[12px]`, text split into `rgba(255,255,255,0.6)` prefix + `rgba(255,255,255,0.4)` rest
- Framework dropdown: React/Vue/Svelte with crossfade icon animation

**Footer** (`components/Footer.tsx`)
- Props: `variant: "home" | "dashboard"`
- Home: centered "built by @ikeacrisp" (12px)
- Dashboard: "© twenty'26 iconsol. All rights reserved." + X/GitHub icons, h-120, p-42

**IconGrid** (`components/IconGrid.tsx`)
- Sidebar: 310px, borders on top/right/bottom, categories with 16px SVG icons
- Categories: `p-[12px] rounded-[8px]`, `gap-[12px]`, text 15px
- Brand/Solid toggle: outer `border: 1.5px solid #16171b`, active has `border: 2px solid #0a0b0f`
- Icon cards: NO text labels, just icon in bordered card, `p-[20px] rounded-[12px]`, `gap-[24px]` flex-wrap
- Content section height: 742px

**IconDetail** (`components/IconDetail.tsx`)
- Left panel: `w-[908px]`, borders top/right/bottom, centered 238px content column
- Back button: absolute top-left, double-chevron-left, `bg-rgba(255,255,255,0.05) p-[6px] rounded-[8px]`
- Icon preview: `238px × 238px`, `rounded-[59.545px]`, `bg-rgba(255,255,255,0.05)`
- Right panel: flex-1, code with syntax highlighting, tab with TSX icon
- Code area: `bg-rgba(255,255,255,0.03)`, `rounded-bl/br/tr-[24px]`, `px-[24px] py-[32px]`

### SVG Icon Conventions

- All icons are inline SVGs — no icon library
- Standard props: `width`, `height`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke`, `strokeWidth`, `strokeLinecap="round"`, `strokeLinejoin="round"`
- Action icons (copy, search, chevron): 20×20
- Category sidebar icons: 16×16
- Grid card icons: 42×42 (from `/icons/{category}/{id}.svg`)

### Routing

```
/              → Homepage (LP) — search bar, surprise me
/dashboard     → Icon grid with sidebar categories
/icon/[id]     → Icon detail with code preview
/docs          → Documentation
/submit        → Submit an icon
```

### Data Flow

- `lib/manifest.json` — source of truth for all icons (id, name, ticker, category, aliases, tags, mintAddress, website)
- `lib/icons.ts` — server-only utilities using Node.js `fs` to resolve icon files from `public/icons/`
- `lib/icon-data.ts` — client-safe types, categories, and color constants
- Icon images stored at: `public/icons/{category}/{id}.svg` (or `.png`)

### Key Patterns

1. **Client vs Server separation**: Pages that use `useSearchParams`, `useRouter`, or state are `"use client"`. Data fetching (`getAllIcons`, `getIconById`) happens in server components.
2. **Suspense boundary**: Required around components using `useSearchParams` (e.g., `IconGrid`).
3. **No component library**: All UI is custom-built with inline styles + minimal Tailwind layout classes.
4. **Animation**: CSS transitions with `cubic-bezier(0.16, 1, 0.3, 1)` easing. `useLayoutEffect` for measuring DOM before paint.
5. **Scrollbars hidden**: `scrollbar-width: none` + `::-webkit-scrollbar { display: none }`.

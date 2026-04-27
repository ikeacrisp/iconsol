"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSound } from "@web-kits/audio/react";
import { BlurFade } from "@/components/BlurFade";
import { BrandLogo, SolidLogo } from "@/components/BrandLogo";
import { ImageIcon, MaskIcon } from "@/components/UiIcon";
import { confetti, progressTick } from "@/lib/audio/core";
import { toggleOff, toggleOn } from "@/lib/audio/minimal";
import {
  BRAND_LOGO_ASSETS,
  SOLID_LOGO_ASSETS,
  type LogoId,
  type LogoAssetSpec,
} from "@/lib/logo-assets";
import {
  clearPendingIconTransition,
  getDocumentViewTransition,
  getPendingIconTransition,
  ICON_ART_TRANSITION_NAME,
  ICON_FRAME_TRANSITION_NAME,
} from "@/lib/icon-view-transition";
import {
  DEFAULT_CONTRIBUTORS,
  type Contributor,
  type Icon,
} from "@/lib/icon-data";
import { easingGradient } from "@/lib/easing-gradient";

const PANEL_FADE_BG = easingGradient(
  "180deg",
  "rgba(255,255,255,0)",
  "rgba(255,255,255,0.01)",
);

const PREVIEW_FRAME_BG = easingGradient("180deg", "#17181B", "#101215");

const EXTERNAL_LINK_ICON = "/ui/external-link.svg";
const SVG_FILE_ICON = "/ui/download-svg.svg";
const PNG_FILE_ICON = "/ui/download-png.svg";
const HOVER_SPRING = { stiffness: 400, damping: 35 };
const RIGHT_COLUMN_WIDTH = 720;
const LEFT_PANE_WIDTH = 756;
const RIGHT_PANE_WIDTH = 756;
const RELATED_ROW_HEIGHT = 72.001;
const LEFT_STACK_WIDTH = 238.179;
const LEFT_STACK_HEIGHT = 459.179;
const LEFT_PREVIEW_SECTION_TOP = 104;
const PREVIEW_GRID_SIZE = 238.179;
const PREVIEW_CARD_SIZE = 238.179;
const PREVIEW_CARD_RADIUS = 59.545;
const PREVIEW_STACK_GAP = 64;
const PREVIEW_GRID_TOP_IN_STACK = 45 + PREVIEW_STACK_GAP;
const GRID_STROKE_COLOR = "rgba(31,33,36,0.72)";
const PREVIEW_ART_WIDTH = 136.513;
const TOGGLE_INNER_WIDTH = 176;
const LEFT_PREVIEW_MIN_HEIGHT = LEFT_PREVIEW_SECTION_TOP + LEFT_STACK_HEIGHT + 24;
const FRAMEWORK_TAB_SPECS = [
  { id: "react", width: 80 },
  { id: "react-native", width: 120 },
  { id: "swift", width: 75 },
  { id: "html", width: 75 },
  { id: "svg", width: 70 },
] as const;
const UI_ICON_OPACITY = 0.4;

const FRAMEWORKS = [
  { id: "react", label: "React" },
  { id: "react-native", label: "React Native" },
  { id: "swift", label: "Swift" },
  { id: "html", label: "HTML" },
  { id: "svg", label: "SVG" },
] as const;

type FrameworkId = (typeof FRAMEWORKS)[number]["id"];

type CodeSegment = {
  text: string;
  color?: string;
};

type CodeLine = CodeSegment[];
type CodeByFramework = Record<FrameworkId, string>;
type CodeTokenizerState = {
  quote: "'" | '"' | "`" | null;
  blockComment: boolean;
};

const CODE_COLORS = {
  default: "rgba(255,255,255,0.4)",
  keyword: "#CE7FFF",
  string: "#2FD5B2",
  tag: "#48B6FB",
  identifier: "#7478FF",
  attribute: "#FFCC66",
} as const;

const CODE_KEYWORDS = new Set([
  "import",
  "from",
  "type",
  "const",
  "let",
  "var",
  "export",
  "return",
  "function",
  "async",
  "await",
  "default",
  "interface",
  "extends",
  "new",
  "if",
  "else",
  "null",
  "true",
  "false",
  "defineProps",
  "withDefaults",
]);

function burstNoise(x: number, y: number) {
  const value = 43758.5453 * Math.sin(127.1 * x + 311.7 * y);
  return value - Math.floor(value);
}

function CopyBurstOverlay({
  trigger,
  origin,
}: {
  trigger: number;
  origin?: { x?: number; y?: number };
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!trigger) return;

    const canvas = ref.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cellSize = 8;
    const dotSize = 6;
    const columns = Math.ceil(rect.width / cellSize) + 1;
    const rows = Math.ceil(rect.height / cellSize) + 1;
    const startX = origin?.x ?? Math.max(0, rect.width - 26);
    const startY = origin?.y ?? 26;
    const maxRadius =
      Math.hypot(Math.max(startX, rect.width - startX), Math.max(startY, rect.height - startY)) +
      40;
    const duration = prefersReducedMotion ? 280 : 680;
    const bandWidth = 130;
    const startedAt = performance.now();
    let frame = 0;

    const render = () => {
      const elapsed = (performance.now() - startedAt) / duration;
      if (elapsed >= 1) {
        context.clearRect(0, 0, rect.width, rect.height);
        return;
      }

      const radius = elapsed * maxRadius;
      const expansion = radius / maxRadius;
      const opacity = (1 - expansion) * (1 - expansion);
      context.clearRect(0, 0, rect.width, rect.height);

      for (let row = 0; row < rows; row += 1) {
        for (let column = 0; column < columns; column += 1) {
          const distance = Math.abs(
            Math.hypot(
              cellSize * column + cellSize / 2 - startX,
              cellSize * row + cellSize / 2 - startY
            ) - radius
          );

          if (distance > bandWidth) continue;

          const ramp = 1 - distance / bandWidth;
          const intensity = ramp * ramp;
          if (burstNoise(column, row) > 0.78 * intensity) continue;

          const alpha = 0.03 * intensity * opacity;
          context.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
          context.fillRect(cellSize * column, cellSize * row, dotSize, dotSize);
        }
      }

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, [origin, trigger]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
        mixBlendMode: "overlay",
      }}
    />
  );
}


function toPascalCase(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

function pushCodeSegment(segments: CodeLine, text: string, color?: string) {
  if (!text) return;
  segments.push({ text, color });
}

function consumeQuotedToken(
  line: string,
  start: number,
  state: CodeTokenizerState
) {
  const quote = state.quote ?? (line[start] as "'" | '"' | "`");
  let index = state.quote ? start : start + 1;

  while (index < line.length) {
    const char = line[index];
    if (char === "\\") {
      index += 2;
      continue;
    }
    index += 1;
    if (char === quote) {
      state.quote = null;
      return {
        text: line.slice(start, index),
        nextIndex: index,
      };
    }
  }

  state.quote = quote;
  return {
    text: line.slice(start),
    nextIndex: line.length,
  };
}

function tokenizeCodeLine(line: string, state: CodeTokenizerState): CodeLine {
  const segments: CodeLine = [];
  let index = 0;
  let inTag = false;

  while (index < line.length) {
    if (state.blockComment) {
      const endIndex = line.indexOf("*/", index);
      if (endIndex === -1) {
        pushCodeSegment(segments, line.slice(index));
        return segments;
      }
      pushCodeSegment(segments, line.slice(index, endIndex + 2));
      state.blockComment = false;
      index = endIndex + 2;
      continue;
    }

    if (state.quote) {
      const quoted = consumeQuotedToken(line, index, state);
      pushCodeSegment(segments, quoted.text, CODE_COLORS.string);
      index = quoted.nextIndex;
      continue;
    }

    if (line.startsWith("/*", index)) {
      const endIndex = line.indexOf("*/", index + 2);
      if (endIndex === -1) {
        state.blockComment = true;
        pushCodeSegment(segments, line.slice(index));
        return segments;
      }
      pushCodeSegment(segments, line.slice(index, endIndex + 2));
      index = endIndex + 2;
      continue;
    }

    if (line.startsWith("//", index) || line.startsWith("<!--", index)) {
      pushCodeSegment(segments, line.slice(index));
      break;
    }

    const char = line[index];

    if (char === "'" || char === '"' || char === "`") {
      const quoted = consumeQuotedToken(line, index, state);
      pushCodeSegment(segments, quoted.text, CODE_COLORS.string);
      index = quoted.nextIndex;
      continue;
    }

    if (char === "<" && /[A-Za-z/!]/.test(line[index + 1] ?? "")) {
      pushCodeSegment(segments, "<");
      index += 1;

      if (line[index] === "/") {
        pushCodeSegment(segments, "/");
        index += 1;
      }

      const tagStart = index;
      while (index < line.length && /[A-Za-z0-9:_-]/.test(line[index] ?? "")) {
        index += 1;
      }
      pushCodeSegment(segments, line.slice(tagStart, index), CODE_COLORS.tag);
      inTag = true;
      continue;
    }

    if (inTag && char === ">") {
      pushCodeSegment(segments, ">");
      inTag = false;
      index += 1;
      continue;
    }

    if (inTag && /[A-Za-z_:]/.test(char)) {
      const attrStart = index;
      while (index < line.length && /[A-Za-z0-9:_-]/.test(line[index] ?? "")) {
        index += 1;
      }
      pushCodeSegment(segments, line.slice(attrStart, index), CODE_COLORS.attribute);
      continue;
    }

    if (/[A-Za-z_$]/.test(char)) {
      const wordStart = index;
      while (index < line.length && /[A-Za-z0-9_$]/.test(line[index] ?? "")) {
        index += 1;
      }
      const word = line.slice(wordStart, index);
      pushCodeSegment(
        segments,
        word,
        CODE_KEYWORDS.has(word) ? CODE_COLORS.keyword : CODE_COLORS.identifier
      );
      continue;
    }

    if (/\d/.test(char)) {
      const numberStart = index;
      while (index < line.length && /[\d._-]/.test(line[index] ?? "")) {
        index += 1;
      }
      pushCodeSegment(segments, line.slice(numberStart, index), CODE_COLORS.string);
      continue;
    }

    pushCodeSegment(segments, char);
    index += 1;
  }

  return segments;
}

function toCodeLines(code: string): CodeLine[] {
  const state: CodeTokenizerState = {
    quote: null,
    blockComment: false,
  };

  return code.split("\n").map((line) => tokenizeCodeLine(line, state));
}

function toDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeTemplateLiteral(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? `${value}` : value.toFixed(4).replace(/\.?0+$/, "");
}

function buildStyle(entries: Array<[string, string | undefined]>) {
  return entries
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}:${value}`)
    .join(";");
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseSvgLength(value: string | undefined, base: number) {
  if (!value) return base;
  const trimmed = value.trim();
  if (!trimmed) return base;
  if (trimmed.endsWith("%")) {
    const percent = Number.parseFloat(trimmed);
    return Number.isFinite(percent) ? (base * percent) / 100 : base;
  }

  const parsed = Number.parseFloat(trimmed.replace(/px$/i, ""));
  return Number.isFinite(parsed) ? parsed : base;
}

function splitSvgList(value: string | undefined, fallback: string, count: number) {
  const items = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

  return Array.from({ length: count }, (_, index) => items[index] ?? fallback);
}

function buildSvgGradientFill(background: string, defs: string[], id: string) {
  if (!background.startsWith("linear-gradient(")) {
    return escapeXml(background);
  }

  const match = background.match(/^linear-gradient\(([^,]+),\s*(.+)\)$/);
  if (!match) {
    return escapeXml(background);
  }

  const angle = match[1]?.trim() ?? "180deg";
  const stopTokens = match[2]
    .split(/,(?![^()]*\))/)
    .map((item) => item.trim())
    .filter(Boolean);

  const stops = stopTokens
    .map((token) => token.match(/^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|[a-zA-Z]+)\s+([\d.]+)%$/))
    .filter((item): item is RegExpMatchArray => Boolean(item))
    .map((item) => ({
      color: item[1],
      offset: item[2],
    }));

  if (stops.length === 0) {
    return escapeXml(background);
  }

  const axis =
    angle === "180deg"
      ? { x1: "0.5", y1: "0", x2: "0.5", y2: "1" }
      : { x1: "0", y1: "0.5", x2: "1", y2: "0.5" };

  defs.push(
    `<linearGradient id="${id}" x1="${axis.x1}" y1="${axis.y1}" x2="${axis.x2}" y2="${axis.y2}">${stops
      .map(
        (stop) =>
          `<stop offset="${escapeXml(stop.offset)}%" stop-color="${escapeXml(stop.color)}" />`
      )
      .join("")}</linearGradient>`
  );

  return `url(#${id})`;
}

function buildSvgImageHref(src: string, assetTexts: Record<string, string>) {
  return assetTexts[src] ? toDataUri(assetTexts[src]) : src;
}

function buildHtmlMarkup(spec: LogoAssetSpec, assetTexts: Record<string, string>) {
  const outerStyle = buildStyle([
    ["position", "relative"],
    ["width", "32px"],
    ["height", "32px"],
    ["border-radius", spec.radius !== undefined ? `${formatNumber(spec.radius)}px` : undefined],
    ["background", spec.background],
    ["overflow", spec.background || spec.radius ? "hidden" : "visible"],
  ]);

  const children = spec.layers
    .map((layer) => {
      const x = `${formatNumber(layer.x)}px`;
      const y = `${formatNumber(layer.y)}px`;
      const width = `${formatNumber(layer.width)}px`;
      const height = `${formatNumber(layer.height)}px`;
      const transform = layer.rotation ? `rotate(${layer.rotation}deg)` : undefined;
      const asset = assetTexts[layer.src] ? toDataUri(assetTexts[layer.src]) : layer.src;

      if (layer.maskSrcs?.length) {
        const masks = layer.maskSrcs
          .map((maskSrc) => assetTexts[maskSrc] ? `url('${toDataUri(assetTexts[maskSrc])}')` : `url('${maskSrc}')`)
          .join(",");

        const layerStyle = buildStyle([
          ["position", "absolute"],
          ["left", x],
          ["top", y],
          ["width", width],
          ["height", height],
          ["transform", transform],
          ["transform-origin", "center"],
          ["background-image", `url('${asset}')`],
          ["background-repeat", "no-repeat"],
          ["background-position", "center"],
          ["background-size", "contain"],
          ["-webkit-mask-image", masks],
          ["mask-image", masks],
          ["-webkit-mask-repeat", "no-repeat"],
          ["mask-repeat", "no-repeat"],
          ["-webkit-mask-position", layer.maskPositions ?? "center"],
          ["mask-position", layer.maskPositions ?? "center"],
          ["-webkit-mask-size", layer.maskSizes ?? "100% 100%"],
          ["mask-size", layer.maskSizes ?? "100% 100%"],
        ]);

        return `<div aria-hidden="true" style="${layerStyle}"></div>`;
      }

      const layerStyle = buildStyle([
        ["position", "absolute"],
        ["left", x],
        ["top", y],
        ["width", width],
        ["height", height],
        ["transform", transform],
        ["transform-origin", "center"],
        ["display", "block"],
        ["object-fit", "contain"],
      ]);

      return `<img alt="" src="${asset}" width="${formatNumber(layer.width)}" height="${formatNumber(layer.height)}" style="${layerStyle}" />`;
    })
    .join("");

  return `<div aria-hidden="true" style="${outerStyle}">${children}</div>`;
}

function buildReactMarkupCode(componentName: string, markup: string) {
  return `type IconProps = {
  size?: number;
};

const BASE_SIZE = 32;
const MARKUP = \`${escapeTemplateLiteral(markup)}\`;

export function ${componentName}({ size = 32 }: IconProps) {
  const scale = size / BASE_SIZE;

  return (
    <div style={{ width: size, height: size, overflow: "visible" }}>
      <div
        style={{
          width: BASE_SIZE,
          height: BASE_SIZE,
          transform: \`scale(\${scale})\`,
          transformOrigin: "top left",
        }}
        dangerouslySetInnerHTML={{ __html: MARKUP }}
      />
    </div>
  );
}
`;
}

function escapeDoubleQuoted(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function escapeHtmlAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildReactNativeCode(componentName: string, assetUrl: string) {
  return `import { SvgUri } from "react-native-svg";

type ${componentName}Props = {
  size?: number;
};

const ICON_URL = "${escapeDoubleQuoted(assetUrl)}";

export function ${componentName}({ size = 32 }: ${componentName}Props) {
  return <SvgUri width={size} height={size} uri={ICON_URL} />;
}
`;
}

function buildSwiftCode(componentName: string, assetUrl: string) {
  return `import SwiftUI

struct ${componentName}: View {
    var size: CGFloat = 32

    var body: some View {
        AsyncImage(url: URL(string: "${escapeDoubleQuoted(assetUrl)}")) { image in
            image
                .resizable()
                .scaledToFit()
        } placeholder: {
            Color.clear
        }
        .frame(width: size, height: size)
    }
}
`;
}

function buildHtmlCode(assetUrl: string) {
  return `<img
  src="${escapeHtmlAttr(assetUrl)}"
  width="32"
  height="32"
  alt=""
/>
`;
}

function buildSvgCode(spec: LogoAssetSpec, assetTexts: Record<string, string>) {
  if (spec.layers.length === 1 && !spec.layers[0]?.maskSrcs?.length && !spec.background) {
    return assetTexts[spec.layers[0].src] ?? "<!-- SVG unavailable -->";
  }

  const defs: string[] = [];
  const layerMarkup = spec.layers.map((layer, layerIndex) => {
    const href = buildSvgImageHref(layer.src, assetTexts);
    const rotate = layer.rotation
      ? ` transform="rotate(${formatNumber(layer.rotation)} ${formatNumber(layer.x + layer.width / 2)} ${formatNumber(layer.y + layer.height / 2)})"`
      : "";

    const image = `<image href="${escapeXml(href)}" x="${formatNumber(layer.x)}" y="${formatNumber(
      layer.y
    )}" width="${formatNumber(layer.width)}" height="${formatNumber(
      layer.height
    )}" preserveAspectRatio="xMidYMid meet"${rotate} />`;

    if (!layer.maskSrcs?.length) {
      return image;
    }

    const maskPositions = splitSvgList(layer.maskPositions, "0px 0px", layer.maskSrcs.length);
    const maskSizes = splitSvgList(layer.maskSizes, "100% 100%", layer.maskSrcs.length);
    let maskedMarkup = image;

    layer.maskSrcs.forEach((maskSrc, maskIndex) => {
      const [xToken = "0px", yToken = "0px"] = maskPositions[maskIndex].split(/\s+/);
      const [widthToken = "100%", heightToken = widthToken] = maskSizes[maskIndex].split(/\s+/);
      const maskWidth = parseSvgLength(widthToken, layer.width);
      const maskHeight = parseSvgLength(heightToken, layer.height);
      const maskX = layer.x + parseSvgLength(xToken, layer.width);
      const maskY = layer.y + parseSvgLength(yToken, layer.height);
      const maskId = `mask-${layerIndex}-${maskIndex}`;
      const maskHref = buildSvgImageHref(maskSrc, assetTexts);

      defs.push(
        `<mask id="${maskId}" maskUnits="userSpaceOnUse" x="${formatNumber(maskX)}" y="${formatNumber(
          maskY
        )}" width="${formatNumber(maskWidth)}" height="${formatNumber(
          maskHeight
        )}"><image href="${escapeXml(maskHref)}" x="${formatNumber(maskX)}" y="${formatNumber(
          maskY
        )}" width="${formatNumber(maskWidth)}" height="${formatNumber(
          maskHeight
        )}" preserveAspectRatio="none" /></mask>`
      );

      maskedMarkup = `<g mask="url(#${maskId})">${maskedMarkup}</g>`;
    });

    return maskedMarkup;
  });

  let backgroundMarkup = "";

  if (spec.background) {
    const fill = buildSvgGradientFill(spec.background, defs, "bg-gradient");
    backgroundMarkup = `<rect x="0" y="0" width="32" height="32" rx="${formatNumber(
      spec.radius ?? 0
    )}" fill="${fill}" />`;
  }

  let bodyMarkup = layerMarkup.join("");

  if (spec.radius !== undefined) {
    defs.push(
      `<clipPath id="root-clip"><rect x="0" y="0" width="32" height="32" rx="${formatNumber(
        spec.radius
      )}" /></clipPath>`
    );
    bodyMarkup = `<g clip-path="url(#root-clip)">${backgroundMarkup}${bodyMarkup}</g>`;
  } else {
    bodyMarkup = `${backgroundMarkup}${bodyMarkup}`;
  }

  return `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">${
    defs.length ? `<defs>${defs.join("")}</defs>` : ""
  }${bodyMarkup}</svg>`;
}

function CopyIcon({ copied = false }: { copied?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "relative",
        display: "inline-block",
        width: 16,
        height: 16,
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={copied ? "check" : "copy"}
          initial={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.5, filter: "blur(4px)" }}
          transition={{ type: "spring", duration: 0.32, bounce: 0 }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            willChange: "transform, opacity, filter",
          }}
        >
          <MaskIcon
            src={copied ? "/ui/check.svg" : "/ui/copy.svg"}
            size={copied ? 14 : 16}
            color={copied ? "#28E0B9" : "#ffffff"}
            opacity={1}
          />
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function DoubleChevronLeftIcon() {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 20,
        height: 20,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <ImageIcon
        src="/ui/chevron-big-left.svg"
        size={20}
        alt="Back"
        opacity={1}
      />
    </span>
  );
}

function TsxBadge() {
  return <ImageIcon src="/ui/tsx-badge.svg" size={16} alt="TSX" />;
}

function ExternalLinkCircleIcon() {
  return <MaskIcon src={EXTERNAL_LINK_ICON} size={16} color="#ffffff" opacity={1} />;
}

function CodeTabCap() {
  return (
    <svg
      width="60.3882"
      height="40"
      viewBox="0 0 60.3882 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%", flexShrink: 0 }}
    >
      <path
        d="M0 0H4.07533C12.6726 0 20.6132 4.59863 24.8919 12.0555L32.4568 25.2395C35.6497 30.804 40.9375 34.8585 47.14 36.498L60.3882 40H37.4467H17.9745H0V0Z"
        fill="#0e1014"
      />
    </svg>
  );
}

function PreviewGridSvg() {
  return (
    <svg
      width="240"
      height="240"
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    >
      <path
        d="M60.0448 0.500122H0.500023V60.0449M60.0448 0.500122V60.0449M60.0448 0.500122L119.59 0.5M60.0448 60.0449H0.500023M60.0448 60.0449V119.589M60.0448 60.0449L119.59 60.0448M0.500023 60.0449V119.589M60.0448 119.589H0.500023M60.0448 119.589V179.134M60.0448 119.589H119.59M60.0448 119.589C60.0448 152.475 86.7039 179.134 119.59 179.134M60.0448 119.589C60.0448 86.7037 86.7039 60.0448 119.59 60.0448M0.500023 119.589V179.134M0.500023 119.589C0.500023 185.361 53.8183 238.679 119.59 238.679M0.500023 119.589C0.500023 53.818 53.8183 0.5 119.59 0.5M60.0448 179.134H0.500023M60.0448 179.134V238.679M60.0448 179.134H119.59M0.500023 179.134V238.679H60.0448M60.0448 238.679H119.59M119.59 0.5V60.0448M119.59 0.5H179.134M119.59 0.5C185.361 0.5 238.679 53.818 238.679 119.589M119.59 60.0448V119.589M119.59 60.0448H179.134M119.59 60.0448C152.475 60.0448 179.134 86.7037 179.134 119.589M119.59 119.589V179.134M119.59 119.589H179.134M119.59 179.134V238.679M119.59 179.134H179.134M119.59 179.134C152.475 179.134 179.134 152.475 179.134 119.589M119.59 238.679H179.134M119.59 238.679C185.361 238.679 238.679 185.361 238.679 119.589M179.134 0.5V60.0448M179.134 0.5H238.679V60.0448M179.134 60.0448V119.589M179.134 60.0448H238.679M179.134 119.589V179.134M179.134 119.589H238.679M179.134 179.134V238.679M179.134 179.134H238.679M179.134 238.679H238.679V179.134M238.679 60.0448V119.589M238.679 119.589V179.134"
        stroke="#1F2124"
      />
    </svg>
  );
}

function ContributorAvatar({
  contributor,
  index,
  total,
}: {
  contributor: Contributor;
  index: number;
  total: number;
}) {
  const [hovered, setHovered] = useState(false);
  const hideTimerRef = useRef<number | null>(null);

  const username = contributor.github;
  const displayName = contributor.name ?? username ?? "Contributor";
  const profileUrl = username ? `https://github.com/${username}` : undefined;
  const avatarSrc =
    contributor.avatar ??
    (username ? `https://github.com/${username}.png?size=80` : "");
  const isLast = index === total - 1;
  const baseZ = total - index;
  const hoverZ = total + 10;

  useEffect(() => {
    return () => {
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  const showTooltip = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setHovered(true);
  };
  const scheduleHide = () => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }
    hideTimerRef.current = window.setTimeout(() => {
      setHovered(false);
      hideTimerRef.current = null;
    }, 120);
  };

  const avatarSpan = (
    <span
      style={{
        width: 20,
        height: 20,
        borderRadius: 999,
        overflow: "hidden",
        border: "2px solid #0d0f12",
        background: "#4b4b4b",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform",
      }}
    >
      {avatarSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarSrc}
          alt={displayName}
          width={20}
          height={20}
          style={{
            display: "block",
            width: 20,
            height: 20,
            objectFit: "cover",
          }}
        />
      ) : null}
    </span>
  );

  const tooltipBaseStyle = {
    position: "absolute" as const,
    bottom: "calc(100% + 6px)",
    left: "50%",
    transform: "translateX(-50%)",
    fontSize: 10,
    lineHeight: "12px",
    color: "rgba(255,255,255,0.85)",
    background: "rgba(13,15,18,0.92)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 6,
    padding: "3px 6px",
    whiteSpace: "nowrap" as const,
    textDecoration: "none",
    fontFamily:
      'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif',
    boxShadow: "0 4px 12px rgba(0,0,0,0.32)",
  };

  return (
    <div
      onMouseEnter={showTooltip}
      onMouseLeave={scheduleHide}
      onFocus={showTooltip}
      onBlur={scheduleHide}
      style={{
        position: "relative",
        marginRight: isLast ? 0 : -6,
        zIndex: hovered ? hoverZ : baseZ,
        display: "inline-flex",
      }}
    >
      {profileUrl ? (
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${displayName} on GitHub`}
          style={{ display: "inline-flex", textDecoration: "none" }}
        >
          {avatarSpan}
        </a>
      ) : (
        avatarSpan
      )}
      {hovered ? (
        profileUrl ? (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={showTooltip}
            onMouseLeave={scheduleHide}
            style={tooltipBaseStyle}
          >
            {displayName}
          </a>
        ) : (
          <span
            style={{ ...tooltipBaseStyle, pointerEvents: "none" }}
          >
            {displayName}
          </span>
        )
      ) : null}
    </div>
  );
}

const SPRING_TAP = { type: "spring", stiffness: 400, damping: 14 } as const;

function Toggle({
  buttonRef,
  active,
  onClick,
  children,
}: {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      whileTap={{ scaleX: 0.9, scaleY: 0.95 }}
      transition={SPRING_TAP}
      className="relative z-[1] flex items-center justify-center"
      style={{
        width: 86,
        height: 30,
        borderRadius: 8,
        padding: "0 12px",
        background: "transparent",
        color: active ? "#ffffff" : "rgba(255,255,255,0.4)",
        fontSize: 14,
        fontWeight: 500,
        lineHeight: "19px",
        transition: "color 180ms cubic-bezier(0.16, 1, 0.3, 1)",
        flexShrink: 0,
      }}
    >
      {children}
    </motion.button>
  );
}

function getIconBio(icon: Icon): string[] {
  if (icon.description) return [icon.description];

  switch (icon.category) {
    case "wallets":
      return [
        `${icon.name} is a Solana wallet brand used for signing, sending,`,
        "and managing assets, identities, and everyday app access.",
      ];
    case "defi":
      return [
        `${icon.name} is a Solana DeFi brand used across trading, yield,`,
        "liquidity, lending, and capital-efficient onchain strategies.",
      ];
    case "tokens":
      return [
        `${icon.name} is a token or asset logo used throughout Solana`,
        "wallets, exchanges, dashboards, and asset discovery surfaces.",
      ];
    case "nft":
      return [
        `${icon.name} is a culture, media, or collectible brand within`,
        "the Solana creator ecosystem and community-driven experiences.",
      ];
    case "infrastructure":
    default:
      return [
        `${icon.name} is a Solana infrastructure brand supporting developer`,
        "tooling, data, payments, growth, or ecosystem coordination.",
      ];
  }
}

function HighlightedCode({ lines }: { lines: CodeLine[] }) {
  return (
    <div
      style={{
        display: "inline-block",
        minWidth: "max-content",
        color: CODE_COLORS.default,
        fontFamily:
          'var(--font-geist-mono), ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
        fontSize: 12,
        lineHeight: "18px",
      }}
    >
      {lines.map((line, index) => (
        <div key={index} style={{ whiteSpace: "pre" }}>
          {line.length === 1 && line[0]?.text === "" ? (
            "\u00a0"
          ) : (
            <>
              {line.map((segment, segmentIndex) => (
                <span
                  key={`${index}-${segmentIndex}`}
                  style={{
                    color: segment.color ?? CODE_COLORS.default,
                  }}
                >
                  {segment.text}
                </span>
              ))}
            </>
          )}
        </div>
      ))}
    </div>
  );
}

export function IconDetail({
  icon,
  relatedIcons,
}: {
  icon: Icon;
  relatedIcons: Icon[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playProgressTick = useSound(progressTick);
  const [solidMode, setSolidMode] = useState(() => searchParams.get("mode") === "solid");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copyBurstTick, setCopyBurstTick] = useState(0);
  const [copiedLogo, setCopiedLogo] = useState(false);
  const [activeFramework, setActiveFramework] = useState<FrameworkId>("react");
  const [exactCodeByFramework, setExactCodeByFramework] = useState<CodeByFramework | null>(null);
  const toggleBrandRef = useRef<HTMLButtonElement | null>(null);
  const toggleSolidRef = useRef<HTMLButtonElement | null>(null);
  const frameworkButtonRefs = useRef<Record<FrameworkId, HTMLButtonElement | null>>({
    react: null,
    "react-native": null,
    swift: null,
    html: null,
    svg: null,
  });
  const toggleActiveX = useMotionValue(0);
  const toggleActiveWidth = useMotionValue(0);
  const frameworkActiveX = useMotionValue(0);
  const frameworkActiveWidth = useMotionValue(0);
  const springToggleActiveX = useSpring(toggleActiveX, HOVER_SPRING);
  const springToggleActiveWidth = useSpring(toggleActiveWidth, HOVER_SPRING);
  const springFrameworkActiveX = useSpring(frameworkActiveX, HOVER_SPRING);
  const springFrameworkActiveWidth = useSpring(frameworkActiveWidth, HOVER_SPRING);
  const previewRotateX = useMotionValue(0);
  const previewRotateY = useMotionValue(0);
  const springPreviewRotateX = useSpring(previewRotateX, HOVER_SPRING);
  const springPreviewRotateY = useSpring(previewRotateY, HOVER_SPRING);
  const toggleMountedRef = useRef(false);
  const frameworkMountedRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const [shareTransition, setShareTransition] = useState(() => {
    if (typeof window === "undefined") return false;
    return getPendingIconTransition() === icon.id;
  });
  const componentName = `${toPascalCase(icon.id)}${solidMode ? "Solid" : "Brand"}Icon`;
  const activeSpec = useMemo(
    () =>
      (solidMode ? SOLID_LOGO_ASSETS : BRAND_LOGO_ASSETS)[icon.id as LogoId] ??
      null,
    [icon.id, solidMode]
  );
  const bioLines = useMemo(() => getIconBio(icon), [icon]);
  const displayRelatedIcons = useMemo(() => {
    const byId = new Map(relatedIcons.map((item) => [item.id, item]));
    const explicit = (icon.relatedIds ?? [])
      .map((relatedId) => byId.get(relatedId))
      .filter((item): item is Icon => Boolean(item) && item!.id !== icon.id);
    if (explicit.length >= 3) return explicit.slice(0, 3);
    const fallback = relatedIcons.filter(
      (item) =>
        item.id !== icon.id &&
        item.category === icon.category &&
        !explicit.some((e) => e.id === item.id)
    );
    return [...explicit, ...fallback].slice(0, 3);
  }, [icon, relatedIcons]);

  const handleBack = useCallback(() => {
    playProgressTick();
    const navigateBack = () => {
      if (typeof window !== "undefined") {
        const hasSameOriginReferrer =
          document.referrer !== "" &&
          new URL(document.referrer).origin === window.location.origin;

        if (window.history.length > 1 && hasSameOriginReferrer) {
          router.back();
          return;
        }
      }

      router.push("/dashboard");
    };

    const startVT = getDocumentViewTransition();
    if (startVT) {
      startVT(navigateBack);
    } else {
      navigateBack();
    }
  }, [router, playProgressTick]);
  const currentCode = exactCodeByFramework?.[activeFramework] ?? "// Loading exact code...";
  const codeLines = useMemo(() => toCodeLines(currentCode), [currentCode]);

  useEffect(() => {
    if (!shareTransition) return;

    const timer = window.setTimeout(() => {
      clearPendingIconTransition();
      setShareTransition(false);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [shareTransition]);

  useEffect(() => {
    setActiveFramework("react");
  }, [icon.id]);

  useEffect(() => {
    if (!activeSpec) {
      setExactCodeByFramework(null);
      return;
    }

    let cancelled = false;
    const assetPaths = new Set<string>();

    activeSpec.layers.forEach((layer) => {
      assetPaths.add(layer.src);
      layer.maskSrcs?.forEach((maskSrc) => assetPaths.add(maskSrc));
    });

    Promise.all(
      Array.from(assetPaths).map(async (assetPath) => {
        const response = await fetch(assetPath);
        const text = await response.text();
        return [assetPath, text] as const;
      })
    )
      .then((entries) => {
        if (cancelled) return;
        const assetTexts = Object.fromEntries(entries);
        const markup = buildHtmlMarkup(activeSpec, assetTexts);
        const assetUrl = `https://iconsol.me${icon.src}`;

        setExactCodeByFramework({
          react: buildReactMarkupCode(componentName, markup),
          "react-native": buildReactNativeCode(componentName, assetUrl),
          swift: buildSwiftCode(componentName, assetUrl),
          html: buildHtmlCode(assetUrl),
          svg: buildSvgCode(activeSpec, assetTexts),
        });
      })
      .catch(() => {
        if (cancelled) return;
        setExactCodeByFramework({
          react: "// Exact code unavailable for this logo right now.",
          "react-native": "// Exact code unavailable for this logo right now.",
          swift: "// Exact code unavailable for this logo right now.",
          html: "<!-- Exact code unavailable for this logo right now. -->",
          svg: "<!-- Exact code unavailable for this logo right now. -->",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [activeSpec, componentName, icon.src]);

  useLayoutEffect(() => {
    const activeToggle = solidMode ? toggleSolidRef.current : toggleBrandRef.current;
    if (!activeToggle) return;

    if (!toggleMountedRef.current) {
      toggleActiveX.jump(activeToggle.offsetLeft);
      toggleActiveWidth.jump(activeToggle.offsetWidth);
      springToggleActiveX.jump(activeToggle.offsetLeft);
      springToggleActiveWidth.jump(activeToggle.offsetWidth);
      toggleMountedRef.current = true;
      return;
    }

    toggleActiveX.set(activeToggle.offsetLeft);
    toggleActiveWidth.set(activeToggle.offsetWidth);
  }, [solidMode, springToggleActiveWidth, springToggleActiveX, toggleActiveWidth, toggleActiveX]);

  useLayoutEffect(() => {
    const activeTab = frameworkButtonRefs.current[activeFramework];
    if (!activeTab) return;

    const spanEl = activeTab.querySelector("span") as HTMLElement | null;
    const textWidth = spanEl ? spanEl.offsetWidth : activeTab.offsetWidth - 24;
    const nextX = activeTab.offsetLeft + (activeTab.offsetWidth - textWidth) / 2;

    if (!frameworkMountedRef.current) {
      frameworkActiveX.jump(nextX);
      frameworkActiveWidth.jump(textWidth);
      springFrameworkActiveX.jump(nextX);
      springFrameworkActiveWidth.jump(textWidth);
      frameworkMountedRef.current = true;
      return;
    }

    frameworkActiveX.set(nextX);
    frameworkActiveWidth.set(textWidth);
  }, [
    activeFramework,
    frameworkActiveWidth,
    frameworkActiveX,
    springFrameworkActiveWidth,
    springFrameworkActiveX,
  ]);

  const copyableCode = currentCode;
  const playConfetti = useSound(confetti);
  const playToggleOn = useSound(toggleOn);
  const playToggleOff = useSound(toggleOff);

  const handlePreviewMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      previewRotateX.set((0.5 - y) * 14);
      previewRotateY.set((x - 0.5) * 14);
    },
    [prefersReducedMotion, previewRotateX, previewRotateY]
  );

  const handlePreviewLeave = useCallback(() => {
    previewRotateX.set(0);
    previewRotateY.set(0);
  }, [previewRotateX, previewRotateY]);

  const handleCodeCopy = useCallback(async () => {
    playConfetti();
    setCopyBurstTick((value) => value + 1);
    await navigator.clipboard.writeText(copyableCode);
    setCopiedCode(true);
    window.setTimeout(() => setCopiedCode(false), 1800);
  }, [copyableCode, playConfetti]);

  const handleLogoCopy = useCallback(async () => {
    if (typeof window === "undefined") return;
    const assetUrl = icon.src.startsWith("http")
      ? icon.src
      : `${window.location.origin}${icon.src}`;
    await navigator.clipboard.writeText(assetUrl);
    setCopiedLogo(true);
    window.setTimeout(() => setCopiedLogo(false), 1800);
  }, [icon.src]);

  const handlePngDownload = useCallback(async () => {
    if (typeof window === "undefined") return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.src = icon.src.startsWith("http")
      ? icon.src
      : `${window.location.origin}${icon.src}`;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load icon"));
    });

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || 256;
    canvas.height = img.naturalHeight || 256;
    const context = canvas.getContext("2d");

    if (!context) return;

    context.drawImage(img, 0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${icon.id}.png`;
    link.click();
  }, [icon.id, icon.src]);

  const svgDownloadHref = icon.fileType === "svg" ? icon.src : undefined;
  const previewArtBoxHeight = 136.513;

  return (
    <main className="flex h-full min-h-full flex-col">
      <div
        className="mobile-detail-root flex flex-1"
        style={{
          minHeight: 0,
        }}
      >
        <BlurFade
          delay={0.05}
          duration={0.5}
          yOffset={10}
          className="mobile-detail-left min-w-0"
          style={{
            width: LEFT_PANE_WIDTH,
            flex: `1 1 ${LEFT_PANE_WIDTH}px`,
            height: "100%",
            position: "relative",
          }}
        >
          <section
            className="mobile-detail-left-inner relative h-full overflow-hidden"
            style={{ width: "100%" }}
          >
            <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 0 }}>
              <div
                className="flex items-center"
                style={{
                  width: "100%",
                  height: 80,
                  padding: 24,
                  position: "relative",
                  zIndex: 2,
                  pointerEvents: "none",
                }}
              >
                <button
                  type="button"
                  onClick={handleBack}
                  aria-label="Back to dashboard"
                  className="pressable pressable-soft flex items-center justify-center overflow-hidden"
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    flexShrink: 0,
                    background: "transparent",
                    opacity: UI_ICON_OPACITY,
                    pointerEvents: "auto",
                    transition:
                      "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                  onMouseEnter={(event) => {
                    event.currentTarget.style.opacity = "1";
                    event.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.opacity = `${UI_ICON_OPACITY}`;
                    event.currentTarget.style.background = "transparent";
                  }}
                >
                  <DoubleChevronLeftIcon />
                </button>
              </div>

              <div
                className="mobile-detail-stack-wrapper"
                style={{
                  position: "absolute",
                  inset: "0 0 0 0",
                  overflow: "hidden",
                }}
              >
                <div
                  className="mobile-detail-stack"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: 0,
                    bottom: 0,
                    marginTop: "auto",
                    marginBottom: "auto",
                    height: LEFT_STACK_HEIGHT,
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="mobile-detail-grid-lines"
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 0,
                        width: PREVIEW_GRID_SIZE,
                        height: "100%",
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: 1,
                          height: "100%",
                          background:
                            "linear-gradient(180deg, rgba(31,33,36,0) 0%, rgba(31,33,36,0.72) 18%, rgba(31,33,36,0.72) 82%, rgba(31,33,36,0) 100%)",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          right: 0,
                          top: 0,
                          width: 1,
                          height: "100%",
                          background:
                            "linear-gradient(180deg, rgba(31,33,36,0) 0%, rgba(31,33,36,0.72) 18%, rgba(31,33,36,0.72) 82%, rgba(31,33,36,0) 100%)",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        top: PREVIEW_GRID_TOP_IN_STACK,
                        width: "100%",
                        height: PREVIEW_GRID_SIZE,
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          top: 0,
                          width: "100%",
                          height: 1,
                          background: `linear-gradient(90deg, rgba(31,33,36,0) 0%, ${GRID_STROKE_COLOR} 28%, ${GRID_STROKE_COLOR} 72%, rgba(31,33,36,0) 100%)`,
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: 0,
                          bottom: 0,
                          width: "100%",
                          height: 1,
                          background: `linear-gradient(90deg, rgba(31,33,36,0) 0%, ${GRID_STROKE_COLOR} 28%, ${GRID_STROKE_COLOR} 72%, rgba(31,33,36,0) 100%)`,
                        }}
                      />
                    </div>
                  </div>

                  <div
                    className="mobile-detail-stack-inner"
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      marginLeft: "auto",
                      marginRight: "auto",
                      width: LEFT_STACK_WIDTH,
                      height: LEFT_STACK_HEIGHT,
                      display: "flex",
                      flexDirection: "column",
                      gap: PREVIEW_STACK_GAP,
                      alignItems: "center",
                    }}
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: LEFT_STACK_WIDTH,
                        height: 45,
                        borderRadius: 8,
                        padding: "0 8px",
                      }}
                    >
                      <div
                        className="relative flex items-center frost-dither"
                        style={{
                          width: TOGGLE_INNER_WIDTH,
                          borderRadius: 10,
                          background: "rgba(255,255,255,0.02)",
                          backdropFilter: "blur(2px)",
                          WebkitBackdropFilter: "blur(2px)",
                          padding: 2,
                        }}
                      >
                        <motion.div
                          aria-hidden="true"
                          className="pointer-events-none absolute"
                          style={{
                            left: 0,
                            top: 2,
                            bottom: 2,
                            borderRadius: 8,
                            background: "rgba(255,255,255,0.05)",
                            x: springToggleActiveX,
                            width: springToggleActiveWidth,
                          }}
                        />
                        <Toggle
                          buttonRef={toggleBrandRef}
                          active={!solidMode}
                          onClick={() => {
                            playToggleOff();
                            setSolidMode(false);
                          }}
                        >
                          Brand
                        </Toggle>
                        <Toggle
                          buttonRef={toggleSolidRef}
                          active={solidMode}
                          onClick={() => {
                            playToggleOn();
                            setSolidMode(true);
                          }}
                        >
                          Solid
                        </Toggle>
                      </div>
                    </div>

                    <motion.div
                      className="mobile-detail-preview relative flex items-center justify-center overflow-hidden frost-dither"
                      data-icon-frame=""
                      onMouseMove={handlePreviewMove}
                      onMouseLeave={handlePreviewLeave}
                      style={{
                        width: PREVIEW_CARD_SIZE,
                        height: PREVIEW_CARD_SIZE,
                        borderRadius: PREVIEW_CARD_RADIUS,
                        border: "1px solid #1F2124",
                        background: PREVIEW_FRAME_BG,
                        boxSizing: "border-box",
                        boxShadow: "0 0 0 2px #0d0f12",
                        rotateX: springPreviewRotateX,
                        rotateY: springPreviewRotateY,
                        transformPerspective: 1200,
                        transformStyle: "preserve-3d",
                        viewTransitionName: shareTransition
                          ? ICON_FRAME_TRANSITION_NAME
                          : "none",
                      }}
                    >
                      <div
                        className="absolute left-1/2 top-1/2 flex items-center justify-center"
                        data-icon-art=""
                        style={{
                          width: PREVIEW_ART_WIDTH,
                          height: previewArtBoxHeight,
                          transform: "translate(-50%, -50%)",
                          zIndex: 2,
                          viewTransitionName: shareTransition
                            ? ICON_ART_TRANSITION_NAME
                            : "none",
                        }}
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.div
                            key={`${icon.id}-${solidMode ? "solid" : "brand"}`}
                            initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                            transition={{
                              type: "spring",
                              duration: 0.3,
                              bounce: 0,
                            }}
                            className="flex items-center justify-center"
                            style={{
                              width: "100%",
                              height: "100%",
                              willChange: "transform, opacity, filter",
                            }}
                          >
                            {solidMode ? (
                              <SolidLogo id={icon.id} size={112} />
                            ) : (
                              <BrandLogo
                                id={icon.id}
                                variant="detail"
                                size={PREVIEW_ART_WIDTH}
                              />
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.div>

                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: LEFT_STACK_WIDTH,
                        height: 48,
                        padding: "0 8px",
                        gap: 12,
                      }}
                    >
                      <motion.button
                        type="button"
                        onClick={handleLogoCopy}
                        whileTap={{ scaleX: 0.92, scaleY: 0.96 }}
                        transition={SPRING_TAP}
                        className="flex items-center justify-center frost-dither"
                        style={{
                          width: 110,
                          flexShrink: 0,
                          borderRadius: 50,
                          background: "rgba(255,255,255,0.03)",
                          backdropFilter: "blur(2px)",
                          WebkitBackdropFilter: "blur(2px)",
                          padding: 12,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            lineHeight: "19px",
                            color: "rgba(255,255,255,0.6)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {copiedLogo ? "Copied" : "Copy Logo"}
                        </span>
                      </motion.button>

                      <div
                        className="flex items-center"
                        style={{
                          height: 48,
                          padding: 0,
                          gap: 8,
                        }}
                      >
                        <a
                          href={svgDownloadHref}
                          download={svgDownloadHref ? `${icon.id}.svg` : undefined}
                          aria-label={`Download ${icon.name} SVG`}
                          className="pressable pressable-soft flex items-center justify-center"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            opacity: svgDownloadHref ? UI_ICON_OPACITY : 0.3,
                            pointerEvents: svgDownloadHref ? "auto" : "none",
                            padding: 4,
                            transition:
                              "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                          onMouseEnter={(event) => {
                            if (svgDownloadHref) {
                              event.currentTarget.style.opacity = "1";
                              event.currentTarget.style.background = "rgba(255,255,255,0.05)";
                            }
                          }}
                          onMouseLeave={(event) => {
                            if (svgDownloadHref) {
                              event.currentTarget.style.opacity = `${UI_ICON_OPACITY}`;
                            }
                            event.currentTarget.style.background = "transparent";
                          }}
                        >
                          <MaskIcon src={SVG_FILE_ICON} size={20} color="#ffffff" opacity={1} />
                        </a>

                        <button
                          type="button"
                          onClick={handlePngDownload}
                          aria-label={`Download ${icon.name} PNG`}
                          className="pressable pressable-soft flex items-center justify-center"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 8,
                            background: "transparent",
                            padding: 4,
                            opacity: UI_ICON_OPACITY,
                            transition:
                              "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.opacity = "1";
                            event.currentTarget.style.background = "rgba(255,255,255,0.05)";
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.opacity = `${UI_ICON_OPACITY}`;
                            event.currentTarget.style.background = "transparent";
                          }}
                        >
                          <MaskIcon src={PNG_FILE_ICON} size={20} color="#ffffff" opacity={1} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </BlurFade>

        <BlurFade
          delay={0.12}
          duration={0.5}
          yOffset={10}
          className="mobile-detail-right min-w-0"
          style={{
            width: RIGHT_PANE_WIDTH,
            flex: `1 1 ${RIGHT_PANE_WIDTH}px`,
            height: "100%",
            paddingTop: 24,
            paddingRight: 24,
            paddingBottom: 24,
            paddingLeft: 12,
            overflow: "hidden",
          }}
        >
          <section className="h-full overflow-hidden" style={{ width: "100%" }}>
            <div
              style={{
                maxWidth: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 42,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 42,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <p
                      style={{
                        fontSize: 20,
                        lineHeight: "normal",
                        color: "#fff",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {icon.name}
                    </p>
                    {icon.website ? (
                      <a
                        href={icon.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${icon.name} website`}
                        className="pressable pressable-soft"
                        style={{
                          display: "inline-flex",
                          opacity: UI_ICON_OPACITY,
                          transition:
                            "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                        onMouseEnter={(event) => {
                          event.currentTarget.style.opacity = "1";
                        }}
                        onMouseLeave={(event) => {
                          event.currentTarget.style.opacity = `${UI_ICON_OPACITY}`;
                        }}
                      >
                        <span
                          className="flex items-center justify-center"
                          style={{ width: 32, height: 32, borderRadius: 8 }}
                        >
                          <ExternalLinkCircleIcon />
                        </span>
                      </a>
                    ) : (
                      <span
                        className="flex items-center justify-center"
                        style={{ width: 32, height: 32, borderRadius: 8, opacity: UI_ICON_OPACITY }}
                      >
                        <ExternalLinkCircleIcon />
                      </span>
                    )}
                  </div>

                  <div style={{ width: 458.806, maxWidth: "100%", display: "grid", gap: 2 }}>
                    {bioLines.map((line) => (
                      <p
                        key={line}
                        style={{
                          fontSize: 14,
                          lineHeight: 1.4,
                          color: "rgba(255,255,255,0.4)",
                          textWrap: "balance",
                        }}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex items-center" style={{ gap: 12, width: "100%" }}>
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: "21px",
                      color: "#fff",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Contributors:
                  </p>
                  <div className="flex items-center" style={{ paddingRight: 6 }}>
                    {(icon.contributors ?? DEFAULT_CONTRIBUTORS).map(
                      (contributor, index, all) => (
                        <ContributorAvatar
                          key={`${contributor.github ?? contributor.name ?? "anon"}-${index}`}
                          contributor={contributor}
                          index={index}
                          total={all.length}
                        />
                      )
                    )}
                  </div>
                </div>
              </div>

              <div
                className="flex min-w-0 flex-col"
                style={{ flex: 1, minHeight: 0, gap: 24 }}
              >
                <div className="relative flex items-center" style={{ width: 420, height: 43 }}>
                  {FRAMEWORKS.map((framework) => {
                    const isActive = framework.id === activeFramework;
                    const tabSpec = FRAMEWORK_TAB_SPECS.find((item) => item.id === framework.id)!;
                    return (
                      <motion.button
                        key={framework.id}
                        ref={(node) => {
                          frameworkButtonRefs.current[framework.id] = node;
                        }}
                        type="button"
                        onClick={() => setActiveFramework(framework.id)}
                        whileTap={{ scaleX: 0.92, scaleY: 0.95 }}
                        transition={SPRING_TAP}
                        className="relative z-[1] flex items-center justify-center overflow-hidden"
                        style={{
                          width: tabSpec.width,
                          height: 43,
                          padding: "0 12px",
                          borderTopLeftRadius: 24,
                          borderTopRightRadius: 24,
                          background: "transparent",
                          transition: "color 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              lineHeight: "normal",
                              color: isActive
                                ? "#ffffff"
                                : "rgba(255,255,255,0.5)",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {framework.label}
                          </span>
                      </motion.button>
                      );
                  })}
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-0"
                    style={{
                      left: 0,
                      height: 2,
                      background: "#ffffff",
                      x: springFrameworkActiveX,
                      width: springFrameworkActiveWidth,
                    }}
                  />
                </div>

                <div className="relative flex min-h-0 flex-1 flex-col">
                  {/*
                    Copy button lives as a sibling of the rounded/clipped panel
                    (not inside it). `overflow: hidden` + `border-radius` on an
                    ancestor is a Chromium/WebKit bug that silently disables
                    `backdrop-filter` on descendants — so we lift the button out.
                  */}
                  <div
                    className="relative flex min-h-0 flex-1 flex-col frost-dither"
                    style={{
                      background:
                        PANEL_FADE_BG,
                      backdropFilter: "blur(2px)",
                      WebkitBackdropFilter: "blur(2px)",
                      borderWidth: "0 2px 2px 2px",
                      borderStyle: "solid",
                      borderColor: "rgba(255,255,255,0.02)",
                      borderRadius: 20,
                      overflow: "hidden",
                    }}
                  >
                    <div className="relative flex min-h-0 flex-1 items-stretch">
                      <div
                        className="h-full w-full overflow-auto"
                        style={{
                          padding: "24px 24px 32px",
                        }}
                      >
                        <AnimatePresence mode="popLayout" initial={false}>
                          <motion.div
                            key={activeFramework}
                            initial={{ opacity: 0, scale: 0.985 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.985 }}
                            transition={{ type: "spring", duration: 0.28, bounce: 0 }}
                            style={{
                              width: "100%",
                              height: "100%",
                              willChange: "transform, opacity",
                            }}
                          >
                            <HighlightedCode lines={codeLines} />
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                    <CopyBurstOverlay trigger={copyBurstTick} />
                  </div>

                  <button
                    type="button"
                    onClick={handleCodeCopy}
                    aria-label="Copy code"
                    className="pressable pressable-soft absolute"
                    style={{
                      right: 8,
                      top: 8,
                      zIndex: 2,
                      width: 36,
                      height: 36,
                      padding: 8,
                      borderRadius: 8,
                      background: copiedCode ? "rgba(40,224,185,0.05)" : "rgba(255,255,255,0.05)",
                      backdropFilter: "blur(40px)",
                      WebkitBackdropFilter: "blur(40px)",
                      opacity: copiedCode ? 1 : UI_ICON_OPACITY,
                      transition:
                        "opacity 180ms cubic-bezier(0.16, 1, 0.3, 1), background 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.opacity = copiedCode ? "1" : `${UI_ICON_OPACITY}`;
                    }}
                  >
                    <span
                      className="absolute"
                      style={{
                        left: "50%",
                        top: "50%",
                        width: 16,
                        height: 16,
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <CopyIcon copied={copiedCode} />
                    </span>
                  </button>
                </div>

                <div
                  className="flex items-center justify-between frost-dither"
                  style={{
                    height: RELATED_ROW_HEIGHT,
                    borderRadius: 20,
                    background:
                      PANEL_FADE_BG,
                    backdropFilter: "blur(2px)",
                    WebkitBackdropFilter: "blur(2px)",
                    border: "2px solid rgba(255,255,255,0.02)",
                    padding: "12px 12px 12px 24px",
                    flexShrink: 0,
                  }}
                >
                  <p
                    style={{
                      fontSize: 14,
                      lineHeight: "19px",
                      color: "rgba(255,255,255,0.6)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Commonly used with
                  </p>

                  <div
                    className="flex items-center"
                    style={{ gap: 24, width: 192, height: 48 }}
                  >
                    {displayRelatedIcons.map((relatedIcon) => (
                      <Link
                        key={relatedIcon.id}
                        href={`/icon/${relatedIcon.id}`}
                        aria-label={`Open ${relatedIcon.name}`}
                        className="pressable pressable-soft flex items-center justify-center"
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          flexShrink: 0,
                        }}
                        onClick={(e) => {
                          if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
                          const startVT = getDocumentViewTransition();
                          if (startVT) {
                            e.preventDefault();
                            startVT(() => router.push(`/icon/${relatedIcon.id}`));
                          }
                        }}
                      >
                        <SolidLogo id={relatedIcon.id} size={24} />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </BlurFade>
      </div>
    </main>
  );
}

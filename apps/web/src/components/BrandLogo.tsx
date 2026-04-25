"use client";

import type { CSSProperties } from "react";
import {
  BRAND_LOGO_ASSETS,
  SOLID_LOGO_ASSETS,
  getBalancedLogoScale,
  type LogoId,
  type LogoAssetLayer,
  type LogoAssetSpec,
} from "@/lib/logo-assets";

const BASE_SIZE = 32;

function scale(value: number, size: number) {
  return (value / BASE_SIZE) * size;
}

function AssetLayer({
  layer,
  size,
  alt,
}: {
  layer: LogoAssetLayer;
  size: number;
  alt: string;
}) {
  const maskImage = layer.maskSrcs?.map((src) => `url(${src})`).join(", ");
  const layerStyle: CSSProperties & Record<string, string | number | undefined> = {
    position: "absolute",
    left: scale(layer.x, size),
    top: scale(layer.y, size),
    width: scale(layer.width, size),
    height: scale(layer.height, size),
    transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
    transformOrigin: "center",
  };

  if (maskImage) {
    layerStyle.backgroundImage = `url(${layer.src})`;
    layerStyle.backgroundRepeat = "no-repeat";
    layerStyle.backgroundPosition = "center";
    layerStyle.backgroundSize = "contain";
    layerStyle.maskImage = maskImage;
    layerStyle.WebkitMaskImage = maskImage;
    layerStyle.maskRepeat = "no-repeat";
    layerStyle.WebkitMaskRepeat = "no-repeat";
    layerStyle.maskPosition = layer.maskPositions ?? "center";
    layerStyle.WebkitMaskPosition = layer.maskPositions ?? "center";
    layerStyle.maskSize = layer.maskSizes ?? "100% 100%";
    layerStyle.WebkitMaskSize = layer.maskSizes ?? "100% 100%";

    return <div aria-hidden="true" style={layerStyle} />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={layer.src}
      alt={alt}
      width={scale(layer.width, size)}
      height={scale(layer.height, size)}
      style={{
        ...layerStyle,
        display: "block",
        objectFit: "contain",
      }}
    />
  );
}

function LogoSurface({
  spec,
  size,
  alt,
}: {
  spec: LogoAssetSpec;
  size: number;
  alt: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: scale(spec.radius ?? 0, size),
        background: spec.background,
        overflow: spec.background || spec.radius ? "hidden" : "visible",
      }}
    >
      {spec.layers.map((layer, index) => (
        <AssetLayer key={`${alt}-${index}`} layer={layer} size={size} alt={alt} />
      ))}
    </div>
  );
}

export function BrandLogo({
  id,
  variant = "card",
  size,
  fit = "native",
}: {
  id: string;
  variant?: "card" | "detail";
  size?: number;
  fit?: "native" | "balanced";
}) {
  const spec = BRAND_LOGO_ASSETS[id as LogoId];

  if (!spec) {
    return null;
  }

  const resolvedSize = size ?? (variant === "detail" ? 136.513 : 42.038);
  const scaleFactor = fit === "balanced" ? getBalancedLogoScale(id, "brand") : 1;
  const renderedSize = resolvedSize * scaleFactor;

  return (
    <div
      aria-hidden="true"
      style={{
        width: resolvedSize,
        height: resolvedSize,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      <LogoSurface spec={spec} size={renderedSize} alt={id} />
    </div>
  );
}

export function SolidLogo({
  id,
  size = 32,
  fit = "native",
}: {
  id: string;
  size?: number;
  fit?: "native" | "balanced";
}) {
  const spec = SOLID_LOGO_ASSETS[id as LogoId];

  if (!spec) {
    return null;
  }

  const scaleFactor = fit === "balanced" ? getBalancedLogoScale(id, "solid") : 1;
  const renderedSize = size * scaleFactor;

  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible",
      }}
    >
      <LogoSurface spec={spec} size={renderedSize} alt={`${id} solid`} />
    </div>
  );
}

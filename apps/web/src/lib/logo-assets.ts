/**
 * Public surface for logo assets and the BrandLogo / SolidLogo runtime.
 *
 * Data lives in icons/<id>/icon.json and is compiled to icons.generated.ts
 * by `pnpm icons:build`. This file only re-exports that data and adds the
 * geometry helpers used at render time.
 */

export {
  BRAND_LOGO_ASSETS,
  SOLID_LOGO_ASSETS,
  LOGO_ORDER,
  type LogoId,
  type LogoAssetLayer,
  type LogoAssetSpec,
  type LogoVariant,
} from "./icons.generated";

import {
  BRAND_LOGO_ASSETS,
  SOLID_LOGO_ASSETS,
  type LogoAssetSpec,
  type LogoVariant,
} from "./icons.generated";

const BASE_SIZE = 32;
const BALANCED_LOGO_TARGET = 30;
const MAX_BALANCED_LOGO_SCALE = 1.24;

export function getLogoAssetSpec(
  id: string,
  variant: LogoVariant
): LogoAssetSpec | null {
  const map = variant === "brand" ? BRAND_LOGO_ASSETS : SOLID_LOGO_ASSETS;
  return id in map ? map[id as keyof typeof map] : null;
}

function getLogoSpecBounds(spec: LogoAssetSpec) {
  if (spec.background || spec.layers.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: BASE_SIZE,
      maxY: BASE_SIZE,
      width: BASE_SIZE,
      height: BASE_SIZE,
    };
  }

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const layer of spec.layers) {
    minX = Math.min(minX, layer.x);
    minY = Math.min(minY, layer.y);
    maxX = Math.max(maxX, layer.x + layer.width);
    maxY = Math.max(maxY, layer.y + layer.height);
  }

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(0, maxX - minX),
    height: Math.max(0, maxY - minY),
  };
}

function logoSpecHasIntrinsicSurface(spec: LogoAssetSpec) {
  if (spec.background) return true;
  const b = getLogoSpecBounds(spec);
  return b.minX <= 0 && b.minY <= 0 && b.maxX >= BASE_SIZE && b.maxY >= BASE_SIZE;
}

export function logoVariantHasIntrinsicSurface(
  id: string,
  variant: LogoVariant
) {
  const spec = getLogoAssetSpec(id, variant);
  if (!spec) return false;
  return logoSpecHasIntrinsicSurface(spec);
}

export function getBalancedLogoScale(id: string, variant: LogoVariant) {
  const spec = getLogoAssetSpec(id, variant);
  if (!spec || logoSpecHasIntrinsicSurface(spec)) return 1;

  const b = getLogoSpecBounds(spec);
  const maxDim = Math.max(b.width, b.height);
  if (maxDim <= 0) return 1;

  return Math.min(
    MAX_BALANCED_LOGO_SCALE,
    Math.max(1, BALANCED_LOGO_TARGET / maxDim)
  );
}

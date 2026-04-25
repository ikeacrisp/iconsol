"use client";

interface MaskIconProps {
  src: string;
  size?: number;
  width?: number;
  height?: number;
  color: string;
  opacity?: number;
}

export function MaskIcon({
  src,
  size,
  width,
  height,
  color,
  opacity = 1,
}: MaskIconProps) {
  const resolvedWidth = width ?? size ?? 0;
  const resolvedHeight = height ?? size ?? resolvedWidth;

  return (
    <span
      aria-hidden="true"
      style={{
        display: "block",
        width: resolvedWidth,
        height: resolvedHeight,
        backgroundColor: color,
        opacity,
        WebkitMaskImage: `url(${src})`,
        maskImage: `url(${src})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export function ImageIcon({
  src,
  size,
  width,
  height,
  alt,
  opacity = 1,
}: {
  src: string;
  size?: number;
  width?: number;
  height?: number;
  alt: string;
  opacity?: number;
}) {
  const resolvedWidth = width ?? size ?? 0;
  const resolvedHeight = height ?? size ?? resolvedWidth;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={resolvedWidth}
      height={resolvedHeight}
      style={{
        display: "block",
        width: resolvedWidth,
        height: resolvedHeight,
        objectFit: "contain",
        opacity,
      }}
    />
  );
}

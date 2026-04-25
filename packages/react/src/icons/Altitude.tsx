import type { SVGProps } from "react";

export interface AltitudeProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Altitude({
  size = 24,
  ...props
}: AltitudeProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="var(--fill-0, #1A1A1A)" rx={8} />
    <path
      fill="var(--fill-0, white)"
      d="M25.995 24.692h-5.33L14 8.888 7.9 23.354h4.867l.567 1.338h-7.33l7.33-17.384h5.33z"
    />
  </svg>
);
}

export default Altitude;

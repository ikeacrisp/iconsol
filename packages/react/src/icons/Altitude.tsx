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
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#fff" fillOpacity={0.05} rx={8} />
    <path
      fill="#fff"
      d="M25.995 24.692h-5.33L14 8.889 7.9 23.355h4.867l.566 1.337h-7.33l7.33-17.383h5.331z"
    />
  </svg>
);
}

export default Altitude;

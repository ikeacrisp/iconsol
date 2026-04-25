import type { SVGProps } from "react";

export interface DriftProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Drift({
  size = 24,
  ...props
}: DriftProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#1B1B2E" rx={8} />
    <path
      stroke="#9380FF"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="m8 22 8-12 8 12"
    />
    <path
      stroke="#9380FF"
      strokeLinecap="round"
      strokeWidth={2.5}
      d="M10 22h12"
    />
  </svg>
);
}

export default Drift;

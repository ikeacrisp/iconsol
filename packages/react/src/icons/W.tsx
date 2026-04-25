import type { SVGProps } from "react";

export interface WProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function W({
  size = 24,
  ...props
}: WProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <circle cx={16} cy={16} r={16} fill="#0F0C1E" />
    <path
      stroke="#5AA8F8"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="m8 11 3 10 3-7 2 7 3-10 3 10"
    />
  </svg>
);
}

export default W;

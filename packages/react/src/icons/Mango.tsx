import type { SVGProps } from "react";

export interface MangoProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Mango({
  size = 24,
  ...props
}: MangoProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <circle cx={16} cy={16} r={16} fill="#F2A93B" />
    <path
      fill="#1A1A1A"
      d="M16 8c-4 0-7 3-7 7 0 3 2 5.5 5 6.5l2 1.5 2-1.5c3-1 5-3.5 5-6.5 0-4-3-7-7-7"
    />
    <path stroke="#4CAF50" strokeLinecap="round" strokeWidth={2} d="M16 8v3" />
  </svg>
);
}

export default Mango;

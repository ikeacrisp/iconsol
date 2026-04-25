import type { SVGProps } from "react";

export interface LifinityProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Lifinity({
  size = 24,
  ...props
}: LifinityProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#0D1117" rx={8} />
    <path
      stroke="#FF6B6B"
      strokeWidth={2}
      d="M16 8a8 8 0 1 1 0 16 8 8 0 0 1 0-16z"
    />
    <path fill="#FF6B6B" d="M16 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8" opacity={0.7} />
  </svg>
);
}

export default Lifinity;

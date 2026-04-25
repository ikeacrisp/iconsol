import type { SVGProps } from "react";

export interface PythProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Pyth({
  size = 24,
  ...props
}: PythProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <circle cx={16} cy={16} r={16} fill="#1A0A2E" />
    <circle cx={16} cy={14} r={5} fill="#E6DAFE" />
    <rect width={5} height={7} x={13.5} y={18} fill="#E6DAFE" rx={2.5} />
  </svg>
);
}

export default Pyth;

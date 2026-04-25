import type { SVGProps } from "react";

export interface SolendProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Solend({
  size = 24,
  ...props
}: SolendProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#1D2B44" rx={16} />
    <path
      stroke="#6DBFFF"
      strokeLinecap="round"
      strokeWidth={2.5}
      d="M10 18a6 6 0 0 1 12 0"
    />
    <circle cx={16} cy={18} r={3} fill="#6DBFFF" />
  </svg>
);
}

export default Solend;

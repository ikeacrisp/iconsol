import type { SVGProps } from "react";

export interface SolflareProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Solflare({
  size = 24,
  ...props
}: SolflareProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#FC7227" rx={8} />
    <path fill="#fff" d="m16 7 2.5 6H25l-5 4 2 7-6-4-6 4 2-7-5-4h6.5z" />
  </svg>
);
}

export default Solflare;

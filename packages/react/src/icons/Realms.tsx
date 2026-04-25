import type { SVGProps } from "react";

export interface RealmsProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Realms({
  size = 24,
  ...props
}: RealmsProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#121212" rx={8} />
    <path stroke="#fff" strokeWidth={1.5} d="m16 8 8 4v8l-8 4-8-4v-8z" />
    <circle cx={16} cy={16} r={3} fill="#fff" />
  </svg>
);
}

export default Realms;

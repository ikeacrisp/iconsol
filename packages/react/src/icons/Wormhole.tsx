import type { SVGProps } from "react";

export interface WormholeProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Wormhole({
  size = 24,
  ...props
}: WormholeProps) {
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
    <circle cx={16} cy={16} r={8} stroke="#5AA8F8" strokeWidth={2} />
    <circle cx={16} cy={16} r={4} fill="#5AA8F8" />
    <circle cx={16} cy={8} r={1.5} fill="#5AA8F8" />
    <circle cx={16} cy={24} r={1.5} fill="#5AA8F8" />
    <circle cx={8} cy={16} r={1.5} fill="#5AA8F8" />
    <circle cx={24} cy={16} r={1.5} fill="#5AA8F8" />
  </svg>
);
}

export default Wormhole;

import type { SVGProps } from "react";

export interface PenguProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Pengu({
  size = 24,
  ...props
}: PenguProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <circle cx={16} cy={16} r={16} fill="#3D85C8" />
    <ellipse cx={16} cy={17} fill="#000" rx={7} ry={9} />
    <ellipse cx={16} cy={17} fill="#fff" rx={4} ry={6} />
    <circle cx={14} cy={14} r={1.5} fill="#000" />
    <circle cx={18} cy={14} r={1.5} fill="#000" />
    <ellipse cx={16} cy={20} fill="#FF6B2B" rx={2} ry={1} />
  </svg>
);
}

export default Pengu;

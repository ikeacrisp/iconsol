import type { SVGProps } from "react";

export interface HntProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Hnt({
  size = 24,
  ...props
}: HntProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <circle cx={16} cy={16} r={16} fill="#474DFF" />
    <path fill="#fff" d="M10 10h3v5.5h6V10h3v12h-3v-4.5h-6V22h-3z" />
  </svg>
);
}

export default Hnt;

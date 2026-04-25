import type { SVGProps } from "react";

export interface MayanProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Mayan({
  size = 24,
  ...props
}: MayanProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#0D1B2A" rx={8} />
    <path fill="#00BCD4" d="m16 8 7 14H9z" />
    <path fill="#0D1B2A" d="m16 13 4 9h-8z" />
  </svg>
);
}

export default Mayan;

import type { SVGProps } from "react";

export interface PhoenixProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Phoenix({
  size = 24,
  ...props
}: PhoenixProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#1A0A0A" rx={8} />
    <path
      fill="#FF4500"
      d="M16 7c-3 4-7 4-7 9 0 4 3.5 7 7 7s7-3 7-7c0-5-4-5-7-9"
      opacity={0.9}
    />
    <path
      fill="gold"
      d="M16 12c-1 2-3 2-3 4.5 0 1.7 1.3 3 3 3s3-1.3 3-3c0-2.5-2-2.5-3-4.5"
    />
  </svg>
);
}

export default Phoenix;

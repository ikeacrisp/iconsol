import type { SVGProps } from "react";

export interface MoonpayProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Moonpay({
  size = 24,
  ...props
}: MoonpayProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="var(--fill-0, #7E00FE)" rx={8} />
    <g fill="var(--fill-0, white)">
      <path d="M13.33 12.057a5.988 5.988 0 1 1 1.321 11.904 5.988 5.988 0 0 1-1.32-11.904M21.145 8.035a2.452 2.452 0 1 1 .802 4.839 2.452 2.452 0 0 1-.802-4.839" />
    </g>
  </svg>
);
}

export default Moonpay;

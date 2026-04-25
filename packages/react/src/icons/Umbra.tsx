import type { SVGProps } from "react";

export interface UmbraProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Umbra({
  size = 24,
  ...props
}: UmbraProps) {
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
    <rect width={32} height={32} fill="url(#a)" rx={8} />
    <path
      fill="var(--fill-0, white)"
      fillRule="evenodd"
      d="M15.384 8a4.905 4.905 0 0 1 4.578 3.145 3.857 3.857 0 0 1 3.292 6.968 3.871 3.871 0 0 1-6.07 4.455 3.873 3.873 0 0 1-6.805-1.698 4.216 4.216 0 0 1 .118-8.377A4.904 4.904 0 0 1 15.384 8m-1.016 6.023c-.559 0-1.011.453-1.011 1.011v1.931a1.011 1.011 0 1 0 2.022 0v-1.93c0-.56-.452-1.012-1.011-1.012m3.402 0c-.558 0-1.011.453-1.011 1.011v1.931a1.011 1.011 0 1 0 2.023 0v-1.93c0-.56-.453-1.012-1.012-1.012"
      clipRule="evenodd"
    />
    <defs>
      <linearGradient
        id="a"
        x1={16}
        x2={16}
        y1={0}
        y2={32}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#216FE9" />
        <stop offset={1} stopColor="#4CCBF6" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Umbra;

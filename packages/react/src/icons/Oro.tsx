import type { SVGProps } from "react";

export interface OroProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Oro({
  size = 24,
  ...props
}: OroProps) {
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
      fill="var(--fill-0, #B0A66C)"
      d="M22.45 12.709h-2.284l-1.476 6.708h-2.312L14.93 26H8.074l1.476-6.709h2.312l1.447-6.583h2.285L17.07 6h6.856z"
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
        <stop stopColor="#152814" />
        <stop offset={1} stopColor="#0E1C0D" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Oro;

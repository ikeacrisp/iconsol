import type { SVGProps } from "react";

export interface SanctumProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Sanctum({
  size = 24,
  ...props
}: SanctumProps) {
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
    <rect width={32} height={32} fill="var(--fill-0, #6DC4FE)" rx={8} />
    <path
      fill="var(--fill-0, white)"
      fillRule="evenodd"
      d="M11.759 24.002h-.009a6.402 6.402 0 0 1-1.37-12.656 8.003 8.003 0 0 1 14.469 3.816 4.997 4.997 0 0 1-3.193 8.84h-9.897m3.45-9.522a1.374 1.374 0 1 0 0-2.748 1.374 1.374 0 0 0 0 2.748m5.495 0a1.374 1.374 0 1 0 0-2.748 1.374 1.374 0 0 0 0 2.748m-.246 1.244c.522-.073.962-.135 1.227-.135.65 0 1.177.527 1.177 1.177a4.906 4.906 0 0 1-9.812 0c0-.65.527-1.177 1.177-1.177.265 0 .706.062 1.227.135.758.107 1.688.238 2.502.238s1.744-.131 2.502-.238m-2.502 4.967c1.075 0 2.05-.432 2.758-1.133a.627.627 0 0 0-.195-1.02c-.688-.297-1.583-.477-2.563-.477s-1.876.18-2.564.477a.627.627 0 0 0-.194 1.02 3.9 3.9 0 0 0 2.758 1.133"
      clipRule="evenodd"
    />
  </svg>
);
}

export default Sanctum;

import type { SVGProps } from "react";

export interface HeliusProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Helius({
  size = 24,
  ...props
}: HeliusProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#fff" fillOpacity={0.05} rx={8} />
    <path
      fill="url(#a)"
      fillRule="evenodd"
      d="M16.003 24.219c.962 0 1.742.788 1.742 1.758H14.26c0-.97.78-1.758 1.743-1.758m-4.96-3.728a6.49 6.49 0 0 0 4.862 2.308l-4.123 2.837a.237.237 0 0 1-.37-.18zm9.536 4.959a.237.237 0 0 1-.37.18l-4.115-2.831a6.48 6.48 0 0 0 4.851-2.288zm1.794-4.11c.6-.76 1.696-.885 2.45-.279l-2.174 2.75a1.77 1.77 0 0 1-.276-2.471M7.428 21.06a1.733 1.733 0 0 1 2.449.279c.6.759.477 1.865-.275 2.47zm2.142-5.92a6.591 6.591 0 0 0 1.3 5.14l-4.703-1.465a.24.24 0 0 1-.09-.404zm16.354 3.254a.24.24 0 0 1-.091.404l-4.683 1.458a6.6 6.6 0 0 0 1.372-4.036q0-.562-.09-1.095zM6.939 12.436a1.76 1.76 0 0 1 1.312 2.106 1.74 1.74 0 0 1-2.086 1.323zm18.948 3.428a1.74 1.74 0 0 1-2.087-1.323 1.76 1.76 0 0 1 1.31-2.106zm-2.105-6.098a.24.24 0 0 1 .257.325l-1.731 4.452a6.58 6.58 0 0 0-3.14-4.073zM8.222 9.76l4.625.703a6.59 6.59 0 0 0-3.149 4.074l-1.731-4.453a.24.24 0 0 1 .256-.324m7.575-3.675c.09-.16.32-.16.411 0l2.331 4.074a6.4 6.4 0 0 0-2.536-.517c-.9 0-1.757.184-2.537.517zm-2.582.731a1.766 1.766 0 0 1-.814 2.348 1.736 1.736 0 0 1-2.326-.821zm8.636 1.527a1.735 1.735 0 0 1-2.326.82 1.766 1.766 0 0 1-.814-2.347z"
      clipRule="evenodd"
    />
    <defs>
      <linearGradient
        id="a"
        x1={10.238}
        x2={7.653}
        y1={22.064}
        y2={22.451}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#E35930" />
        <stop offset={1} stopColor="#E84125" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Helius;

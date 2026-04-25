import type { SVGProps } from "react";

export interface KaminoProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Kamino({
  size = 24,
  ...props
}: KaminoProps) {
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
    <rect width={32} height={32} fill="var(--fill-0, #04162E)" rx={8} />
    <g fill="var(--fill-0, #C9F2FA)">
      <path d="M20.277 12.162c.31.004 1.14-.02 1.416.032.008.065-.03.212-.078.248-3.386 2.528-3.643 8.099-.419 10.977.233.188.398.31.559.563-.468.042-1.223.022-1.711.022l-2.95-.001c-.175-.244-.296-.485-.434-.746-1.291-2.431-1.6-5.302-.91-7.961.302-1.162.756-2.101 1.36-3.136 1.049.02 2.118-.01 3.167.002M13.791 24.008l-3.544-.004-.002-16.012 3.544-.001z" />
    </g>
  </svg>
);
}

export default Kamino;

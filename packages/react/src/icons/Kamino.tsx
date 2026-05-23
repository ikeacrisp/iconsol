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
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#04162E" rx={8} />
    <path
      fill="#C9F2FA"
      d="M20.277 12.162c.31.004 1.14-.02 1.416.032.008.064-.03.212-.078.248-3.386 2.528-3.643 8.099-.419 10.977.233.188.398.31.559.563-.468.042-1.223.022-1.711.022l-2.95-.001c-.175-.244-.296-.485-.435-.746-1.29-2.432-1.599-5.303-.908-7.961.301-1.162.755-2.101 1.36-3.136 1.048.019 2.117-.01 3.166.002M13.791 24.008l-3.545-.004V7.992l3.543-.001z"
    />
  </svg>
);
}

export default Kamino;

import type { SVGProps } from "react";

export interface SuperteamProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Superteam({
  size = 24,
  ...props
}: SuperteamProps) {
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
    <rect width={32} height={32} fill="var(--fill-0, #3F3ECA)" rx={8} />
    <g fill="var(--fill-0, #FFB443)">
      <path d="M14.491 8.279v7.866H10.85c2.212.56 3.642 2.012 3.642 4.09 0 1.698-.469 3.486-4.491 3.486H6v-7.865h4.156C7.966 15.52 6 14.514 6 11.766c0-1.7.47-3.487 4.491-3.487zM21.777 10.648H26v1.632c0 2.212-1.788 4-4 4h-.223v7.396h-.715c-4.358 0-5.23-3.039-5.23-5.742l-.067-9.655h6.012z" />
    </g>
  </svg>
);
}

export default Superteam;

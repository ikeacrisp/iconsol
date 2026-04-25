import type { SVGProps } from "react";

export interface ZoraProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Zora({
  size = 24,
  ...props
}: ZoraProps) {
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
    <g clipPath="url(#a)">
      <rect width={32} height={32} fill="var(--fill-0, #3FFF00)" rx={8} />
      <path
        fill="var(--fill-0, black)"
        d="M12.333 0 0 11.2v9.6L12.333 9.6V32h7.4V9.6L32 20.8v-9.6L19.733 0z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <rect width={32} height={32} fill="#fff" rx={8} />
      </clipPath>
    </defs>
  </svg>
);
}

export default Zora;

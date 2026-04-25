import type { SVGProps } from "react";

export interface UsdtProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Usdt({
  size = 24,
  ...props
}: UsdtProps) {
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
      <path
        fill="var(--fill-0, #1B262D)"
        d="M16 32c8.837 0 16-7.163 16-16S24.837 0 16 0 0 7.163 0 16s7.163 16 16 16"
      />
      <path
        fill="var(--fill-0, #009393)"
        fillRule="evenodd"
        d="M8.648 6.783H23.62c.357 0 .687.19.866.5l4.362 7.562a.994.994 0 0 1-.164 1.205L16.677 27.883a1 1 0 0 1-1.403 0L3.283 16.066a.994.994 0 0 1-.15-1.23l4.664-7.578a1 1 0 0 1 .85-.475m13.039 3.376v2.122h-4.265v1.471c2.995.157 5.243.803 5.26 1.577v1.613c-.017.774-2.265 1.42-5.26 1.577v3.61H14.59v-3.61c-2.996-.157-5.243-.803-5.26-1.577V15.33c.017-.774 2.264-1.42 5.26-1.577v-1.47h-4.265v-2.123zm-5.681 7.252c3.197 0 5.869-.546 6.522-1.275-.554-.618-2.56-1.105-5.106-1.239v1.54a27 27 0 0 1-2.832 0v-1.54c-2.547.134-4.552.62-5.107 1.239.654.729 3.326 1.275 6.523 1.275"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h32v32H0z" />
      </clipPath>
    </defs>
  </svg>
);
}

export default Usdt;

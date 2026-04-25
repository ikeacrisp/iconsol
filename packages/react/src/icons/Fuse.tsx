import type { SVGProps } from "react";

export interface FuseProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Fuse({
  size = 24,
  ...props
}: FuseProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 19.959 19.679"
    width={size}
    height={size}
    {...props}
  >
    <g fill="var(--fill-0, #1A1A1A)" clipPath="url(#a)">
      <path d="M16.961 18.564a2.996 2.996 0 0 0 2.998-2.994 2.996 2.996 0 0 0-2.998-2.995 2.996 2.996 0 0 0-2.998 2.995 2.996 2.996 0 0 0 2.998 2.994M16.929.521c-.742 0-1.458.273-2.01.768-4.385 3.238-7.516.555-8.21-.143L6.566.99a3.515 3.515 0 0 0-5.96 2.522c.005.477.104.948.29 1.387.226.555.76 1.074 1.046 1.515.538.81.827 1.53.827 2.56a5.16 5.16 0 0 1-1.41 3.508c-.097.114-.52.596-.526.6a4.115 4.115 0 0 0 3.29 6.597 4.12 4.12 0 0 0 3.688-2.281 4.11 4.11 0 0 0-.4-4.317l-.372-.424a5.223 5.223 0 0 1-.484-6.94 5 5 0 0 1 .614-.662 5.225 5.225 0 0 1 7.27.233c.097.102.39.415.437.454.681.59 1.242.84 2.05.84a3.035 3.035 0 0 0 3.034-3.03A3.03 3.03 0 0 0 16.925.52z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h19.959v19.679H0z" />
      </clipPath>
    </defs>
  </svg>
);
}

export default Fuse;

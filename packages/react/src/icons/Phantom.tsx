import type { SVGProps } from "react";

export interface PhantomProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Phantom({
  size = 24,
  ...props
}: PhantomProps) {
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
    <rect width={32} height={32} fill="var(--fill-0, #AB9FF2)" rx={8} />
    <path
      fill="var(--fill-0, white)"
      d="M8.665 24.002c2.452 0 4.295-2.133 5.395-3.818a3.3 3.3 0 0 0-.208 1.103c0 .985.565 1.686 1.68 1.686 1.53 0 3.166-1.342 4.013-2.79q-.09.314-.09.582c0 .686.387 1.119 1.175 1.119 2.482 0 4.98-4.4 4.98-8.248 0-2.998-1.517-5.638-5.322-5.638-6.688 0-13.897 8.174-13.897 13.454 0 2.073 1.114 2.55 2.274 2.55m9.32-10.694c0-.746.415-1.268 1.025-1.268.594 0 1.01.522 1.01 1.268s-.416 1.283-1.01 1.283c-.61 0-1.026-.537-1.026-1.283m3.18 0c0-.746.416-1.268 1.026-1.268.594 0 1.01.522 1.01 1.268s-.416 1.283-1.01 1.283c-.61 0-1.026-.537-1.026-1.283"
    />
  </svg>
);
}

export default Phantom;

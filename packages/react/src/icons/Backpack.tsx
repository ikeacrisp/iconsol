import type { SVGProps } from "react";

export interface BackpackProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Backpack({
  size = 24,
  ...props
}: BackpackProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#E33E3F" rx={8} />
    <path
      fill="#fff"
      d="M21.383 20.479c.708 0 1.062 0 1.282.22s.22.574.22 1.282v1.002c0 1.416 0 2.124-.44 2.564s-1.149.44-2.565.44h-7.762c-1.416 0-2.124 0-2.564-.44s-.44-1.148-.44-2.564V21.98c0-.708 0-1.062.22-1.282s.574-.22 1.283-.22z"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M16 8.899c6.985 0 6.885 4.657 6.885 6.886v2.504c0 .414-.336.75-.751.75H9.865a.75.75 0 0 1-.75-.75V15.34c.014-2.347.335-6.44 6.884-6.441m0 1.774A2.129 2.129 0 1 0 16 14.931 2.129 2.129 0 0 0 16 10.673"
      clipRule="evenodd"
    />
    <path
      fill="#fff"
      d="M15.997 6.012c1.508 0 2.827.527 3.176 1.385.053.148.079.222.032.277-.046.055-.137.039-.317.006a13 13 0 0 0-1.712-.16 22 22 0 0 0-2.352 0c-.586.017-1.25.075-1.718.157-.177.031-.265.046-.312-.009-.046-.054-.02-.127.03-.272.347-.855 1.667-1.384 3.173-1.384"
    />
  </svg>
);
}

export default Backpack;

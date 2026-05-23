import type { SVGProps } from "react";

export interface ArciumProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Arcium({
  size = 24,
  ...props
}: ArciumProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#6D45FF" rx={8} />
    <path
      fill="#fff"
      d="M11.761 9.472c.895-1.996 4.174-1.914 5.136 0l5.884 12.608h1.26l-5.98-12.765c-.258-.49-.393-.862-.826-1.257.031-.004 2.171-.24 2.908 1.216l6.897 14.72h-5.45l-6.268-13.41a1.123 1.123 0 0 0-2.037.023L7.052 23.989H4.96z"
    />
    <path
      fill="#fff"
      d="M14.073 11.508c.253-.535.197-.54.444-.011l.816 1.734-4.939 10.758H8.296z"
    />
  </svg>
);
}

export default Arcium;

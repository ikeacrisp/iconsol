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
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <path
      fill="#1B262D"
      d="M16 30c7.732 0 14-6.268 14-14S23.732 2 16 2 2 8.268 2 16s6.268 14 14 14"
    />
    <path
      fill="#009393"
      fillRule="evenodd"
      d="M10.065 8.61h12.114c.29 0 .556.154.7.404l3.53 6.119a.804.804 0 0 1-.133.975l-9.715 9.574a.81.81 0 0 1-1.135 0l-9.702-9.561a.804.804 0 0 1-.12-.995l3.772-6.131a.81.81 0 0 1 .689-.385m10.55 2.732v1.717h-3.451v1.19c2.424.127 4.242.65 4.256 1.276v1.305c-.014.626-1.832 1.149-4.256 1.276v2.921h-2.292v-2.921c-2.423-.127-4.242-.65-4.255-1.276v-1.305c.013-.626 1.832-1.149 4.256-1.276v-1.19h-3.451v-1.717zm-4.597 5.867c2.587 0 4.749-.442 5.278-1.032-.449-.5-2.072-.893-4.132-1.002v1.247a22 22 0 0 1-2.292 0v-1.247c-2.06.108-3.683.502-4.131 1.002.529.59 2.69 1.032 5.277 1.032"
      clipRule="evenodd"
    />
  </svg>
);
}

export default Usdt;

import type { SVGProps } from "react";

export interface RaydiumProtocolProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function RaydiumProtocol({
  size = 24,
  ...props
}: RaydiumProtocolProps) {
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
    <rect width={32} height={32} fill="var(--fill-0, #131A34)" rx={8} />
    <path
      fill="url(#a)"
      d="m23.88 9.055-1.059.623L15.97 5.69 7.06 10.861V21.14l8.908 5.17 8.908-5.108v-8.036l1.06-.623v9.22l-9.968 5.73-9.967-5.73V10.238l9.967-5.731zm-6.914 2.055c.872 0 1.682.374 2.304.997.624.622.998 1.433.998 2.305q0 1.028-.561 1.868c-.374.499-.873.935-1.434 1.184-.56.187-1.183.249-1.805.249h-2.99v3.49h-1.496v-4.985h4.984c.498 0 .934-.187 1.246-.56.311-.312.498-.81.498-1.246 0-.25-.063-.436-.125-.685-.062-.187-.248-.436-.373-.561a1.5 1.5 0 0 0-.56-.374c-.187-.062-.437-.187-.686-.187h-4.984V11.11zm3.24 9.967H18.46l-1.37-2.367c.56-.062 1.058-.125 1.556-.312zm5.792-10.84v1.246l-1.059.561-1.058-.56v-1.247l1.058-.622z"
    />
    <defs>
      <linearGradient
        id="a"
        x1={25.978}
        x2={4.843}
        y1={10.422}
        y2={18.874}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#C200FB" />
        <stop offset={0.49} stopColor="#3772FF" />
        <stop offset={1} stopColor="#5AC4BE" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default RaydiumProtocol;

import type { SVGProps } from "react";

export interface MoonshotProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Moonshot({
  size = 24,
  ...props
}: MoonshotProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#231C51" rx={8} />
    <path
      fill="url(#a)"
      fillRule="evenodd"
      d="M21.738 7.83c.235.086 1.092.87 1.297 1.076a9.9 9.9 0 0 1 2.749 5.052 9.98 9.98 0 0 1-1.41 7.508 10 10 0 0 1-6.322 4.317 9.96 9.96 0 0 1-7.62-1.483 10.7 10.7 0 0 1-1.77-1.516 10 10 0 0 0-.685-.824c.27.119.536.218.804.312.977.346 1.992.578 3.022.69 5.35.56 9.342-2.354 10.424-7.595.14-.673.211-1.293.281-1.976.396.015.834.141 1.23.182.22.022.357-.042.26-.278-.598-1.453-1.205-2.903-1.801-4.357-.152-.37-.32-.731-.46-1.107m-5.756 18.167h.064z"
      clipRule="evenodd"
    />
    <path
      fill="url(#b)"
      d="M15.622 6.013c.621-.037 1.245.021 1.858.108 1.584.226 2.759.748 4.098 1.575-.206.247-.427.54-.628.797l-1.402 1.798c-.483.618-1.317 1.652-1.793 2.32-.16.223.497.277.654.299q.425.055.848.124c-.154 1.573-.525 3.079-1.518 4.352a6 6 0 0 1-3.247 2.142c-.362.092-.682.13-1.05.176a7.8 7.8 0 0 1-2.104-.1 8.39 8.39 0 0 1-5.329-3.49 2 2 0 0 1-.006-.184q0-.154.006-.309c.016-.354.06-.748.101-1.029A9.9 9.9 0 0 1 8.585 9.3c1.841-2.04 4.309-3.144 7.037-3.287"
    />
    <defs>
      <linearGradient
        id="a"
        x1={16}
        x2={16}
        y1={6.002}
        y2={25.998}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#fff" />
        <stop offset={1} stopColor="#C7C3DD" />
      </linearGradient>
      <linearGradient
        id="b"
        x1={16}
        x2={16}
        y1={6.002}
        y2={25.998}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FD85FD" />
        <stop offset={1} stopColor="#F869F7" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Moonshot;

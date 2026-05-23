import type { SVGProps } from "react";

export interface JitosolProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Jitosol({
  size = 24,
  ...props
}: JitosolProps) {
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
      fill="url(#a)"
      d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2"
    />
    <path
      fill="#fff"
      d="M22.783 18.746c.204 0 .305.247.161.39l-2.212 2.21a.46.46 0 0 1-.323.134H9.217a.23.23 0 0 1-.162-.39l2.212-2.21a.46.46 0 0 1 .323-.134zM20.41 14.592c.12 0 .237.048.322.134l2.212 2.21a.229.229 0 0 1-.16.39H11.59a.46.46 0 0 1-.323-.134l-2.212-2.21a.23.23 0 0 1 .162-.39zM22.783 10.49c.204 0 .305.247.161.39l-2.21 2.21a.46.46 0 0 1-.325.135H9.217a.23.23 0 0 1-.162-.391l2.212-2.21a.46.46 0 0 1 .323-.134z"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M16 4c6.627 0 12 5.373 12 12s-5.373 12-12 12S4 22.627 4 16 9.373 4 16 4m0 1C9.925 5 5 9.925 5 16s4.925 11 11 11 11-4.925 11-11S22.075 5 16 5"
      clipRule="evenodd"
    />
    <defs>
      <linearGradient
        id="a"
        x1={10}
        x2={21}
        y1={10.5}
        y2={21.5}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#7CD18B" />
        <stop offset={1} stopColor="#39997D" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Jitosol;

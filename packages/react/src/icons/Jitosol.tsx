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
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 28 28"
    width={size}
    height={size}
    {...props}
  >
    <path
      fill="url(#a)"
      d="M14 0C6.268 0 0 6.268 0 14s6.268 14 14 14 14-6.268 14-14S21.732 0 14 0"
    />
    <g fill="var(--fill-0, white)">
      <path d="M20.783 16.746c.204 0 .305.247.161.39l-2.212 2.21a.46.46 0 0 1-.323.134H7.217a.23.23 0 0 1-.162-.39l2.212-2.21a.46.46 0 0 1 .323-.134zM18.41 12.592c.12 0 .237.048.322.134l2.212 2.21a.229.229 0 0 1-.16.39H9.59a.46.46 0 0 1-.323-.134l-2.212-2.21a.23.23 0 0 1 .162-.39zM20.783 8.49c.204 0 .305.247.161.39l-2.21 2.21a.46.46 0 0 1-.325.135H7.217a.23.23 0 0 1-.162-.391l2.212-2.21a.46.46 0 0 1 .323-.134z" />
      <path
        fillRule="evenodd"
        d="M14 2c6.627 0 12 5.373 12 12s-5.373 12-12 12S2 20.627 2 14 7.373 2 14 2m0 1C7.925 3 3 7.925 3 14s4.925 11 11 11 11-4.925 11-11S20.075 3 14 3"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <linearGradient
        id="a"
        x1={8}
        x2={19}
        y1={8.5}
        y2={19.5}
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

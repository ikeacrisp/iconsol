import type { SVGProps } from "react";

export interface SolProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Sol({
  size = 24,
  ...props
}: SolProps) {
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
    <rect width={32} height={32} fill="var(--fill-0, #1A1A1A)" rx={8} />
    <path
      fill="url(#a)"
      d="m25.076 20.61-3.028 3.162a.7.7 0 0 1-.514.218H7.18a.36.36 0 0 1-.193-.056.334.334 0 0 1-.064-.52l3.03-3.163a.7.7 0 0 1 .513-.218h14.352q.104.001.193.056a.334.334 0 0 1 .064.52m-3.028-6.37a.7.7 0 0 0-.514-.219H7.18a.36.36 0 0 0-.193.057.335.335 0 0 0-.064.52l3.03 3.163a.7.7 0 0 0 .513.218h14.352q.104 0 .193-.057a.335.335 0 0 0 .064-.52zM7.181 11.966h14.353a.72.72 0 0 0 .514-.218l3.028-3.163a.34.34 0 0 0 .065-.37.35.35 0 0 0-.13-.15.36.36 0 0 0-.192-.056H10.467a.72.72 0 0 0-.513.218l-3.03 3.163a.34.34 0 0 0-.065.37.357.357 0 0 0 .322.206"
    />
    <defs>
      <linearGradient
        id="a"
        x1={8.378}
        x2={22.99}
        y1={24.371}
        y2={7.462}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.08} stopColor="#9945FF" />
        <stop offset={0.3} stopColor="#8752F3" />
        <stop offset={0.5} stopColor="#5497D5" />
        <stop offset={0.6} stopColor="#43B4CA" />
        <stop offset={0.72} stopColor="#28E0B9" />
        <stop offset={0.97} stopColor="#19FB9B" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Sol;

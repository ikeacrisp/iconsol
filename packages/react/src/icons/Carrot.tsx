import type { SVGProps } from "react";

export interface CarrotProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Carrot({
  size = 24,
  ...props
}: CarrotProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 20.003 20.003"
    width={size}
    height={size}
    {...props}
  >
    <path fill="var(--fill-0, #3D783D)" d="M17.502 2.5h2.5V5h-2.5z" />
    <path
      fill="var(--fill-0, #F98635)"
      d="M0 17.502h2.5v2.5H0zm2.5-2.5H5v2.5H2.5zm0-2.5H5v2.5H2.5zm2.5 0h2.5v2.5H5zm0-2.5h2.5v2.5H5zm2.5 0h2.501v2.5h-2.5zm0-2.501h2.501v2.5h-2.5zm2.501 0h2.5v2.5h-2.5z"
    />
    <path
      fill="var(--fill-0, #EA7928)"
      d="M5 15.002h2.501v2.5h-2.5zm2.501-2.5h2.5v2.5h-2.5zm2.5-2.5h2.5v2.5h-2.5z"
    />
    <path fill="var(--fill-0, #498448)" d="M7.501 2.5h2.5V5h-2.5z" />
    <path fill="var(--fill-0, #3D783D)" d="M10.001 2.5h2.5V5h-2.5z" />
    <path
      fill="var(--fill-0, #498448)"
      d="M10.001 0h2.5v2.5h-2.5zm5 0h2.5v2.5h-2.5zm-2.5 5h2.5v2.5h-2.5zm2.5-2.5h2.5V5h-2.5zm0 5h2.5v2.501h-2.5zm2.501 0h2.5v2.501h-2.5z"
    />
    <path fill="var(--fill-0, #3D783D)" d="M17.502 10.001h2.5v2.5h-2.5z" />
  </svg>
);
}

export default Carrot;

import type { SVGProps } from "react";

export interface ColosseumProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Colosseum({
  size = 24,
  ...props
}: ColosseumProps) {
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
      fill="var(--fill-0, white)"
      fillRule="evenodd"
      d="M24 7.999H8v2.014h16zm-1.583 3.578H9.58v2.014h12.838zm-7.394 3.579h1.95v8.846h-1.95zm-1.95 0h-1.949v8.846h1.95zm5.851 0h1.95v8.846h-1.95z"
      clipRule="evenodd"
    />
  </svg>
);
}

export default Colosseum;

import type { SVGProps } from "react";

export interface StepFinanceProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function StepFinance({
  size = 24,
  ...props
}: StepFinanceProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#1A1A1A" rx={8} />
    <path
      stroke="#7BF178"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2.5}
      d="m9 22 5-6 4 3 5-9"
    />
    <circle cx={9} cy={22} r={2} fill="#7BF178" />
  </svg>
);
}

export default StepFinance;

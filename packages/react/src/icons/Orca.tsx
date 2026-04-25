import type { SVGProps } from "react";

export interface OrcaProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Orca({
  size = 24,
  ...props
}: OrcaProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <circle cx={16} cy={16} r={16} fill="#000F3A" />
    <path
      fill="#fff"
      d="M16 8a8 8 0 1 0 0 16c3.718 0 6.849-2.41 7.739-5.774A10.2 10.2 0 0 1 18 20c-4.418 0-8-2.686-8-6s3.582-6 8-6c-.656 0-1.331.049-2 0"
    />
    <circle cx={21} cy={11} r={2} fill="#FC72FF" />
  </svg>
);
}

export default Orca;

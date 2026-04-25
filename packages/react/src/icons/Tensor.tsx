import type { SVGProps } from "react";

export interface TensorProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Tensor({
  size = 24,
  ...props
}: TensorProps) {
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
    <path fill="#6366F1" d="m16 7 9 5.5v8L16 26l-9-5.5v-8z" opacity={0.9} />
    <path fill="#818CF8" d="m16 7 9 5.5-9 5.5-9-5.5z" />
  </svg>
);
}

export default Tensor;

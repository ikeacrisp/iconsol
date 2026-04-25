import type { SVGProps } from "react";

export interface KastProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Kast({
  size = 24,
  ...props
}: KastProps) {
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
      d="m11.639 11.316.061-5.311H7.191v7.74l4.322 2.085-4.322 2.157v8.004h4.504l-.06-5.489 9.648 5.493h3.526v-3.471L11.512 15.83l13.297-6.469V6.005h-3.526z"
    />
  </svg>
);
}

export default Kast;

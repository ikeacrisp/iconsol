import type { SVGProps } from "react";

export interface BackpackProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Backpack({
  size = 24,
  ...props
}: BackpackProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 13.771 19.975"
    width={size}
    height={size}
    {...props}
  >
    <path
      fill="var(--fill-0, white)"
      d="M12.269 14.467c.707 0 1.062 0 1.282.22s.22.574.22 1.282v1.002c0 1.416 0 2.124-.44 2.564s-1.15.44-2.565.44H3.004c-1.416 0-2.125 0-2.565-.44S0 18.387 0 16.971v-1.002c0-.708 0-1.062.22-1.282s.574-.22 1.282-.22zM6.885 2.887c6.985 0 6.886 4.657 6.886 6.885v2.504c0 .415-.337.751-.751.751H.75a.75.75 0 0 1-.751-.75V9.327C.015 6.98.336 2.887 6.885 2.887m0 1.774a2.129 2.129 0 1 0 .002 4.258 2.129 2.129 0 0 0-.002-4.258M6.883 0C8.39 0 9.71.527 10.059 1.385c.052.148.079.222.032.277s-.137.039-.318.006a13 13 0 0 0-1.711-.16 22 22 0 0 0-2.353 0 13 13 0 0 0-1.718.157c-.177.03-.265.046-.311-.009-.047-.055-.021-.127.03-.272C4.056.529 5.376 0 6.883 0"
    />
  </svg>
);
}

export default Backpack;

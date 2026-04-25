import type { SVGProps } from "react";

export interface PumpFunProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function PumpFun({
  size = 24,
  ...props
}: PumpFunProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 19.995 20.606"
    width={size}
    height={size}
    {...props}
  >
    <path
      fill="var(--fill-0, white)"
      d="M1.946 18.983a6.08 6.08 0 0 1-.323-8.595l7.831-8.442a6.082 6.082 0 0 1 8.918 8.272l-7.83 8.442a6.08 6.08 0 0 1-8.596.323"
    />
    <path
      fill="var(--fill-0, #5FCB88)"
      fillRule="evenodd"
      d="M1.623 10.388a6.082 6.082 0 0 0 8.918 8.272l4.173-4.498-8.918-8.273zm2.26 2.372a.216.216 0 0 0-.335-.272l-.256.315a.216.216 0 1 0 .336.273zm-.632 1.23a.216.216 0 0 0-.425-.08 3.7 3.7 0 0 0 .11 1.825.216.216 0 0 0 .41-.135 3.26 3.26 0 0 1-.095-1.61m.523 2.523a.216.216 0 1 0-.31.301l.357.369a.216.216 0 0 0 .31-.301z"
      clipRule="evenodd"
    />
    <path
      fill="var(--fill-0, #629393)"
      fillOpacity={0.4}
      fillRule="evenodd"
      d="M.007 14.234a5.595 5.595 0 0 0 9.455 2.172l6.875-7.412A5.595 5.595 0 0 0 14.376.017a6.082 6.082 0 0 1 3.996 10.2l-7.831 8.443A6.082 6.082 0 0 1 .007 14.234"
      clipRule="evenodd"
    />
    <path
      fill="var(--fill-0, #1D3934)"
      d="M9.455 1.946a6.082 6.082 0 0 1 8.918 8.272L14.2 14.717 5.956 7.07l-3.659 3.943a5.164 5.164 0 1 0 7.57 7.022l3.659-3.943.674.625-3.658 3.943a6.083 6.083 0 0 1-8.918-8.272l3.658-3.943zm7.97.351a5.163 5.163 0 0 0-7.296.274L6.58 6.396l7.57 7.022 3.548-3.825a5.16 5.16 0 0 0-.275-7.296"
    />
  </svg>
);
}

export default PumpFun;

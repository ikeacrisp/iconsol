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
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#fff" fillOpacity={0.05} rx={8} />
    <path
      fill="#fff"
      d="M7.946 24.68a6.08 6.08 0 0 1-.323-8.595l7.831-8.442a6.082 6.082 0 1 1 8.918 8.272l-7.831 8.442a6.08 6.08 0 0 1-8.595.323"
    />
    <path
      fill="#5FCB88"
      fillRule="evenodd"
      d="M7.623 16.085a6.082 6.082 0 0 0 8.918 8.273l4.173-4.5-8.918-8.272zm2.26 2.372a.216.216 0 0 0-.336-.272l-.256.315a.216.216 0 0 0 .336.273zm-.632 1.23a.216.216 0 0 0-.425-.08 3.7 3.7 0 0 0 .11 1.825.216.216 0 0 0 .41-.135 3.26 3.26 0 0 1-.095-1.61m.523 2.523a.216.216 0 0 0-.31.3l.357.37a.216.216 0 1 0 .31-.301z"
      clipRule="evenodd"
    />
    <path
      fill="#629393"
      fillOpacity={0.4}
      fillRule="evenodd"
      d="M6.007 19.93a5.595 5.595 0 0 0 9.455 2.172l6.875-7.412a5.595 5.595 0 0 0-1.961-8.976 6.082 6.082 0 0 1 3.996 10.2l-7.831 8.443A6.082 6.082 0 0 1 6.007 19.93"
      clipRule="evenodd"
    />
    <path
      fill="#1D3934"
      fillRule="evenodd"
      d="M15.455 7.643a6.082 6.082 0 0 1 8.917 8.272l-4.172 4.5-8.244-7.648-3.659 3.943a5.163 5.163 0 1 0 7.57 7.023l3.659-3.944.674.625-3.658 3.944a6.083 6.083 0 0 1-8.918-8.273zm7.97.351a5.163 5.163 0 0 0-7.297.274l-3.547 3.825 7.57 7.022 3.548-3.825a5.16 5.16 0 0 0-.275-7.296"
      clipRule="evenodd"
    />
  </svg>
);
}

export default PumpFun;

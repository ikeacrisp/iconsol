import type { SVGProps } from "react";

export interface MetadaoProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Metadao({
  size = 24,
  ...props
}: MetadaoProps) {
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
      fill="url(#a)"
      d="M6.456 6.004a.5.5 0 0 0-.453.5v3.499a.5.5 0 1 0 1 0V7.707l2.866 2.866c.223-.249.462-.48.71-.703L7.714 7.004h2.289a.5.5 0 1 0 0-1H6.456M10.58 9.87l4.772 4.772c.192.182.194.53.008.718a.516.516 0 0 1-.711-.008l-4.78-4.78a9.247 9.247 0 0 0 6.88 15.425 9.247 9.247 0 1 0 0-18.494 9.2 9.2 0 0 0-6.17 2.367"
    />
    <defs>
      <linearGradient
        id="a"
        x1={16}
        x2={16}
        y1={6.003}
        y2={25.997}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FF7B7B" />
        <stop offset={1} stopColor="#FF4949" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Metadao;

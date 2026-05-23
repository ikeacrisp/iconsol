import type { SVGProps } from "react";

export interface MetaplexProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Metaplex({
  size = 24,
  ...props
}: MetaplexProps) {
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
      fillRule="evenodd"
      d="M16.043 18.914a.43.43 0 0 0 .017-.458l-5.268-8.914a.41.41 0 0 0-.364-.208h-3.7a.422.422 0 0 0-.363.638l6.922 11.875a.42.42 0 0 0 .711.027zM9.647 21.66a.426.426 0 0 1-.363.644h-2.54a.425.425 0 0 1-.423-.426v-4.296c0-.436.57-.588.787-.218z"
      clipRule="evenodd"
    />
    <path
      fill="#fff"
      d="M25.96 21.781a.424.424 0 0 1-.363.638h-3.678a.42.42 0 0 1-.364-.213L14.421 9.972a.424.424 0 0 1 .364-.638h3.694a.42.42 0 0 1 .364.213z"
    />
  </svg>
);
}

export default Metaplex;

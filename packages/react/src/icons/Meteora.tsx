import type { SVGProps } from "react";

export interface MeteoraProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Meteora({
  size = 24,
  ...props
}: MeteoraProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 18.454 19.992"
    width={size}
    height={size}
    {...props}
  >
    <g clipPath="url(#a)">
      <path
        fill="url(#b)"
        d="M15.775 4.638c.334-.334.852-.314 1.066.04.231.38.406.79.53 1.22.07.245-.01.531-.213.734L10.61 13.18a2.85 2.85 0 0 1-1.41.78l-.543.116a2.9 2.9 0 0 0-1.41.78l-5.026 5.026c-.214-.825-.308-1.383.363-2.053zm1.418 2.82c.218-.217.554-.091.532.197-.135 1.765-.976 3.625-2.474 5.123-1.143 1.252-4.367 3.165-6.672 4.448-.472.262-.856-.298-.47-.684l9.082-9.08zM14.18 1.992c.207-.208.513-.252.723-.107.437.297.845.727 1.055 1.247.079.2.011.447-.162.62l-7.051 7.052a2.85 2.85 0 0 1-1.409.78l-.544.115a2.9 2.9 0 0 0-1.409.78l-4.35 4.35c-.214-.826-.11-1.58.56-2.25zM11.19.737c.393-.393.957-.546 1.42-.372q.436.168.835.407c.35.21.367.72.04 1.048l-6.45 6.45c-.369.368-.871.565-1.352.53-.504-.037-1.035.17-1.426.562L.725 12.894c-.214-.826.064-1.754.735-2.425l1.144-1.145zM10.16.11c.31-.004.43.365.194.6L4.208 6.857l-.71.71-1.082 1.08-.006.008c-.227.227-.563.021-.437-.267l1.058-2.403a8 8 0 0 1 .196-.446l.006-.015c.61-1.29 1.591-2.66 2.513-3.582C7.225.46 8.553.125 10.159.11"
      />
    </g>
    <defs>
      <linearGradient
        id="b"
        x1={20.91}
        x2={3.873}
        y1={0.133}
        y2={19.832}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#F5BD00" />
        <stop offset={0.365} stopColor="#F54B00" />
        <stop offset={1} stopColor="#6E45FF" />
      </linearGradient>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h18.454v19.992H0z" />
      </clipPath>
    </defs>
  </svg>
);
}

export default Meteora;

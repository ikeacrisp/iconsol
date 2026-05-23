import type { SVGProps } from "react";

export interface InfsolProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Infsol({
  size = 24,
  ...props
}: InfsolProps) {
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
    <g clipPath="url(#a)" data-figma-skip-parse="true">
      <foreignObject
        width={2848.49}
        height={2848.49}
        x={-1424.24}
        y={-1424.24}
        transform="matrix(.00432 -.00432 .00432 .00432 11.815 16)"
      >
        <div
          style={{
            background:
              "conic-gradient(from 90deg,#9567fe 0deg,#9566ff 1.19349deg,#6dc4fe 93.3206deg,#cdb9fa 291.125deg,#9567fe 360deg)",
            height: "100%",
            width: "100%",
            opacity: 1,
          }}
        />
      </foreignObject>
    </g>
    <path
      d="M11.815 21.886a5.886 5.886 0 1 0 0-11.772 5.886 5.886 0 0 0 0 11.772"
      data-figma-gradient-fill='{"type":"GRADIENT_ANGULAR","stops":[{"color":{"r":0.58431375026702881,"g":0.40000000596046448,"b":1.0,"a":1.0},"position":0.0033152499236166477},{"color":{"r":0.42745098471641541,"g":0.76862746477127075,"b":0.99607843160629272,"a":1.0},"position":0.25922399759292603},{"color":{"r":0.80392158031463623,"g":0.72549021244049072,"b":0.98039215803146362,"a":1.0},"position":0.80867999792098999}],"stopsVar":[{"color":{"r":0.58431375026702881,"g":0.40000000596046448,"b":1.0,"a":1.0},"position":0.0033152499236166477},{"color":{"r":0.42745098471641541,"g":0.76862746477127075,"b":0.99607843160629272,"a":1.0},"position":0.25922399759292603},{"color":{"r":0.80392158031463623,"g":0.72549021244049072,"b":0.98039215803146362,"a":1.0},"position":0.80867999792098999}],"transform":{"m00":8.6322460174560547,"m01":8.6322460174560547,"m02":3.1823375225067139,"m10":-8.6322460174560547,"m11":8.6322460174560547,"m12":15.999885559082031},"opacity":1.0,"blendMode":"NORMAL","visible":true}'
    />
    <g clipPath="url(#b)" data-figma-skip-parse="true">
      <foreignObject
        width={2880.52}
        height={2880.52}
        x={-1440.26}
        y={-1440.26}
        transform="matrix(-.00427 .00427 -.00427 -.00427 20.086 16)"
      >
        <div
          style={{
            background:
              "conic-gradient(from 90deg,#fc692a 0deg,#72db5a 28.125deg,#ffd800 225.286deg,#fc692a 360deg)",
            height: "100%",
            width: "100%",
            opacity: 1,
          }}
        />
      </foreignObject>
    </g>
    <path
      d="M20.086 21.886a5.886 5.886 0 1 0 0-11.772 5.886 5.886 0 0 0 0 11.772"
      data-figma-gradient-fill='{"type":"GRADIENT_ANGULAR","stops":[{"color":{"r":0.44705882668495178,"g":0.85882353782653809,"b":0.35294118523597717,"a":1.0},"position":0.0781250},{"color":{"r":1.0,"g":0.84705883264541626,"b":0.0,"a":1.0},"position":0.62579399347305298},{"color":{"r":0.98823529481887817,"g":0.41176471114158630,"b":0.16470588743686676,"a":1.0},"position":1.0}],"stopsVar":[{"color":{"r":0.44705882668495178,"g":0.85882353782653809,"b":0.35294118523597717,"a":1.0},"position":0.0781250},{"color":{"r":1.0,"g":0.84705883264541626,"b":0.0,"a":1.0},"position":0.62579399347305298},{"color":{"r":0.98823529481887817,"g":0.41176471114158630,"b":0.16470588743686676,"a":1.0},"position":1.0}],"transform":{"m00":-8.5362482070922852,"m01":-8.5362482070922852,"m02":28.622072219848633,"m10":8.5362482070922852,"m11":-8.5362482070922852,"m12":15.999886512756348},"opacity":1.0,"blendMode":"NORMAL","visible":true}'
    />
    <path fill="url(#c)" d="M15.95 11.839 20.111 16l-4.16 4.161-4.162-4.16z" />
    <defs>
      <clipPath id="a">
        <path d="M11.815 21.886a5.886 5.886 0 1 0 0-11.772 5.886 5.886 0 0 0 0 11.772" />
      </clipPath>
      <clipPath id="b">
        <path d="M20.086 21.886a5.886 5.886 0 1 0 0-11.772 5.886 5.886 0 0 0 0 11.772" />
      </clipPath>
      <linearGradient
        id="c"
        x1={18.031}
        x2={13.87}
        y1={13.919}
        y2={18.081}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#9FDB3F" />
        <stop offset={1} stopColor="#6FC1FF" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Infsol;

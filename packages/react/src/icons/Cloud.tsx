import type { SVGProps } from "react";

export interface CloudProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Cloud({
  size = 24,
  ...props
}: CloudProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 27.992 27.575"
    width={size}
    height={size}
    {...props}
  >
    <path
      fill="url(#a)"
      d="M27.992 13.787c0-7.605-6.266-13.77-13.996-13.77S0 6.182 0 13.787c0 7.606 6.266 13.771 13.996 13.771s13.996-6.165 13.996-13.77"
    />
    <path
      fill="url(#b)"
      stroke="url(#c)"
      strokeWidth={2.099}
      d="M13.996 26.525c7.15 0 12.946-5.703 12.946-12.737 0-7.035-5.796-12.738-12.946-12.738S1.05 6.753 1.05 13.787c0 7.035 5.796 12.738 12.946 12.738Z"
    />
    <g fillRule="evenodd" clipRule="evenodd" filter="url(#d)">
      <path
        fill="var(--fill-0, #F7F9FB)"
        d="M10.509 20.22c-3.098 0-5.61-2.47-5.61-5.519 0-2.642 1.888-4.85 4.408-5.392a7.04 7.04 0 0 1 5.705-2.887c3.624 0 6.606 2.706 6.974 6.176a4.27 4.27 0 0 1 1.581 3.314c0 2.38-1.96 4.308-4.379 4.308h-8.679m5.41-5.829c.27 0 .49.215.49.48v.508c0 .265-.22.48-.49.48a.484.484 0 0 1-.487-.48v-.507c0-.266.218-.48.488-.48m-2.86-3.468c0-.929.765-1.681 1.709-1.681.943 0 1.708.752 1.708 1.68v.75a49 49 0 0 0-3.417 0zm-.976.853v-.853c0-1.46 1.202-2.642 2.685-2.642s2.685 1.183 2.685 2.642v.853c.765.23 1.342.893 1.452 1.695.072.528.134 1.084.134 1.654s-.062 1.126-.134 1.655a2.07 2.07 0 0 1-1.953 1.78c-.697.03-1.405.047-2.184.047a48 48 0 0 1-2.185-.048 2.07 2.07 0 0 1-1.953-1.78 12 12 0 0 1-.134-1.654c0-.57.062-1.126.134-1.654a2.07 2.07 0 0 1 1.453-1.695m1.532 2.615c.27 0 .489.215.489.48v.508c0 .265-.219.48-.489.48a.484.484 0 0 1-.488-.48v-.507c0-.266.219-.48.488-.48"
      />
      <path
        fill="url(#e)"
        d="M10.509 20.22c-3.098 0-5.61-2.47-5.61-5.519 0-2.642 1.888-4.85 4.408-5.392a7.04 7.04 0 0 1 5.705-2.887c3.624 0 6.606 2.706 6.974 6.176a4.27 4.27 0 0 1 1.581 3.314c0 2.38-1.96 4.308-4.379 4.308h-8.679m5.41-5.829c.27 0 .49.215.49.48v.508c0 .265-.22.48-.49.48a.484.484 0 0 1-.487-.48v-.507c0-.266.218-.48.488-.48m-2.86-3.468c0-.929.765-1.681 1.709-1.681.943 0 1.708.752 1.708 1.68v.75a49 49 0 0 0-3.417 0zm-.976.853v-.853c0-1.46 1.202-2.642 2.685-2.642s2.685 1.183 2.685 2.642v.853c.765.23 1.342.893 1.452 1.695.072.528.134 1.084.134 1.654s-.062 1.126-.134 1.655a2.07 2.07 0 0 1-1.953 1.78c-.697.03-1.405.047-2.184.047a48 48 0 0 1-2.185-.048 2.07 2.07 0 0 1-1.953-1.78 12 12 0 0 1-.134-1.654c0-.57.062-1.126.134-1.654a2.07 2.07 0 0 1 1.453-1.695m1.532 2.615c.27 0 .489.215.489.48v.508c0 .265-.219.48-.489.48a.484.484 0 0 1-.488-.48v-.507c0-.266.219-.48.488-.48"
      />
    </g>
    <defs>
      <linearGradient
        id="a"
        x1={13.996}
        x2={13.996}
        y1={0.017}
        y2={27.558}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#363636" />
        <stop offset={1} stopColor="#1B1B1C" />
      </linearGradient>
      <linearGradient
        id="b"
        x1={13.996}
        x2={13.996}
        y1={0.017}
        y2={27.558}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#363636" />
        <stop offset={1} stopColor="#1B1B1C" />
      </linearGradient>
      <linearGradient
        id="c"
        x1={13.996}
        x2={13.996}
        y1={0.017}
        y2={27.558}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#060606" />
        <stop offset={1} stopColor="#414141" />
      </linearGradient>
      <linearGradient
        id="e"
        x1={10.313}
        x2={10.313}
        y1={6.422}
        y2={20.22}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.475} stopColor="#F7F9FB" />
        <stop offset={1} stopColor="#E3E3E3" />
      </linearGradient>
      <filter
        id="d"
        width={22.068}
        height={17.198}
        x={3.199}
        y={4.722}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={0.85} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0" />
        <feBlend
          in2="BackgroundImageFix"
          result="effect1_dropShadow_100_2464"
        />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_100_2464"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);
}

export default Cloud;

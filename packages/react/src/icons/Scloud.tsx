import type { SVGProps } from "react";

export interface ScloudProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Scloud({
  size = 24,
  ...props
}: ScloudProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <path
      fill="url(#a)"
      d="M29.996 16C29.996 8.395 23.73 2.23 16 2.23S2.004 8.394 2.004 16 8.27 29.77 16 29.77 29.996 23.606 29.996 16"
    />
    <path
      fill="url(#b)"
      stroke="url(#c)"
      strokeWidth={2.099}
      d="M16 28.738c7.15 0 12.947-5.703 12.947-12.738S23.15 3.262 16 3.262 3.054 8.965 3.054 16 8.85 28.738 16 28.738Z"
    />
    <path
      fill="url(#d)"
      fillRule="evenodd"
      d="M12.513 22.433c-3.098 0-5.61-2.471-5.61-5.52 0-2.642 1.887-4.85 4.408-5.392a7.04 7.04 0 0 1 5.705-2.886c3.624 0 6.606 2.705 6.974 6.175a4.27 4.27 0 0 1 1.58 3.315c0 2.379-1.96 4.308-4.378 4.308h-8.679m5.41-5.83c.27 0 .489.216.489.481v.507c0 .265-.219.48-.488.48a.484.484 0 0 1-.488-.48v-.507c0-.265.218-.48.488-.48m-2.86-3.468c0-.928.765-1.681 1.709-1.681.943 0 1.708.753 1.708 1.681v.75a49 49 0 0 0-3.417 0zm-.976.854v-.854c0-1.459 1.202-2.642 2.685-2.642 1.482 0 2.685 1.183 2.685 2.642v.854c.765.23 1.342.892 1.452 1.694.072.529.134 1.084.134 1.655 0 .57-.062 1.126-.134 1.654a2.07 2.07 0 0 1-1.953 1.78c-.697.031-1.405.048-2.184.048s-1.487-.017-2.185-.048a2.07 2.07 0 0 1-1.953-1.78 12 12 0 0 1-.134-1.654c0-.571.062-1.126.134-1.655a2.07 2.07 0 0 1 1.453-1.694m1.532 2.615c.27 0 .488.215.488.48v.507c0 .265-.218.48-.488.48a.484.484 0 0 1-.488-.48v-.507c0-.265.219-.48.488-.48"
      clipRule="evenodd"
    />
    <defs>
      <linearGradient
        id="a"
        x1={16}
        x2={16}
        y1={2.229}
        y2={29.771}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#363636" />
        <stop offset={1} stopColor="#1B1B1C" />
      </linearGradient>
      <linearGradient
        id="b"
        x1={16}
        x2={16}
        y1={2.229}
        y2={29.771}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#363636" />
        <stop offset={1} stopColor="#1B1B1C" />
      </linearGradient>
      <linearGradient
        id="c"
        x1={16}
        x2={16}
        y1={2.229}
        y2={29.771}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#060606" />
        <stop offset={1} stopColor="#414141" />
      </linearGradient>
      <linearGradient
        id="d"
        x1={12.317}
        x2={12.317}
        y1={8.635}
        y2={22.433}
        gradientUnits="userSpaceOnUse"
      >
        <stop offset={0.475} stopColor="#F7F9FB" />
        <stop offset={1} stopColor="#E3E3E3" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Scloud;

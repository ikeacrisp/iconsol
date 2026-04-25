import type { SVGProps } from "react";

export interface CrossmintProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Crossmint({
  size = 24,
  ...props
}: CrossmintProps) {
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
    <rect width={32} height={32} fill="var(--fill-0, #0E171B)" rx={8} />
    <path
      fill="url(#a)"
      fillRule="evenodd"
      d="M22.289 17.244c-1.678-.859-3.916-1.147-5.23-1.245 1.789-.133 5.29-.619 6.756-2.415C26.11 11.867 26 6.057 26 6.057s-5.505-.607-7.908 2.134c-1.494 1.487-1.957 4.07-2.092 5.868-.135-1.796-.598-4.381-2.092-5.868C11.505 5.448 6 6.057 6 6.057s-.067 3.623 1.033 5.994c.542 1.168 1.533 2.12 2.678 2.706 1.678.858 3.916 1.147 5.23 1.245-1.314.097-3.552.386-5.23 1.244-1.145.587-2.136 1.538-2.678 2.706C5.933 22.321 6 25.943 6 25.943s5.505.607 7.908-2.133c1.494-1.487 1.957-4.072 2.092-5.868.135 1.796.598 4.381 2.092 5.868C20.495 26.55 26 25.943 26 25.943s.07-3.622-1.033-5.993c-.542-1.168-1.533-2.12-2.678-2.706m.184 5.081c-.028-.007-2.902-.826-6.59-5.751-1.081.844-3.799 3.078-6.386 6.128l-.116.137.046-.174c.007-.03.85-2.99 5.98-6.759-.496-.735-1.662-2.427-6.161-6.412l-.1-.089.132.019c.096.014 2.408.377 6.634 5.821 0 0 .053.075.15.205.596-.412 2.32-1.636 6.197-6.014l.088-.1-.019.132c-.014.096-.377 2.397-5.786 6.606a45 45 0 0 0 5.968 6.18l.14.118-.175-.047z"
      clipRule="evenodd"
    />
    <defs>
      <linearGradient
        id="a"
        x1={5.999}
        x2={26.001}
        y1={6}
        y2={26}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#01FF85" />
        <stop offset={1} stopColor="#00E1FD" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Crossmint;

import type { SVGProps } from "react";

export interface ArciumProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Arcium({
  size = 24,
  ...props
}: ArciumProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 22.081 15.989"
    width={size}
    height={size}
    {...props}
  >
    <g fill="var(--fill-0, white)" clipPath="url(#a)">
      <path d="M6.802 1.466c.894-1.995 4.173-1.914 5.135 0l5.885 12.609h1.26l-5.98-12.766c-.259-.488-.393-.861-.827-1.257.031-.003 2.171-.239 2.909 1.217l6.897 14.72H16.63L10.363 2.578a1.123 1.123 0 0 0-2.037.023L2.092 15.984H0z" />
      <path d="M9.113 3.503c.254-.535.197-.541.445-.012l.816 1.734-4.94 10.759H3.337z" />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h22.081v15.989H0z" />
      </clipPath>
    </defs>
  </svg>
);
}

export default Arcium;

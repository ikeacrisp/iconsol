import type { SVGProps } from "react";

export interface SquadsProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Squads({
  size = 24,
  ...props
}: SquadsProps) {
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
    <rect width={32} height={32} fill="var(--fill-0, white)" rx={8} />
    <path
      fill="var(--fill-0, #1A1A1A)"
      d="M25.486 11.36 22.78 8.655l-2.136-2.14a1.733 1.733 0 0 0-1.22-.506h-6.847a1.73 1.73 0 0 0-1.22.507L9.222 8.649l-2.706 2.707a1.73 1.73 0 0 0-.508 1.223v6.847a1.73 1.73 0 0 0 .508 1.222l4.84 4.843q.062.061.128.109c.308.253.695.39 1.093.391h6.847c.399 0 .785-.139 1.093-.391q.066-.055.127-.11l4.841-4.842a1.73 1.73 0 0 0 .506-1.222v-6.847a1.73 1.73 0 0 0-.505-1.219m-2.134 4.65v5.74a1.61 1.61 0 0 1-1.614 1.606H10.256a1.61 1.61 0 0 1-1.609-1.609V10.265a1.61 1.61 0 0 1 1.609-1.61h11.482a1.61 1.61 0 0 1 1.61 1.61v5.747z"
    />
  </svg>
);
}

export default Squads;

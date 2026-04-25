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
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 19.713 13.085"
    width={size}
    height={size}
    {...props}
  >
    <g fill="var(--fill-0, white)">
      <path
        fillRule="evenodd"
        d="M9.738 9.58a.42.42 0 0 0 .017-.459L4.487.207A.41.41 0 0 0 4.123 0h-3.7A.422.422 0 0 0 .06.638l6.922 11.874a.42.42 0 0 0 .711.027zm-6.396 2.747a.426.426 0 0 1-.363.643H.44a.425.425 0 0 1-.423-.425V8.249c0-.436.57-.589.786-.218z"
        clipRule="evenodd"
      />
      <path d="M19.655 12.447a.424.424 0 0 1-.363.638h-3.678a.42.42 0 0 1-.364-.213L8.116.638A.424.424 0 0 1 8.48 0h3.694c.152 0 .288.082.364.213z" />
    </g>
  </svg>
);
}

export default Metaplex;

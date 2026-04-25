import type { SVGProps } from "react";

export interface MagicEdenProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function MagicEden({
  size = 24,
  ...props
}: MagicEdenProps) {
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
    <rect width={32} height={32} fill="var(--fill-0, #1A1A1A)" rx={8} />
    <path
      fill="url(#a)"
      d="m19.335 13.642.936 1.1c.108.124.202.226.242.284.28.279.438.654.438 1.046-.026.464-.33.778-.607 1.116l-.655.77-.343.399a.1.1 0 0 0-.023.048.1.1 0 0 0 .009.054.09.09 0 0 0 .09.053h3.418c.522 0 1.18.44 1.142 1.105 0 .302-.124.592-.34.807a1.17 1.17 0 0 1-.82.336H17.47c-.352 0-1.299.037-1.564-.77a.95.95 0 0 1-.022-.523c.077-.256.2-.496.36-.71.27-.399.561-.798.848-1.185.371-.507.751-.997 1.125-1.513a.1.1 0 0 0 .02-.06.1.1 0 0 0-.02-.059l-1.36-1.595a.1.1 0 0 0-.034-.027.1.1 0 0 0-.085 0 .1.1 0 0 0-.035.027c-.364.484-1.959 2.63-2.298 3.065-.34.435-1.178.46-1.642 0l-2.127-2.104a.1.1 0 0 0-.05-.026.096.096 0 0 0-.1.041.1.1 0 0 0-.016.054v4.046c.005.287-.082.568-.247.805a1.4 1.4 0 0 1-.676.513 1.18 1.18 0 0 1-1.055-.147 1.14 1.14 0 0 1-.49-.933v-7.275a1.25 1.25 0 0 1 1.593-1.142c.22.058.42.173.58.333l3.269 3.227q.015.015.035.022a.095.095 0 0 0 .11-.033l2.324-3.171a1.17 1.17 0 0 1 .883-.416h6.043a1.17 1.17 0 0 1 .872.392 1.122 1.122 0 0 1 .277.904c-.043.28-.188.536-.407.719-.22.184-.499.282-.787.279H19.41a.094.094 0 0 0-.093.098q0 .024.017.046h-.001z"
    />
    <defs>
      <linearGradient
        id="a"
        x1={8.002}
        x2={23.008}
        y1={11.687}
        y2={20.803}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#8003DF" />
        <stop offset={0.495} stopColor="#D72183" />
        <stop offset={1} stopColor="#F54E39" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default MagicEden;

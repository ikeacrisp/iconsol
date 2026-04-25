import type { SVGProps } from "react";

export interface JupiterLendProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function JupiterLend({
  size = 24,
  ...props
}: JupiterLendProps) {
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
    <rect width={32} height={32} fill="var(--fill-0, #111727)" rx={8} />
    <path
      fill="url(#a)"
      d="M10.768 15.113c1.22-.06 3.211.403 4.24 1.063q-1.083.025-2.166.01l-4.214.003c0-.14 0-.258.01-.397.402-.451 1.553-.649 2.13-.68"
    />
    <path
      fill="url(#b)"
      d="M11.309 12.544a7.2 7.2 0 0 1 1.567.094c2.36.398 5.104 1.8 6.738 3.552-.165-.015-.343-.005-.51-.004l-.783.002c-.701.003-.61.028-1.176-.395q-.552-.375-1.139-.697a11.2 11.2 0 0 0-3.63-1.261c-.191-.032-.472-.092-.662-.095-.467-.006-1.003-.036-1.464.013-.488.052-.994.203-1.46.341.056-.286.128-.49.327-.71.525-.58 1.436-.806 2.191-.84"
    />
    <path
      fill="url(#c)"
      d="M12.631 10.184c1.283-.068 2.691.275 3.883.76 2.11.859 4.242 2.315 5.572 4.186.246.347.445.662.612 1.05-.328 0-.567.023-.903-.01-.173-.161-.434-.511-.619-.714q-.764-.827-1.649-1.523c-1.803-1.422-4.175-2.56-6.459-2.917-.574-.09-1.262-.103-1.844-.09-.172.004-.573.062-.761.084.606-.618 1.331-.78 2.168-.826"
    />
    <path
      fill="url(#d)"
      d="M15.803 8.545a5 5 0 0 1 .805.015 7.6 7.6 0 0 1 2.89.816 7.5 7.5 0 0 1 3.488 3.752c.187.438.253.712.394 1.15-.256-.276-.51-.617-.78-.913-1.93-2.117-5.037-3.9-7.86-4.414-.22-.04-.447-.097-.668-.123.482-.154 1.227-.253 1.73-.283"
    />
    <path
      fill="url(#e)"
      fillRule="evenodd"
      d="M7.831 10.233A10.001 10.001 0 0 1 26 16.135a10.001 10.001 0 0 1-18.32 5.409 9.995 9.995 0 0 1 .152-11.31m8.24-3.226c-.344-.004-.73-.006-1.072.019-.16.011-.403.062-.566.091a8.85 8.85 0 0 0-3.5 1.42 9.07 9.07 0 0 0-3.804 5.79A7.5 7.5 0 0 0 7 15.887c.008.302-.011.609.013.91a9 9 0 0 0 1.543 4.295 9.01 9.01 0 0 0 5.89 3.79c.847.153 1.727.12 2.587.08.294-.013.617-.129.908-.148.38-.111.666-.164 1.058-.307 1.117-.408 2.14-.99 3.02-1.793.147-.134.344-.319.467-.472-.492-.052-.998-.018-1.493-.026-.218-.006-.45.015-.665-.022-1.86-.322-2.606-2.605-1.265-3.954.854-.86 1.842-.702 2.944-.702l2.864-.002c.13-.515.103-.85.121-1.364a8.47 8.47 0 0 0-.9-4.16 9.09 9.09 0 0 0-5.41-4.63c-.188-.06-.385-.1-.576-.164-.327-.06-.706-.142-1.029-.185-.286-.038-.71-.024-1.006-.026m4.635 11.572a1.305 1.305 0 1 0 .086 2.609 1.305 1.305 0 0 0-.086-2.609"
      clipRule="evenodd"
    />
    <defs>
      <linearGradient
        id="a"
        x1={25.613}
        x2={6}
        y1={13.491}
        y2={16.001}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#B4D88E" />
        <stop offset={1} stopColor="#46C5CE" />
      </linearGradient>
      <linearGradient
        id="b"
        x1={25.613}
        x2={6}
        y1={13.491}
        y2={16.001}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#B4D88E" />
        <stop offset={1} stopColor="#46C5CE" />
      </linearGradient>
      <linearGradient
        id="c"
        x1={25.613}
        x2={6}
        y1={13.491}
        y2={16.001}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#B4D88E" />
        <stop offset={1} stopColor="#46C5CE" />
      </linearGradient>
      <linearGradient
        id="d"
        x1={25.613}
        x2={6}
        y1={13.491}
        y2={16.001}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#B4D88E" />
        <stop offset={1} stopColor="#46C5CE" />
      </linearGradient>
      <linearGradient
        id="e"
        x1={25.613}
        x2={6}
        y1={13.491}
        y2={16.001}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#B4D88E" />
        <stop offset={1} stopColor="#46C5CE" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default JupiterLend;

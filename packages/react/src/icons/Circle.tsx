import type { SVGProps } from "react";

export interface CircleProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Circle({
  size = 24,
  ...props
}: CircleProps) {
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
    <path
      fill="url(#a)"
      fillRule="evenodd"
      d="m23.54 10.161-.995.992a.446.446 0 0 0-.056.562 7.8 7.8 0 0 1 .866 1.778l.003-.003c.269.799.408 1.64.408 2.491 0 4.296-3.504 7.791-7.811 7.791a7.75 7.75 0 0 1-3.662-.906l1.686-1.681c.629.238 1.299.361 1.976.361 3.076 0 5.58-2.496 5.58-5.565q-.001-.288-.032-.575a5.6 5.6 0 0 0-.527-1.85.448.448 0 0 0-.719-.122l-1.01 1.007a.44.44 0 0 0-.118.416l.084.362q.09.38.09.762a3.347 3.347 0 0 1-5.006 2.9l-.444-.254a.45.45 0 0 0-.538.071L9.2 22.803c-.19.19-.17.504.044.668l.606.463a9.97 9.97 0 0 0 6.105 2.064c5.538 0 10.043-4.494 10.043-10.017a10 10 0 0 0-1.32-4.968l-.436-.758a.445.445 0 0 0-.703-.094"
      clipRule="evenodd"
    />
    <path
      fill="url(#b)"
      fillRule="evenodd"
      d="M16.09 6.001c-5.563 0-10.088 4.494-10.088 10.017 0 1.744.458 3.462 1.326 4.968l.437.758a.45.45 0 0 0 .706.094l1-.991a.445.445 0 0 0 .055-.562 7.8 7.8 0 0 1-.87-1.778l-.002.002a7.8 7.8 0 0 1-.41-2.49c0-4.297 3.519-7.792 7.845-7.792 1.302 0 2.553.31 3.677.907l-1.692 1.68a5.6 5.6 0 0 0-1.985-.36c-3.09 0-5.604 2.496-5.604 5.564a6 6 0 0 0 .033.587c.068.64.248 1.262.528 1.838a.45.45 0 0 0 .722.122l1.013-1.007a.44.44 0 0 0 .12-.416l-.085-.361a3.3 3.3 0 0 1-.09-.763c0-1.84 1.51-3.339 3.363-3.339.584 0 1.16.152 1.665.44l.446.254c.175.1.397.07.54-.072l4.133-4.104a.443.443 0 0 0-.044-.668l-.609-.464a10.04 10.04 0 0 0-6.13-2.064"
      clipRule="evenodd"
    />
    <defs>
      <linearGradient
        id="a"
        x1={1365.93}
        x2={82.29}
        y1={338.475}
        y2={1593.49}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5FBFFF" />
        <stop offset={1} stopColor="#B090F5" />
      </linearGradient>
      <linearGradient
        id="b"
        x1={6.002}
        x2={1801.59}
        y1={1508.44}
        y2={-248.773}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#68D7FA" />
        <stop offset={1} stopColor="#7EF1B3" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Circle;

import type { SVGProps } from "react";

export interface XstockProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Xstock({
  size = 24,
  ...props
}: XstockProps) {
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
    <rect width={32} height={32} fill="var(--fill-0, #181C1B)" rx={8} />
    <path
      fill="url(#a)"
      d="M8.004 7.999h5.325c.178.168.357.35.53.526.707.72 1.438 1.421 2.143 2.143.142-.165.38-.388.54-.547l1.044-1.045.716-.715c.083-.083.29-.302.369-.362h5.325v5.335l-1.77 1.77c-.284.286-.606.624-.897.896.232.22.471.468.7.696l1.212 1.21.5.502c.07.07.185.192.255.25v5.34h-4.291c-.336 0-.703.008-1.036 0-.064-.052-.238-.236-.303-.301l-.635-.636-1.117-1.117c-.2-.2-.42-.413-.614-.617-.144.157-.35.353-.504.507l-.973.974-.779.78c-.118.119-.296.308-.415.412-.46-.009-.937-.003-1.399-.003H8.004v-5.331c.077-.096.257-.265.35-.359l.685-.684 1.038-1.038c.184-.184.4-.41.59-.583-.087-.098-.216-.22-.312-.316l-.586-.587-1.765-1.765z"
    />
    <defs>
      <linearGradient
        id="a"
        x1={23.996}
        x2={8.004}
        y1={7.999}
        y2={24.001}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#5FCEF0" />
        <stop offset={1} stopColor="#1FD59A" />
      </linearGradient>
    </defs>
  </svg>
);
}

export default Xstock;

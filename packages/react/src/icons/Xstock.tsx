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
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#181C1B" rx={8} />
    <path
      fill="url(#a)"
      d="M8.004 7.999h5.325c.178.168.357.35.53.526.707.72 1.438 1.421 2.143 2.144.142-.166.38-.389.54-.548l1.044-1.045.716-.715c.083-.083.29-.302.369-.362h5.325v5.335l-1.77 1.771c-.284.285-.606.623-.897.895.232.22.471.468.7.696l1.212 1.21.5.502c.07.07.185.192.255.251v5.338h-4.291c-.336 0-.703.009-1.036 0-.064-.05-.238-.235-.303-.3l-.635-.635-1.117-1.118c-.2-.2-.42-.413-.614-.617-.144.158-.35.353-.504.507l-.973.974-.779.78c-.118.119-.296.308-.415.412-.46-.008-.937-.003-1.399-.003H8.004v-5.331c.077-.096.257-.265.35-.359l.685-.684 1.038-1.038c.184-.184.4-.41.59-.583-.087-.098-.216-.22-.312-.316l-.586-.587-1.765-1.765z"
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

import type { SVGProps } from "react";

export interface MarginfiProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Marginfi({
  size = 24,
  ...props
}: MarginfiProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 32 32"
    width={size}
    height={size}
    {...props}
  >
    <rect width={32} height={32} fill="#B5B5B5" rx={8} />
    <path
      fill="#0F1110"
      d="M16.812 6.95v8.904h9.183v9.195h-9.27v-9.095c-.533.271-.957.407-1.283.667-.891.713-1.383 1.701-1.725 2.768-.402 1.258-.838 2.477-1.712 3.524-.877 1.05-1.954 1.692-3.267 1.903-.886.142-1.795.135-2.733.198v-8.982c.343-.074.684-.14 1.02-.223 1.333-.331 1.9-1.421 2.418-2.524.562-1.203.983-2.478 1.61-3.643.842-1.565 2.277-2.315 4.02-2.5.542-.058 1.085-.12 1.738-.191"
    />
  </svg>
);
}

export default Marginfi;

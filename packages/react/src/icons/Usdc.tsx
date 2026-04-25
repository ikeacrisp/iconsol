import type { SVGProps } from "react";

export interface UsdcProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function Usdc({
  size = 24,
  ...props
}: UsdcProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 28 28"
    width={size}
    height={size}
    {...props}
  >
    <path
      fill="var(--fill-0, #0B53BF)"
      d="M14 28c7.732 0 14-6.268 14-14S21.732 0 14 0 0 6.268 0 14s6.268 14 14 14"
    />
    <path
      fill="var(--fill-0, white)"
      d="M11.48 5.609a8.764 8.764 0 0 0 0 16.782v1.803A10.49 10.49 0 0 1 3.5 14c0-4.935 3.396-9.074 7.98-10.194zm5.04-1.803A10.49 10.49 0 0 1 24.5 14c0 4.934-3.394 9.074-7.98 10.194V22.39c3.597-1.085 6.23-4.428 6.23-8.391s-2.633-7.306-6.23-8.391zm-1.645 4.07v1.406c1.526.3 2.44 1.305 2.599 2.898h-1.785c-.14-.849-.586-1.478-1.881-1.478-1.085 0-1.653.454-1.653 1.163 0 1.977 5.608.508 5.608 4.087 0 1.536-1.093 2.58-2.888 2.812v1.361h-1.75v-1.38c-1.839-.272-2.914-1.364-3.027-3.109h1.741c.193.954.71 1.646 2.275 1.646 1.2 0 1.908-.491 1.908-1.226 0-1.942-5.617-.595-5.617-4.191 0-1.448 1.05-2.42 2.72-2.633V7.875z"
    />
  </svg>
);
}

export default Usdc;

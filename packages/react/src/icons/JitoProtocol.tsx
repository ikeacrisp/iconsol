import type { SVGProps } from "react";

export interface JitoProtocolProps extends SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function JitoProtocol({
  size = 24,
  ...props
}: JitoProtocolProps) {
  return (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    overflow="visible"
    preserveAspectRatio="none"
    style={{
      display: "block",
    }}
    viewBox="0 0 20.004 8.227"
    width={size}
    height={size}
    {...props}
  >
    <g fill="var(--fill-0, white)">
      <path d="M5.321 4.37q0 1.526-1.043 2.557Q3.235 7.96 1.738 7.96H.25V6.485h1.486q.887.001 1.493-.607.605-.607.605-1.506L3.823.264H5.32zM6.39.334h1.487l-.024 1.45H6.378zm0 2.038h1.487v5.586H6.378zM10.47 1.856h2.554v1.487h-2.578V5.4q0 .457.29.769a.95.95 0 0 0 .725.313h1.549v1.475h-1.535q-1.054 0-1.78-.751-.725-.752-.725-1.832V.285h1.474l.024 1.57zM18.866 7.083q-.888.877-2.17.877c-.855 0-1.588-.294-2.176-.883-.587-.59-.88-1.31-.88-2.168q0-1.285.886-2.173.888-.89 2.17-.89t2.17.89.887 2.173c0 .857-.296 1.59-.887 2.174m-1.073-3.31q-.437-.44-1.097-.44t-1.115.457a1.53 1.53 0 0 0-.455 1.12q0 .661.455 1.118a1.5 1.5 0 0 0 1.115.458c.44 0 .821-.15 1.12-.452q.45-.452.45-1.125a1.64 1.64 0 0 0-.473-1.137" />
    </g>
  </svg>
);
}

export default JitoProtocol;

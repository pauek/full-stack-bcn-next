import React, { SVGProps } from "react";

export function CheckMark(props: SVGProps<SVGSVGElement> & { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size ?? "1em"}
      height={props.size ?? "1em"}
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="m8.5 16.586l-3.793-3.793a1 1 0 0 0-1.414 1.414l4.5 4.5a1 1 0 0 0 1.414 0l11-11a1 1 0 0 0-1.414-1.414L8.5 16.586Z"
      ></path>
    </svg>
  );
}
export default CheckMark;

import React, { SVGProps } from "react";

export default function ClipboardCopy(
  props: SVGProps<SVGSVGElement> & { size?: number },
) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size ?? 24}
      height={props.size ?? 24}
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M3 22V6h2v14h11v2H3Zm4-4V2h13v16H7Zm2-2h9V4H9v12Zm0 0V4v12Z"
      ></path>
    </svg>
  );
}

import React, { SVGProps } from "react"

export function SlideShow(props: SVGProps<SVGSVGElement> & { size: number }) {
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
        d="M13 17v3h5v2H6v-2h5v-3H4a1 1 0 0 1-1-1V4H2V2h20v2h-1v12a1 1 0 0 1-1 1h-7Zm-8-2h14V4H5v11Zm5-9l5 3.5l-5 3.5V6Z"
      ></path>
    </svg>
  )
}
export default SlideShow

import { SVGProps } from "react"

export function AttachmentIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M8.25 18q-2.6 0-4.425-1.825T2 11.75q0-2.6 1.825-4.425T8.25 5.5h9.25q1.875 0 3.188 1.313T22 10q0 1.875-1.312 3.188T17.5 14.5H8.75q-1.15 0-1.95-.8T6 11.75q0-1.15.8-1.95T8.75 9H18v2H8.75q-.325 0-.537.213T8 11.75q0 .325.213.538t.537.212h8.75q1.05-.025 1.775-.737T20 10q0-1.05-.725-1.775T17.5 7.5H8.25q-1.775-.025-3.012 1.225T4 11.75q0 1.75 1.238 2.975T8.25 16H18v2z"
      ></path>
    </svg>
  )
}

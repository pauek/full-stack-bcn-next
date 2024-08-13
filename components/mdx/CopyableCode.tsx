"use client"

import { useRef } from "react"
import ClipboardCopyButton from "../ClipboardCopyButton"

type Props = {
  children: React.ReactNode
}
export default function CopyableCode({ children }: Props) {
  const ref = useRef<HTMLPreElement>(null)
  return (
    <pre className="relative" ref={ref}>
      {children}
      <ClipboardCopyButton
        className="hidden sm:flex"
        size={18}
        onClick={() => navigator.clipboard.writeText(ref.current?.textContent ?? "")}
      />
    </pre>
  )
}

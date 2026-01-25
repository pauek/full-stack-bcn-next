"use client"

import { useEffect, useRef, useState } from "react"
import ClipboardCopyButton from "../ClipboardCopyButton"

// Languages that should NOT have the copy button (typically output/results)
const nonCopyableLanguages = new Set([
    "output",
    "result",
    "console",
    "log",
    "text",
    "plaintext",
    "txt",
])

export function CopyablePre({ children }: React.ComponentProps<"pre">) {
    return <SmartPre>{children}</SmartPre>
}

export function Pre({ children }: React.ComponentProps<"pre">) {
    return <pre className="relative">{children}</pre>
}

export function SmartPre({ children }: React.ComponentProps<"pre">) {
    const ref = useRef<HTMLPreElement>(null)
    // Start with false - only show copy button if we detect a valid language tag
    const [copyable, setCopyable] = useState(false)

    useEffect(() => {
        if (ref.current) {
            const codeEl = ref.current.querySelector("code")
            if (codeEl?.className) {
                const match = codeEl.className.match(/language-(\w+)/)
                if (match) {
                    // Only copyable if language is NOT in the non-copyable list
                    setCopyable(!nonCopyableLanguages.has(match[1]))
                }
                // No language tag = no copy button (stays false)
            }
        }
    }, [])

    return (
        <pre className="relative" ref={ref}>
            {children}
            {copyable && (
                <ClipboardCopyButton
                    className="hidden sm:flex"
                    size={18}
                    onClick={() => navigator.clipboard.writeText(ref.current?.textContent ?? "")}
                />
            )}
        </pre>
    )
}

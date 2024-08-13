import CopyableCode from "./CopyableCode"

export function CopyablePre({ children }: React.ComponentProps<"pre">) {
  return <CopyableCode>{children}</CopyableCode>
}

export function Pre({ children }: React.ComponentProps<"pre">) {
  return <pre className="relative">{children}</pre>
}

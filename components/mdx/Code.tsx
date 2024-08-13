import { iosevka } from "@/lib/fonts"
import { cn } from "@/lib/utils"

export default function Code2(props: React.ComponentProps<"code">) {
  return (
    <code {...props} className={cn(iosevka.className)}>
      {props.children}
    </code>
  )
}

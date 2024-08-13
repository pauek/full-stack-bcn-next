import { cn } from "@/lib/utils"

export default function Aside({ className, children }: React.ComponentProps<"aside">) {
  return (
    <div
      className={cn(
        "aside",
        className,
        "lg:absolute lg:w-[18em] left-full ml-3 mr-2",
        "text-[0.7rem] leading-3 text-secondary-foreground opacity-60",
      )}
    >
      {children}
    </div>
  )
}

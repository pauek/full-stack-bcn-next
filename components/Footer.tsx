import { cn } from "@/lib/utils"

export default async function Footer() {
  return (
    <footer
      className={cn(
        "w-full flex flex-col items-center pt-6 pb-3",
        "text-xs text-muted-foreground bg-secondary",
      )}
    >
      <div className="opacity-40">&copy; Pau Fernández, {new Date().getFullYear()}</div>
    </footer>
  )
}

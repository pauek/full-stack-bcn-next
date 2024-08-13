import { cn } from "@/lib/utils"

const HLine = () => <div className="h-0 border-t border-stone-300 flex-1" />

export default function PartHeader({ name }: { name: string }) {
  return (
    <h4
      className={cn(
        "w-full text-stone-400 mb-2 text-center uppercase font-semibold",
        "flex flex-row justify-center items-center gap-3 px-2",
      )}
    >
      <HLine />
      {name}
      <HLine />
    </h4>
  )
}

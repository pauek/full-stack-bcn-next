"use client" // <---- we need useSelectedLayoutSegments

import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSelectedLayoutSegments } from "next/navigation"

type TabButtonProps = {
  path: string
  name: string
  slug: string
}
export default function TabButton({ path, name, slug }: TabButtonProps) {
  const segments = useSelectedLayoutSegments()
  const lastSegment = segments.slice(-1)[0]
  return (
    <div
      className={cn(
        "p-0 ",
        (lastSegment === "(doc)" && slug === "") || slug === lastSegment
          ? "border-b-2 border-foreground text-foreground"
          : "text-muted-foreground",
      )}
    >
      <Link href={`${path}/${slug}`}>
        <div className="m-1 p-1 px-2 hover:bg-muted rounded transition-color text-sm">{name}</div>
      </Link>
    </div>
  )
}

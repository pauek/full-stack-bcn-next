"use client"

import { ContentPiece } from "@/lib/adt"
import Link from "next/link"
import { useSelectedLayoutSegments } from "next/navigation"
import DarkModeSwitch from "./DarkModeSwitch"

export default function Header({ course }: { course: ContentPiece }) {
  const [_c, _courseId] = useSelectedLayoutSegments()

  return (
    <header
      className={
        "fixed top-0 left-0 right-0 bg-card h-12 flex " +
        "flex-row items-center justify-between border-b z-20 shadow-sm overflow-visible"
      }
    >
      <Link href="/" className="font-bold ml-5 overflow-ellipsis">
        {course.name}
      </Link>

      <Link href="/m">Map</Link>

      <DarkModeSwitch className="mr-5" />
    </header>
  )
}

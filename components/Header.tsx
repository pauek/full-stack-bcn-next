import data from "@/lib/data"
import { env } from "@/lib/env.mjs"
import Link from "next/link"
import DarkModeSwitch from "./DarkModeSwitch"
import { MapIcon } from "./icons/MapIcon"

export default async function Header() {
  const course = await data.getPiece([env.COURSE_ID])
  if (!course) {
    throw new Error(`Course not found: "${env.COURSE_ID}"`)
  }
  return (
    <header
      className={
        "p-2 fixed top-0 left-0 right-0 flex flex-row items-center justify-between z-20 overflow-visible pointer-events-none"
      }
    >
      <div className="flex flex-row items-center gap-3 bg-card rounded-full shadow-lg px-3 h-9 pointer-events-auto">
        <Link href="/m">
          <MapIcon className="w-7 h-7 text-gray-600" />
        </Link>

        <Link href="/" className="font-bold overflow-ellipsis">
          {course.name}
        </Link>
      </div>

      <div className="flex flex-row items-center gap-3 bg-card rounded-full shadow-lg px-3 h-9 min-w-16 pointer-events-auto">
        <DarkModeSwitch />
      </div>
    </header>
  )
}

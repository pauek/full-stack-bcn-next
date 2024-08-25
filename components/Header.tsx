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

  const Floating = ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-row items-center gap-3 bg-card rounded-full shadow-md px-3 h-9 pointer-events-auto hover:bg-secondary">
      {children}
    </div>
  )

  return (
    <header
      className={
        "p-2 fixed top-0 left-0 right-0 flex flex-row items-center justify-between z-20 overflow-visible pointer-events-none"
      }
    >
      <div className="flex flex-row gap-2">
        <Link href="/" className="font-bold overflow-ellipsis">
          <Floating>{course.name}</Floating>
        </Link>
        <Link href="/m">
          <Floating>
            <MapIcon className="w-7 h-7 text-gray-600" />
          </Floating>
        </Link>
      </div>

      <Floating>
        <DarkModeSwitch />
      </Floating>
    </header>
  )
}

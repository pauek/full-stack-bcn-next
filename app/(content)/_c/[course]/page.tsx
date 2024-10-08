import Part from "@/components/Part"
import { hash } from "@/lib/adt"
import data from "@/lib/data"
import { env } from "@/lib/env.mjs"
import { unstable_cache } from "next/cache"

import { notFound } from "next/navigation"

const cachedGetContentTree = unstable_cache(data.getContentTree, ["contentTree"])

export default async function Page() {
  const isDevMode = process.env.NODE_ENV === "development"
  const rootPiece = await cachedGetContentTree([env.COURSE_ID], { level: isDevMode ? 3 : 2 })
  if (rootPiece === null) {
    notFound()
  }
  const { children } = rootPiece
  return (
    <div className="m-auto max-w-[38em]">
      <div className="w-full sm:w-[38em]">
        {children && children.map((part) => <Part key={hash(part)} part={part} />)}
      </div>
    </div>
  )
}

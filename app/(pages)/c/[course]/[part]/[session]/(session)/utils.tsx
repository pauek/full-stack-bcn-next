import data from "@/lib/data"
import { env } from "@/lib/env.mjs"
import { unstable_cache } from "next/cache"
import { notFound } from "next/navigation"

export type SessionPageProps = {
  params: {
    course: string
    part: string
    session: string
  }
}

export const getPieceWithChildrenOrNotFound = async ({ params }: SessionPageProps) => {
  const { course, part, session } = params
  const idpath = [course, part, session]
  const piece = await unstable_cache(
    async () => await data.getPieceWithChildren(idpath),
    ["piece-with-children", idpath.join("/")],
  )()
  if (piece === null) {
    notFound()
  }
  return piece
}

export const _generateStaticParams = async () => {
  const course = await data.getPiece([env.COURSE_ID])
  if (!course) {
    return []
  }
  const allIdPaths = await data.getAllIdpaths(course.idpath)
  return allIdPaths
    .filter((path) => path.length === 3)
    .map(([course, part, session]) => ({ course, part, session }))
}

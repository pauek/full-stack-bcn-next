import data from "@/lib/data"
import { unstable_cache } from "next/cache"
import { notFound } from "next/navigation"

export type SessionPageProps = {
  params: {
    course: string
    part: string
    session: string
  }
}

export const getSessionWithChaptersOrNotFound = async ({ params }: SessionPageProps) => {
  const { course, part, session } = params
  const idpath = [course, part, session]
  const piece = await unstable_cache(
    async () => await data.getPieceWithChildren(idpath),
    ["piece-with-children", idpath.join("/")],
  )()
  if (piece === null || piece.metadata.hidden) {
    notFound()
  }
  return piece
}

export const getSessionOrNotFound = async ({ params }: SessionPageProps) => {
  const { course, part, session } = params
  const idpath = [course, part, session]
  const piece = await unstable_cache(
    async () => await data.getPiece(idpath),
    ["piece-with-children", idpath.join("/")],
  )()
  if (piece === null || piece.metadata.hidden) {
    notFound()
  }
  return piece
}

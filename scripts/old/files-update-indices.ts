import { ContentPiece } from "@/lib/adt"
import { updateMetadata } from "@/lib/data/files/metadata"
import { getPieceWithChildren } from "@/lib/data/files/pieces"
import { getSessionSequence } from "@/lib/data/files/tree"
import { getDiskpathForPiece } from "@/lib/data/files/utils"
import { env } from "@/lib/env.mjs"

import { showExecutionTime } from "@/lib/utils"

const updateSessionChildren = async (parent: ContentPiece) => {
  // Chapters have an index with respect to the session
  const { idpath } = parent
  const piece = await getPieceWithChildren(idpath)
  if (!piece) {
    throw `Session "${idpath.join("/")}" not found!`
  }
  if (!piece.children) {
    return
  }
  for (let j = 0; j < piece.children.length; j++) {
    const child = piece.children[j]
    const diskpath = await getDiskpathForPiece(child)
    await updateMetadata(diskpath, async (metadata) => {
      metadata.index = j + 1
    })
  }
}

const updateSession = async (session: ContentPiece, index: number) => {
  const diskpath = await getDiskpathForPiece(session)

  // Sessions have an index with respect to the course (not parts)
  await updateMetadata(diskpath, async (metadata) => {
    console.log(`${index.toString().padStart(3)} - ${session.idpath.join("/")}`)
    metadata.index = index
  })
}

showExecutionTime(async () => {
  const sessions = await getSessionSequence(env.COURSE_ID)
  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i]
    await updateSession(session, i + 1)
    await updateSessionChildren(session)
  }
})

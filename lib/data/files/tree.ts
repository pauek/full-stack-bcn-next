import { ContentPiece } from "@/lib/adt"
import { getPiece, getPieceWithChildren } from "./pieces"

export const getContentTree = async (idpath: string[], { level = 2 }: { level: number }) => {
  const _getContentTree = async (idpath: string[], level: number) => {
    if (level === 0) {
      return await getPiece(idpath)
    }
    let root = await getPieceWithChildren(idpath)
    if (!root) {
      return null
    }
    if (root.children) {
      for (let i = 0; i < root.children.length; i++) {
        const childId = root.children[i].id
        const child = await _getContentTree([...idpath, childId], level - 1)
        root.children[i] = child!
      }
    }
    return root
  }

  return await _getContentTree(idpath, level)
}

export const getSessionSequence = async (courseId: string): Promise<ContentPiece[]> => {
  const course = await getContentTree([courseId], { level: 2 })
  const sessionSequence = []
  let k = 0
  for (const part of course?.children || []) {
    for (const session of part.children || []) {
      sessionSequence.push(session)
    }
  }
  return sessionSequence
}

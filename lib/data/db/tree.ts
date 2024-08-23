import { getPiece, getPieceWithChildren } from "./pieces"

type Options = {
  level: number
}
export const getContentTree = async (idpath: string[], { level }: Options) => {
  //
  const __getWithChildren = async (idpath: string[], level: number) => {
    const piece = await getPieceWithChildren(idpath)
    if (piece && piece.children) {
      const { children } = piece
      children.sort((a, b) => a.metadata.index - b.metadata.index)
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const childPiece = await _getContentTree(child.idpath, level - 1)
        if (childPiece) {
          children[i] = childPiece
        }
      }
    }
    return piece
  }

  const _getContentTree = async (idpath: string[], level: number) => {
    if (level === 0) {
      return await getPiece(idpath)
    } else {
      return __getWithChildren(idpath, level)
    }
  }

  return _getContentTree(idpath, level)
}

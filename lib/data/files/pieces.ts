import { ContentPiece } from "@/lib/adt"
import * as utils from "./utils"

export const pieceHasCover = async (piece: ContentPiece) =>
  (await utils.findCoverImageFilename(piece)) !== null

export const pieceHasDoc = async (piece: ContentPiece) => {
  const diskpath = await utils.getDiskpathForPiece(piece)
  const docFilename = await utils.findDocFilename(diskpath)
  return docFilename !== null
}

export const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const diskpath = await utils.findoutDiskpathFromIdpath(idpath)
  if (diskpath === null) {
    return null
  }
  const parentIdpath = idpath.slice(0, -1)
  return utils.readPieceAtDiskpath(diskpath, parentIdpath)
}

export const getPieceWithChildren = async (idpath: string[]): Promise<ContentPiece | null> => {
  const piece = await utils.getPieceAndPathWithChildren(idpath)
  return piece === null ? null : piece.piece
}

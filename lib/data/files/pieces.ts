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
    const diskpath = await utils.findDiskpathFromIdpath(idpath)
    if (diskpath === null) {
        return null
    }
    const parentIdpath = idpath.slice(0, -1)
    const piece = await utils.readPieceAtDiskpath(diskpath, parentIdpath)
    piece.metadata.index = await utils.computeIndexFromSiblings(diskpath)
    return piece
}

export const getPieceWithChildren = async (idpath: string[]): Promise<ContentPiece | null> => {
    const result = await utils.getPieceAndPathWithChildren(idpath)
    if (result === null) {
        return null
    }
    result.piece.metadata.index = await utils.computeIndexFromSiblings(result.diskpath)
    return result.piece
}

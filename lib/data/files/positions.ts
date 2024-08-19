import { AllAttachmentTypes, FileType, type MapPosition } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { IRectangle } from "@/lib/geometry"
import { TreeNode } from "@/lib/tree"
import { readFile } from "fs/promises"
import { join } from "path"
import { Hash } from "../hashing"
import { getPieceAttachmentList, updateMarkdownMetadata } from "./attachments"
import { getDiskpathByHash, getDiskpathByIdpath } from "./hashmaps"
import { readMetadata, updateMetadata } from "./metadata"
import { getPieceWithChildren } from "./pieces"
import {
  filesGetRoot,
  filesWalkContentPieces,
  fileTypeInfo,
  getDiskpathForPiece,
  readAttachmentMetadata,
} from "./utils"

const checkMapPosition = (metadata: Record<string, any>, piece: ContentPiece) => {
  // Check mapPosition has the fields that we expect
  const { left, top, width, height } = metadata.mapPosition
  if (
    typeof left !== "number" ||
    typeof top !== "number" ||
    typeof width !== "number" ||
    typeof height !== "number"
  ) {
    throw new Error(
      `Invalid mapPosition for ${piece.idpath.join("/")}: ${JSON.stringify(metadata.mapPosition)}`
    )
  }
  return { left, top, width, height }
}

export const extendedMapPositionForPiece = async (
  piece: ContentPiece
): Promise<MapPosition<string> | null> => {
  const diskpath = await getDiskpathForPiece(piece)
  const metadata = await readMetadata(diskpath)
  if (metadata.mapPosition) {
    const { left, top, width, height } = checkMapPosition(metadata, piece)

    // Get children
    const pieceWithChildren = await getPieceWithChildren(piece.idpath)
    if (!pieceWithChildren) {
      throw new Error(`Piece not found for idpath "${piece.idpath.join("/")}"????`)
    }

    const { children } = pieceWithChildren

    // Children are other pieces and also attachments
    let childrenHashes: string[] = []
    if (children) {
      childrenHashes = children.map((ch) => ch.hash)
    }
    for (const type of AllAttachmentTypes) {
      const attachmentHashes = (await getPieceAttachmentList(piece, type)).map((a) => a.hash)
      childrenHashes = childrenHashes.concat(attachmentHashes)
    }
    
    return {
      kind: "piece",
      hash: piece.hash,
      name: piece.name,
      rectangle: { left, top, width, height },
      children: childrenHashes,
      idpath: piece.idpath,
      level: metadata.level,
    }
  } else {
    return null
  }
}

const extendedMapPositionForAttachments = async (piece: ContentPiece) => {
  const positions: MapPosition<string>[] = []
  for (const type of AllAttachmentTypes) {
    const info = fileTypeInfo[type]
    const attachments = await getPieceAttachmentList(piece, type)
    for (const attachment of attachments) {
      const diskpath = await getDiskpathForPiece(piece)
      const bytes = await readFile(join(diskpath, info.subdir, attachment.filename))
      const metadata = await readAttachmentMetadata(piece.idpath, attachment.filename, bytes)
      if (metadata && metadata.mapPosition) {
        const { left, top, width, height } = checkMapPosition(metadata, piece)
        positions.push({
          kind: type,
          hash: attachment.hash,
          idpath: piece.idpath,
          name: attachment.filename,
          rectangle: { left, top, width, height },
          level: 0,
        })
      }
    }
  }
  return positions
}

export const getMapPositionsExtended = async (): Promise<MapPosition<number>[]> => {
  //  Hay que devolver los items ordenados por nivel, para pintarlos en el orden correcto.

  const root = await filesGetRoot()
  const positions: MapPosition<Hash>[] = []

  await filesWalkContentPieces(root.idpath, async ({ piece }) => {
    const piecePos = await extendedMapPositionForPiece(piece)
    if (piecePos) {
      positions.push(piecePos)
    }
    const attachmentPositions = await extendedMapPositionForAttachments(piece)
    for (const attPos of attachmentPositions) {
      positions.push(attPos)
    }
  })

  // We sort the results here, instead of in the query (can't do it in Drizzle??)
  positions.sort((p1, p2) => {
    const lev1 = p1.level || -1
    const lev2 = p2.level || -1
    return lev2 - lev1 // reverse sorted!
  })

  // Compute tree (children indices)
  const lookup = (hash: string) => {
    const index = positions.findIndex((p) => p.hash === hash)
    return index === -1 ? null : index
  }
  const childrenIndices = (children?: string[]) => children?.map(lookup).filter((ch) => ch !== null)

  return positions.map((pos) => ({
    ...pos,
    children: childrenIndices(pos.children),
  }))
}

export const updatePiecePosition = async (hash: string, rectangle: IRectangle) => {
  const diskpath = await getDiskpathByHash(hash)
  if (diskpath === null) {
    throw new Error(`Diskpath not found for hash ${hash}`)
  }
  const { left, top, width, height } = rectangle
  updateMetadata(diskpath, async (metadata) => {
    metadata.mapPosition = { left, top, width, height }
  })
}

export const updateMarkdownPosition = (filetype: FileType) => async (pos: MapPosition<number>) => {
  const diskpath = await getDiskpathByIdpath(pos.idpath)
  if (diskpath === null) {
    throw new Error(`Diskpath not found for hash ${pos.idpath.join("/")}`)
  }
  updateMarkdownMetadata(pos.idpath, filetype, pos.name, { mapPosition: pos.rectangle })
}

export const updatePiecePositionFromMapPosition = async (pos: MapPosition<number>) =>
  updatePiecePosition(pos.hash, pos.rectangle)

type UpdateFunc = (pos: MapPosition<number>) => Promise<void>
const updateFunctionTable = new Map<any, UpdateFunc>([
  ["piece", updatePiecePositionFromMapPosition],
  [FileType.exercise, updateMarkdownPosition(FileType.exercise)],
  [FileType.doc, updateMarkdownPosition(FileType.doc)],
])
export const updateMapPositions = async (poslist: MapPosition<number>[]) => {
  for (const pos of poslist) {
    const func = updateFunctionTable.get(pos.kind)
    if (!func) {
      throw new Error(`Invalid kind ${pos.kind}`)
    }
    await func(pos)
  }
}

export const assignPosition = async (node: TreeNode) => {
  const { level } = node
  if (level !== 1) {
    throw new Error(`Expected level 1, got ${level}`)
  }

  let y = 10
  for (const part of node.children) {
    // Assign parts
    let partHeight = 0
    let maxSessionWidth = 0
    for (const session of part.children) {
      let x = 20
      for (const chapter of session.children) {
        const rect = { left: x, top: y, width: 200, height: 50 }
        updatePiecePosition(chapter.hash, rect)
        x += 210
      }
      const sessionWidth = Math.max(x, 220)
      const rect = { left: 10, top: y + 10, width: sessionWidth, height: 70 }
      updatePiecePosition(session.hash, rect)
      y += 90
      partHeight += 90
      maxSessionWidth = Math.max(maxSessionWidth, sessionWidth)
    }
    const width = Math.max(maxSessionWidth + 20, 200)
    const rect = { left: 0, top: y - partHeight, width, height: partHeight }
    updatePiecePosition(part.hash, rect)
    y += 80
  }
}

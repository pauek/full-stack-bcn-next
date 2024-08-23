import { AllAttachmentTypes, FileType, type MapPosition } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { IRectangle } from "@/lib/geometry"
import { readFile } from "fs/promises"
import { join } from "path"
import { Hash } from "../hashing"
import { getPieceAttachmentList, updateMarkdownMetadata } from "./attachments"
import { getDiskpathByIdpath } from "./hashmaps"
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
  piece: ContentPiece,
  index: number
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
      index,
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
    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i]
      const diskpath = await getDiskpathForPiece(piece)
      const bytes = await readFile(join(diskpath, info.subdir, attachment.filename))
      const metadata = await readAttachmentMetadata(piece.idpath, attachment.filename, bytes)
      if (metadata && metadata.mapPosition) {
        const { left, top, width, height } = checkMapPosition(metadata, piece)
        positions.push({
          kind: type,
          index: i,
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

  await filesWalkContentPieces(root.idpath, async ({ piece, index }) => {
    const piecePos = await extendedMapPositionForPiece(piece, index)
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

export const updatePiecePosition = async (idpath: string[], rectangle: IRectangle) => {
  const diskpath = await getDiskpathByIdpath(idpath)
  if (diskpath === null) {
    throw new Error(`Diskpath not found for idjpath ${idpath.join("/")}`)
  }
  const { left, top, width, height } = rectangle
  updateMetadata(diskpath, async (metadata) => {
    metadata.mapPosition = { left, top, width, height }
  })
}

export interface PositionUpdate {
  hash: string // only needed for "piece"
  kind: "piece" | FileType
  idpath: string[]
  name: string
  rectangle: IRectangle
}

const _updateMarkdownPosition = (filetype: FileType) => async (pos: PositionUpdate) => {
  const diskpath = await getDiskpathByIdpath(pos.idpath)
  if (diskpath === null) {
    throw new Error(`Diskpath not found for hash ${pos.idpath.join("/")}`)
  }
  updateMarkdownMetadata(pos.idpath, filetype, pos.name, { mapPosition: pos.rectangle })
}

export const updateDocPosition = _updateMarkdownPosition(FileType.doc)
export const updateExercisePosition = _updateMarkdownPosition(FileType.exercise)
export const updateQuizPosition = _updateMarkdownPosition(FileType.quiz)

export const updatePiecePositionFromMapPosition = async (pos: PositionUpdate) =>
  updatePiecePosition(pos.idpath, pos.rectangle)

type UpdateFunc = (pos: PositionUpdate) => Promise<void>
const updateFunctionTable = new Map<"piece" | FileType, UpdateFunc>([
  ["piece", updatePiecePositionFromMapPosition],
  [FileType.doc, updateDocPosition],
  [FileType.exercise, updateExercisePosition],
  [FileType.quiz, updateQuizPosition],
])
export const updateMapPositions = async (poslist: PositionUpdate[]) => {
  for (const pos of poslist) {
    const func = updateFunctionTable.get(pos.kind)
    if (!func) {
      throw new Error(`Invalid kind ${pos}`)
    }
    await func(pos)
  }
}

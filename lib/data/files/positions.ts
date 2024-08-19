import { AllAttachmentTypes, FileType, type MapPosition } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { IRectangle } from "@/lib/geometry"
import { TreeNode } from "@/lib/tree"
import { readFile } from "fs/promises"
import { join } from "path"
import { Hash } from "../hashing"
import { getPieceAttachmentList } from "./attachments"
import { getDiskpathByHash } from "./hashmaps"
import { readMetadata, updateMetadata } from "./metadata"
import { getPieceWithChildren } from "./pieces"
import {
  filesGetRoot,
  filesWalkContentPieces,
  fileTypeInfo,
  getDiskpathForPiece,
  readAttachmentMetadata
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
    let children: string[] = []
    if (pieceWithChildren.children) {
      children = pieceWithChildren.children.map((ch) => ch.hash)
    }

    return {
      kind: "piece",
      hash: piece.hash,
      name: piece.name,
      rectangle: { left, top, width, height },
      children,
      idpath: piece.idpath,
      level: pieceWithChildren.metadata.level,
    }
  } else {
    return null
  }
}

const extendedMapPositionForAttachments = async (piece: ContentPiece) => {
  const positions: MapPosition<string>[] = []
  for (const type of AllAttachmentTypes) {
    const info = fileTypeInfo[type]
    const exercises = await getPieceAttachmentList(piece, type)
    for (const exercise of exercises) {
      const diskpath = await getDiskpathForPiece(piece)
      const bytes = await readFile(join(diskpath, info.subdir, exercise.filename))
      const metadata = await readAttachmentMetadata(type, bytes)
      if (metadata && metadata.mapPosition) {
        const { left, top, width, height } = checkMapPosition(metadata, piece)
        positions.push({
          kind: FileType.exercise,
          hash: exercise.hash,
          name: exercise.filename,
          rectangle: { left, top, width, height },
          idpath: [...piece.idpath, "exercise", exercise.filename],
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
    const mapPos = await extendedMapPositionForPiece(piece)
    if (mapPos) {
      positions.push(mapPos)
    }
    const attachmentPositions = await extendedMapPositionForAttachments(piece)
    for (const position of attachmentPositions) {
      positions.push(position)
    }
  })

  // We sort the results here, instead of in the query (can't do it in Drizzle??)
  positions.sort((p1, p2) => {
    const lev1 = p1.level || -1
    const lev2 = p2.level || -1
    return lev2 - lev1 // reverse sorted!
  })

  const maybeFind = (hash: string) => {
    const index = positions.findIndex((it) => it.hash === hash)
    if (index === -1) {
      return null
    }
    return index
  }

  // Once sorted, we want to relate the children to their parents by an index
  // so the children are just an index to the parent.
  const cleanResults = positions.map((pos) => {
    const childrenIndices = pos.children?.map((ch) => maybeFind(ch)).filter((ch) => ch !== null)

    return {
      kind: pos.kind,
      rectangle: { ...pos.rectangle },
      name: pos.name,
      hash: pos.hash,
      idpath: pos.idpath,
      level: pos.level,
      children: childrenIndices,
    }
  })

  return cleanResults
}

export const updatePosition = async (hash: string, mapPosition: IRectangle) => {
  const diskpath = await getDiskpathByHash(hash)
  if (diskpath === null) {
    throw new Error(`Diskpath not found for hash ${hash}`)
  }
  const { left, top, width, height } = mapPosition
  updateMetadata(diskpath, async (metadata) => {
    metadata.mapPosition = { left, top, width, height }
  })
}

export const updateMapPositions = async (poslist: MapPosition<number>[]) => {
  for (const pos of poslist) {
    await updatePosition(pos.hash, pos.rectangle)
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
        updatePosition(chapter.hash, rect)
        x += 210
      }
      const sessionWidth = Math.max(x, 220)
      const rect = { left: 10, top: y + 10, width: sessionWidth, height: 70 }
      updatePosition(session.hash, rect)
      y += 90
      partHeight += 90
      maxSessionWidth = Math.max(maxSessionWidth, sessionWidth)
    }
    const width = Math.max(maxSessionWidth + 20, 200)
    const rect = { left: 0, top: y - partHeight, width, height: partHeight }
    updatePosition(part.hash, rect)
    y += 80
  }
}

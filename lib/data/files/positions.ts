import type { MapPosition, MapPositionExtended } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { IRectangle } from "@/lib/geometry"
import { TreeNode } from "@/lib/tree"
import { hashToDiskpath } from "../hash-maps"
import { getPieceWithChildren } from "./backend"
import { readMetadata, updateMetadata } from "./metadata"
import { filesGetRoot, filesWalkContentPieces } from "./utils"

export const extendedMapPositionForPiece = async (piece: ContentPiece) => {
  const metadata = await readMetadata(piece.diskpath)
  if (metadata.mapPosition) {
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
      pieceHash: piece.hash,
      name: piece.name,
      left,
      top,
      width,
      height,
      children,
      idjpath: piece.idpath.join("/"),
      level: pieceWithChildren.metadata.level,
    }
  }
}

type Position = NonNullable<Awaited<ReturnType<typeof extendedMapPositionForPiece>>>

export const getMapPositionsExtended = async (): Promise<MapPositionExtended[]> => {
  //  Hay que devolver los items ordenados por nivel, para pintarlos en el orden correcto.

  const root = await filesGetRoot()
  const positions: Position[] = []
  await filesWalkContentPieces(root, async (piece) => {
    const mapPos = await extendedMapPositionForPiece(piece)
    if (mapPos) {
      positions.push(mapPos)
    }
  })

  // We sort the results here, instead of in the query (can't do it in Drizzle??)
  positions.sort((p1, p2) => {
    const lev1 = p1.level || -1
    const lev2 = p2.level || -1
    return lev2 - lev1 // reverse sorted!
  })

  const maybeFind = (hash: string) => {
    const index = positions.findIndex((it) => it.pieceHash === hash)
    if (index === -1) {
      return null
    }
    return index
  }

  // Once sorted, we want to relate the children to their parents by an index
  // so the children are just an index to the parent.
  const cleanResults = positions.map((pos) => {
    const childrenIndices = pos.children.map((ch) => maybeFind(ch)).filter((ch) => ch !== null)

    return {
      left: pos.left,
      top: pos.top,
      width: pos.width,
      height: pos.height,
      name: pos.name,
      pieceHash: pos.pieceHash,
      idjpath: pos.idjpath,
      level: pos.level,
      children: childrenIndices,
    }
  })

  return cleanResults
}

export const updatePosition = async (hash: string, mapPosition: IRectangle) => {
  const diskpath = await hashToDiskpath(hash)
  if (!diskpath) {
    throw new Error(`Could not find diskpath for hash ${hash}`)
  }
  const { left, top, width, height } = mapPosition
  updateMetadata(diskpath, async (metadata) => {
    metadata.mapPosition = { left, top, width, height }
  })
  console.log(
    `Updated position for ${hash}: ${mapPosition.left}, ${mapPosition.top}, ${mapPosition.width}, ${mapPosition.height}`
  )
}

export const updateMapPositions = async (rectlist: MapPosition[]) => {
  for (const rect of rectlist) {
    await updatePosition(rect.pieceHash, rect)
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

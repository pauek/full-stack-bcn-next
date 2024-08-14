import { ContentPiece } from "@/lib/adt"
import { filesBackend, getPieceWithChildren, readMetadata } from "."
import { getRoot } from "../root"

export const extendedMapPositionForPiece = async (piece: ContentPiece) => {
  const metadata = await readMetadata(piece.diskpath)
  if (metadata.mapPosition) {
    // Check mapPosition has the fields that we expect
    const { left, top, width, height } = metadata.mapPosition
    if (!left || !top || !width || !height) {
      throw new Error(`Invalid mapPosition for ${piece.idpath.join("/")}`)
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

type MapPositionExtended = NonNullable<Awaited<ReturnType<typeof extendedMapPositionForPiece>>>

export const filesMapPositionsGetAll = async () => {
  //  Hay que devolver los items ordenados por nivel, para pintarlos en el orden correcto.

  const root = await getRoot(filesBackend)
  const positions: MapPositionExtended[] = []
  await filesBackend.walkContentPieces(root, async (piece) => {
    const mapPos = await extendedMapPositionForPiece(piece)
    if (mapPos) {
      positions.push(mapPos);
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
    return { hash, index }
  }

  // Once sorted, we want to relate the children to their parents by an index
  // so the children are just an index to the parent.
  const cleanResults = positions.map((pos) => {
    const childrenIndices = pos.children
      .map((ch) => maybeFind(ch))
      .filter((ch) => ch !== null)

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

export type MapPositionWithPiece = Awaited<ReturnType<typeof filesMapPositionsGetAll>>[number]

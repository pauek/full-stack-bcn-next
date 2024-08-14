import { MapPosition, mapPositions } from "@/data/schema"
import { eq } from "drizzle-orm"
import { db } from "./db"

export const dbMapPositionsGetAll = async () => {
  //  Hay que devolver los items ordenados por nivel, para pintarlos en el orden correcto.
  const positions = await db.query.mapPositions.findMany({
    with: {
      piece: {
        columns: { name: true },
        with: {
          children: {
            columns: { childHash: true },
          },
          hashmapEntry: {
            columns: { idjpath: true, level: true },
          },
        },
      },
    },
  })

  // We sort the results here, instead of in the query (can't do it in Drizzle??)
  positions.sort((p1, p2) => {
    const lev1 = p1.piece.hashmapEntry?.level || -1
    const lev2 = p2.piece.hashmapEntry?.level || -1
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
    if (pos.piece.hashmapEntry === null) {
      throw new Error(`Piece ${pos.piece.name} has no hashmap entry`)
    }
    const childrenIndices = pos.piece.children
      .map((ch) => maybeFind(ch.childHash))
      .filter((ch) => ch !== null)

    return {
      left: pos.left,
      top: pos.top,
      width: pos.width,
      height: pos.height,
      name: pos.piece.name,
      pieceHash: pos.pieceHash,
      idjpath: pos.piece.hashmapEntry.idjpath,
      level: pos.piece.hashmapEntry.level,
      children: childrenIndices,
    }
  })

  return cleanResults
}

export type MapPositionWithPiece = Awaited<ReturnType<typeof dbMapPositionsGetAll>>[number]

export const dbMapPositionsUpdate = async (positionList: MapPosition[]) => {
  for (const position of positionList) {
    await db
      .update(mapPositions)
      .set(position)
      .where(eq(mapPositions.pieceHash, position.pieceHash))
  }
}

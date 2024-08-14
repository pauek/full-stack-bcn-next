import { MapPosition, mapPositions } from "@/data/schema"
import { eq } from "drizzle-orm"
import { db } from "./db"

export const dbMapPositionsGetAll = async () => {
  /*
     Hay que devolver los items ordenados por nivel, para pintarlos en el orden correcto.
  */
  const results = await db.query.mapPositions.findMany({
    with: {
      piece: {
        columns: { name: true },
        with: {
          children: {
            columns: {
              childHash: true,
            },
          },
          hashmapEntry: {
            columns: {
              idjpath: true,
              level: true,
            },
          },
        },
      },
    },
  })

  // We sort the results here, instead of in the query (can't do it in Drizzle??)
  results.sort((a, b) => {
    const alev = a.piece.hashmapEntry?.level || -1
    const blev = b.piece.hashmapEntry?.level || -1
    return blev - alev
  })

  const mustFind = (hash: string) => {
    const index = results.findIndex((it) => it.pieceHash === hash)
    if (index === -1) {
      throw new Error(`Could not find piece with hash ${hash}`)
    }
    return { hash, index }
  }

  // Once sorted, we want to relate the children to their parents by an index
  // so the children are just an index to the parent.
  const cleanResults = results.map((result) => {
    if (result.piece.hashmapEntry === null) {
      throw new Error(`Piece ${result.piece.name} has no hashmap entry`)
    }
    return {
      left: result.left,
      top: result.top,
      width: result.width,
      height: result.height,
      name: result.piece.name,
      pieceHash: result.pieceHash,
      idjpath: result.piece.hashmapEntry.idjpath,
      level: result.piece.hashmapEntry.level,
      children: result.piece.children.map((ch) => mustFind(ch.childHash)),
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

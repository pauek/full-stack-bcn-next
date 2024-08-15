import { MapPosition, MapPositionExtended } from "@/data/schema"
import { db } from "./db"

export const getMapPositions = async () => {
  const pieces = await db.query.pieces.findMany({
    columns: {
      pieceHash: true,
      metadata: true,
    },
  })
  return pieces.map(({ pieceHash, metadata }) => {
    const { left, top, width, height } = metadata
    return { pieceHash, left, top, width, height }
  })
}

export const getMapPositionsExtended = async (): Promise<MapPositionExtended[]> => {
  //  Hay que devolver los items ordenados por nivel, para pintarlos en el orden correcto.
  const positions = await db.query.hashmap.findMany({
    columns: {
      idpath: true,
      pieceHash: true,
      level: true,
    },
    with: {
      piece: {
        columns: {
          name: true,
          metadata: true,
        },
        with: {
          children: {
            columns: { childHash: true },
          },
        },
      },
    },
  })

  // We sort the results here, instead of in the query (can't do it in Drizzle??)
  positions.sort((p1, p2) => p2.level - p1.level)

  const maybeFind = (hash: string) => {
    const index = positions.findIndex((it) => it.pieceHash === hash)
    if (index === -1) {
      return null
    }
    return index
  }

  // Once sorted, we want to relate the children to their parents by an index
  // so the children are just an index to the parent.
  const cleanResults = positions
    .map((pos) => {
      const childrenIndices = pos.piece.children
        .map((ch) => maybeFind(ch.childHash))
        .filter((ch) => ch !== null)

      const {
        idpath,
        pieceHash,
        level,
        piece: { name, metadata },
      } = pos

      return {
        ...metadata.mapPosition,
        name,
        pieceHash,
        idpath,
        level,
        children: childrenIndices,
      }
    })
    .filter((x) => x !== null)

  return cleanResults
}

export type MapPositionWithPiece = Awaited<ReturnType<typeof getMapPositionsExtended>>[number]

export const updateMapPositions = async (positionList: MapPosition[]) => {
  throw new Error("Not implemented on purpose!!")
}

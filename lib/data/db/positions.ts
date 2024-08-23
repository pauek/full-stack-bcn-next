import { FileType, MapPosition } from "@/data/schema"
import { db } from "./db"

const mapPositionsForPieces = async () => {
  return await db.query.hashmap.findMany({
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
          attachments: {
            columns: { fileHash: true, filetype: true, filename: true },
            with: {
              file: {
                columns: { metadata: true },
              },
            },
          },
        },
      },
    },
  })
}

type PositionResult = Awaited<ReturnType<typeof mapPositionsForPieces>>

export const getMapPositionsExtended = async (): Promise<MapPosition<number>[]> => {
  //  Hay que devolver los items ordenados por nivel, para pintarlos en el orden correcto.
  const positions: MapPosition<string>[] = []

  for (const mapPos of await mapPositionsForPieces()) {
    const { piece, idpath, pieceHash, level } = mapPos

    // Children
    const childrenHashes = piece.children.map((ch) => ch.childHash)
    const mapPosition: MapPosition<string> = {
      index: piece.metadata.index,
      kind: "piece",
      name: piece.name,
      hash: pieceHash,
      idpath,
      level,
      rectangle: piece.metadata.mapPosition,
      children: childrenHashes,
    }
    positions.push(mapPosition)

    // Attachments
    const { attachments } = piece
    for (let i = 0; i < attachments.length; i++) {
      const attachment = attachments[i]
      positions.push({
        index: i,
        kind: attachment.filetype as FileType,
        name: attachment.filename,
        hash: attachment.fileHash,
        idpath,
        level: 0,
        rectangle: attachment.file.metadata?.mapPosition,
      })
    }
  }

  // We sort the results here, instead of in the query (can't do it in Drizzle??)
  positions.sort((p1, p2) => p2.level - p1.level)


  // Now we need to convert the children from hashes to indices
  const maybeFind = (hash: string) => {
    const index = positions.findIndex((it) => it.hash === hash)
    if (index === -1) {
      return null
    }
    return index
  }

  // Once sorted, we want to relate the children to their parents by an index
  // so the children are just an index to the parent.
  const childrenToIndices: MapPosition<number>[] = positions
    .map((pos) => {
      const childrenIndices = pos.children?.map((h) => maybeFind(h)).filter((ch) => ch !== null)
      return {
        ...pos,
        children: childrenIndices,
      }
    })
    .filter((x) => x !== null)

  return childrenToIndices
}

export type MapPositionWithPiece = Awaited<ReturnType<typeof getMapPositionsExtended>>[number]

export const updateMapPositions = async (positionList: MapPosition<number>[]) => {
  throw new Error("Not implemented on purpose!!")
}

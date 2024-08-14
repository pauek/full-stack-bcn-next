import * as schema from "@/data/schema"
import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { base64ToBytes, lastItem } from "@/lib/utils"
import { eq } from "drizzle-orm"
import { FileBuffer } from "../data-backend"
import { db } from "./db"
import { getFileData, getPieceFilesByFiletype, pathToHash, pieceHasFiletype } from "./utils"

export const pieceHasCover = (piece: ContentPiece) => pieceHasFiletype(piece.hash, FileType.cover)
export const pieceHasDoc = (piece: ContentPiece) => pieceHasFiletype(piece.hash, FileType.doc)

export const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const result = await db.query.hashmap.findFirst({
    where: eq(schema.hashmap.idjpath, idpath.join("/")),
    with: {
      piece: {
        columns: {
          pieceHash: true,
          name: true,
          metadata: true,
          diskpath: true,
        },
      },
    },
  })
  if (!result) {
    console.log(`getPiece: piece not found for idpath "${idpath.join("/")}"`)
    return null
  }

  return {
    ...result.piece,
    hash: result.pieceHash,
    id: lastItem(idpath),
    idpath,
    children: [],
  }
}

export const getPieceWithChildren = async (idpath: string[]): Promise<ContentPiece | null> => {
  const result = await db.query.hashmap.findFirst({
    where: eq(schema.hashmap.idjpath, idpath.join("/")),
    with: { piece: { with: { children: { with: { child: true } } } } },
  })
  if (!result) {
    return null
  }
  const { piece: dbPiece } = result
  const piece: ContentPiece = {
    ...dbPiece,
    hash: dbPiece.pieceHash,
    idpath,
    id: lastItem(idpath),
    children: [],
    metadata: dbPiece.metadata,
  }
  const children: ContentPiece[] = []
  for (const { child } of dbPiece.children) {
    if (child.metadata.hidden) {
      continue
    }
    const result = await db.query.hashmap.findFirst({
      where: eq(schema.hashmap.pieceHash, child.pieceHash),
    })
    if (!result) {
      throw Error(`getPieceWithChildren: ijdpath for child hash not found "${child.pieceHash}"`)
    }
    const { idjpath } = result
    const idpath = idjpath.split("/")
    children.push({
      ...child,
      hash: child.pieceHash,
      id: idpath.slice(-1)[0],
      idpath,
      metadata: child.metadata,
    })
  }
  piece.children = children
  return piece
}

export const getPieceDocument = async (piece: ContentPiece): Promise<FileBuffer | null> => {
  const hash = await pathToHash(piece.idpath)
  if (!hash) {
    return null
  }
  const [result] = await getPieceFilesByFiletype(hash, FileType.doc)
  if (!result) {
    return null
  }
  const data = await getFileData(result.hash)
  if (data === null) {
    console.warn(`Content piece "${piece.idpath.join("/")}" [${hash}] has a dangling document!
      [file_hash = ${result.hash}]
      [pieceHash = ${hash}]
  `)
    return null
  }
  return { name: result.filename, buffer: Buffer.from(base64ToBytes(data)) }
}

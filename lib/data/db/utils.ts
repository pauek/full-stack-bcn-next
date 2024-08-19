import * as schema from "@/data/schema"
import { FileType } from "@/data/schema"
import { and, eq } from "drizzle-orm"
import { db } from "./db"
import { Hash } from "../hashing"

// export const fromDbPiece = (idpath: string[], dbPiece: DBPiece): ContentPiece => {
//   return {
//     hash: dbPiece.piece_hash,
//     name: dbPiece.name,
//     diskpath: dbPiece.diskpath,
//     id: lastItem(idpath),
//     idpath,
//     children: [],
//     metadata: dbPiece.metadata,
//   };
// };

export const getPieceFilesByFiletype = async (
  pieceHash: string,
  filetype: FileType,
  options?: { limit: number },
) => {
  // find file starting with cover associated with piece
  const result = await db
    .select({
      hash: schema.files.hash,
      filename: schema.attachments.filename,
      filetype: schema.attachments.filetype,
    })
    .from(schema.pieces)
    .innerJoin(schema.attachments, eq(schema.pieces.pieceHash, schema.attachments.pieceHash))
    .innerJoin(schema.files, eq(schema.attachments.fileHash, schema.files.hash))
    .where(and(eq(schema.pieces.pieceHash, pieceHash), eq(schema.attachments.filetype, filetype)))
    .limit(options?.limit ? options.limit : 1000)
  return result
}

export const getFileContent = async (fileHash: string) => {
  const [result] = await db
    .select({ data: schema.files.data, metadata: schema.files.metadata })
    .from(schema.files)
    .where(eq(schema.files.hash, fileHash))
    .limit(1)

  if (!result) {
    return null
  }
  return result
}

export const pieceHasFiletype = async (pieceHash: string, filetype: FileType): Promise<boolean> =>
  (await getPieceFilesByFiletype(pieceHash, filetype)).length > 0

export const pathToHash = async (idpath: string[]): Promise<Hash | null> => {
  const mapItem = await db.query.hashmap.findFirst({
    where: eq(schema.hashmap.idpath, idpath),
  })
  if (!mapItem) {
    return null
  }
  const { pieceHash: hash } = mapItem
  return hash
}

export const hashToPath = async (hash: string): Promise<string[] | null> => {
  const mapItem = await db.query.hashmap.findFirst({
    where: eq(schema.hashmap.pieceHash, hash),
  })
  if (!mapItem) {
    return null
  }
  return mapItem.idpath
}

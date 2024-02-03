import * as schema from "@/data/schema";
import { DBPiece, FileTypeEnum } from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import { lastItem } from "@/lib/utils";
import { and, eq, sql } from "drizzle-orm";
import { db } from "./db";

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
  filetype: FileTypeEnum,
  options?: { limit: number }
) => {
  // find file starting with cover associated with piece
  const result = await db
    .select({ name: schema.attachments.filename, hash: schema.files.hash })
    .from(schema.pieces)
    .innerJoin(schema.attachments, eq(schema.pieces.pieceHash, schema.attachments.pieceHash))
    .innerJoin(schema.files, eq(schema.attachments.fileHash, schema.files.hash))
    .where(and(eq(schema.pieces.pieceHash, pieceHash), eq(schema.attachments.filetype, filetype)))
    .orderBy(schema.pieces.diskpath)
    .limit(options?.limit ? options.limit : 1000);
  return result;
};

export const getFileData = async (fileHash: string) => {
  const [result] = await db
    .select({ data: schema.files.data })
    .from(schema.files)
    .where(eq(schema.files.hash, fileHash))
    .limit(1);

  if (!result) {
    return null;
  }
  return result.data;
};

export const pieceHasFiletype = async (
  pieceHash: string,
  filetype: FileTypeEnum
): Promise<boolean> => getPieceFilesByFiletype(pieceHash, filetype) !== null;

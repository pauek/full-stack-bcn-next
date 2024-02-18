import * as schema from "@/data/schema";
import { FileType } from "@/data/schema";
import { and, eq } from "drizzle-orm";
import { db } from "./db";
import { ContentPiece } from "@/lib/adt";

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
  options?: { limit: number }
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

export const pieceHasFiletype = async (pieceHash: string, filetype: FileType): Promise<boolean> =>
  (await getPieceFilesByFiletype(pieceHash, filetype)).length > 0;

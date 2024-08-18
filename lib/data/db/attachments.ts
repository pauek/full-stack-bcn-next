import * as schema from "@/data/schema"
import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { base64ToBytes } from "@/lib/utils"
import { and, eq } from "drizzle-orm"
import { FileBuffer, FileReference } from "../data-backend"
import { Hash } from "../hashing"
import { db } from "./db"
import { getFileData, getPieceFilesByFiletype } from "./utils"

export const getPieceAttachmentList = async (
  piece: ContentPiece,
  filetype: schema.FileType
): Promise<FileReference[]> => {
  const results = await getPieceFilesByFiletype(piece.hash, filetype)
  if (!results) {
    return []
  }
  return results.map((result) => ({
    ...result,
    filetype: schema.fileTypeFromString(result.filetype),
  }))
}

const _getAttachmentBytesByHash = async (hash: string): Promise<Buffer | null> => {
  try {
    const data = await getFileData(hash)
    if (!data) {
      return null
    }
    return Buffer.from(base64ToBytes(data))
  } catch (e) {
    return null
  }
}

export const getAttachmentBytes = async (_piece: ContentPiece, fileref: FileReference) => {
  return _getAttachmentBytesByHash(fileref.hash)
}

export const __getFileListByFiletype =
  (filetype: schema.FileType) =>
  async (piece: ContentPiece): Promise<FileReference[]> => {
    const results = await getPieceFilesByFiletype(piece.hash, filetype)
    if (!results) {
      return []
    }
    return results.map((result) => ({
      ...result,
      filetype: schema.fileTypeFromString(result.filetype),
    }))
  }

export const getPieceImageList = __getFileListByFiletype(FileType.image)
export const getPieceSlideList = __getFileListByFiletype(FileType.slide)

export const getPieceCoverImageData = async (piece: ContentPiece): Promise<FileBuffer | null> => {
  const [file] = await getPieceFilesByFiletype(piece.hash, FileType.cover, { limit: 1 })
  if (!file) {
    return null
  }
  const base64 = await getFileData(file.hash)
  if (!base64) {
    return null
  }
  const buffer = Buffer.from(base64ToBytes(base64))
  return { buffer, name: file.filename }
}

export const getPieceFileData = async (
  piece: ContentPiece,
  filename: string,
  filetype: schema.FileType
): Promise<Buffer | null> => {
  const [result] = await db
    .select({ data: schema.files.data })
    .from(schema.pieces)
    .leftJoin(schema.attachments, eq(schema.pieces.pieceHash, schema.attachments.pieceHash))
    .leftJoin(schema.files, eq(schema.attachments.fileHash, schema.files.hash))
    .where(
      and(
        eq(schema.pieces.pieceHash, piece.hash),
        eq(schema.attachments.filename, filename),
        eq(schema.attachments.filetype, filetype)
      )
    )
    .limit(1)
  if (!result || !result.data) {
    return null
  }
  return Buffer.from(base64ToBytes(result.data))
}

export const getQuizAnswersForHash = async (hash: Hash): Promise<string[]> => {
  const results = await db.query.quizAnswers.findMany({ where: eq(schema.quizAnswers.hash, hash) })
  return results.map((r) => r.answer)
}

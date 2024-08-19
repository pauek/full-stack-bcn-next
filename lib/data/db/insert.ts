import * as schema from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { hashAny } from "@/lib/data/hashing"
import { bytesToBase64, logPresentFile, logUploadedFile } from "@/lib/utils"
import { and, eq } from "drizzle-orm"
import { readFile } from "fs/promises"
import { getQuizPartsFromFile } from "../files/quiz"
import { db } from "./db"

export const pieceSetParent = async (childHash: string, parentHash: string) => {
  await db.insert(schema.relatedPieces).values({ childHash, parentHash }).onConflictDoNothing()
}

const _pieceHashExists = async (hash: string) => {
  const found = await db.query.pieces.findFirst({
    where: eq(schema.pieces.pieceHash, hash),
  })
  return found !== undefined
}

export const dbPieceExists = async (piece: ContentPiece) => _pieceHashExists(piece.hash)

export const fileExists = async (hash: string) => {
  const found = await db.query.files.findFirst({
    where: eq(schema.files.hash, hash),
  })
  return found !== undefined
}

export const attachmentExists = async (
  pieceHash: string,
  fileHash: string,
  filetype: schema.FileType,
) => {
  const found = await db.query.attachments.findFirst({
    where: and(
      eq(schema.attachments.pieceHash, pieceHash),
      eq(schema.attachments.fileHash, fileHash),
      eq(schema.attachments.filetype, filetype),
    ),
  })
  return found !== undefined
}

export const insertPiece = async (piece: ContentPiece, parent?: ContentPiece) => {
  if (await dbPieceExists(piece)) {
    return false // it was not inserted
  }
  const dbPiece: schema.DBPiece = {
    pieceHash: piece.hash,
    name: piece.name,
    createdAt: new Date(),
    metadata: piece.metadata,
  }
  try {
    await db.insert(schema.pieces).values(dbPiece).onConflictDoUpdate({
      target: schema.pieces.pieceHash,
      set: dbPiece,
    })
    return true // it was inserted
  } catch (e: any) {
    console.error(
      `Inserting "${piece.idpath.join("/")}" [${JSON.stringify(dbPiece)}]: ${e.toString()}`,
    )
  }
}

export const insertPieceHashmap = async (piece: ContentPiece) => {
  const level = piece.metadata.level
  await db
    .insert(schema.hashmap)
    .values({
      idpath: piece.idpath,
      pieceHash: piece.hash,
      level,
    })
    .onConflictDoUpdate({
      target: schema.hashmap.idpath,
      set: { pieceHash: piece.hash },
    })
}

type FileInfo = {
  filename: string
  filetype: schema.FileType
  diskpath: string
}
export const insertFile = async (
  piece: ContentPiece,
  { filename, filetype, diskpath }: FileInfo,
) => {
  try {
    const bytes = await readFile(diskpath)
    const fileHash = hashAny(bytes)
    let data: string = bytesToBase64(bytes)
    let metadata: Record<string, any> | null = null
    if (filetype === schema.FileType.quiz) {
      const { body, answers } = getQuizPartsFromFile(bytes.toString())
      //
      // NOTE(pauek): the fileHash is for the whole file (including the Markdown preamble),
      //   but we store only the body so if you try to check the hash with only the data,
      //   it will not match.
      //
      data = body
      metadata = { quizAnswers: answers }
    }

    const exists = await fileExists(fileHash)
    if (exists) {
      logPresentFile(fileHash, filetype, filename)
    } else {
      await db.insert(schema.files).values({ hash: fileHash, data, metadata })
      logUploadedFile(fileHash, filetype, filename)
    }

    const existsAttachment = await attachmentExists(piece.hash, fileHash, filetype)
    if (!existsAttachment) {
      await db.insert(schema.attachments).values({
        fileHash: fileHash,
        pieceHash: piece.hash,
        filetype,
        filename,
      })
    }
  } catch (e: any) {
    console.error(`Cannot insert ${filename} (${filetype}, ${diskpath})`, e)
  }
}

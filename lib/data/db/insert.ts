import * as schema from "@/data/schema"
import { FileType } from "@/data/schema"
import { ContentPiece, hash } from "@/lib/adt"
import { hashAny } from "@/lib/data/hashing"
import {
  bytesToBase64,
  logPresentFile,
  logUploadedFile,
  splitMarkdownPreamble,
  stringToBase64,
} from "@/lib/utils"
import { and, eq } from "drizzle-orm"
import { readFile } from "fs/promises"
import { getQuizPartsFromFile } from "../files/quiz"
import { db } from "./db"

export const pieceSetParent = async (childHash: string, parentHash: string) => {
  await db.insert(schema.relatedPieces).values({ childHash, parentHash })
}

export const dbPieceHashExists = async (hash: string) => {
  const found = await db.query.pieces.findFirst({
    where: eq(schema.pieces.pieceHash, hash),
  })
  return found !== undefined
}

export const dbPieceExists = async (piece: ContentPiece) => dbPieceHashExists(hash(piece))

export const fileExists = async (hash: string) => {
  const found = await db.query.files.findFirst({
    where: eq(schema.files.hash, hash),
  })
  return found !== undefined
}

export const attachmentExists = async (
  pieceHash: string,
  fileHash: string,
  filetype: schema.FileType
) => {
  const found = await db.query.attachments.findFirst({
    where: and(
      eq(schema.attachments.pieceHash, pieceHash),
      eq(schema.attachments.fileHash, fileHash),
      eq(schema.attachments.filetype, filetype)
    ),
  })
  return found !== undefined
}

export const insertPiece = async (piece: ContentPiece) => {
  if (await dbPieceExists(piece)) {
    return false // it was not inserted
  }
  const dbPiece: schema.DBPiece = {
    pieceHash: hash(piece),
    name: piece.name,
    createdAt: new Date(),
    metadata: piece.metadata,
  }
  try {
    await db.insert(schema.pieces).values(dbPiece)
    for (const child of piece.children || []) {
      await pieceSetParent(hash(child), hash(piece))
    }

    return true
  } catch (e: any) {
    const idjpath = piece.idpath.join("/")
    console.error(`inserPiece: ERROR inserting "${idjpath}":`, e)
  }
}

export const insertPieceHashmap = async (piece: ContentPiece) => {
  const { idpath, metadata } = piece
  const { level } = metadata
  await db
    .insert(schema.hashmap)
    .values({ idpath, pieceHash: piece.hash, level })
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
  { filename, filetype, diskpath }: FileInfo
) => {
  try {
    const bytes = await readFile(diskpath)
    const fileHash = hashAny(bytes)

    let data: string = bytesToBase64(bytes)

    // Extract metadata for certain types (for now, docs and exercises)
    let metadata: Record<string, any> | null = null
    if (filetype === FileType.doc || filetype === FileType.exercise) {
      const { preamble, body } = splitMarkdownPreamble(bytes.toString())
      if (preamble) {
        metadata = JSON.parse(preamble)
      }
      data = stringToBase64(body)
    } else if (filetype === schema.FileType.quiz) {
      const { body, answers } = getQuizPartsFromFile(bytes.toString())
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

    const existsAttachment = await attachmentExists(hash(piece), fileHash, filetype)
    if (!existsAttachment) {
      await db.insert(schema.attachments).values({
        fileHash: fileHash,
        pieceHash: hash(piece),
        filetype,
        filename,
      })
    }
  } catch (e: any) {
    console.error(`Cannot insert ${filename} (${filetype}, ${diskpath})`, e)
  }
}

import * as schema from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { Hash, hashAny } from "@/lib/data/hashing"
import { bytesToBase64, logPresentFile, logUploadedFile } from "@/lib/utils"
import { and, eq } from "drizzle-orm"
import { readFile } from "fs/promises"
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

export const pieceExists = async (piece: ContentPiece) => _pieceHashExists(piece.hash)

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

export const insertPiece = async (piece: ContentPiece, parent?: ContentPiece) => {
  if (await pieceExists(piece)) {
    return false // it was not inserted
  }
  const dbPiece: schema.DBPiece = {
    pieceHash: piece.hash,
    name: piece.name,
    diskpath: piece.diskpath,
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
    console.error(`Inserting ${piece.diskpath} [${JSON.stringify(dbPiece)}]: ${e.toString()}`)
  }
}

export const insertPieceHashmap = async (piece: ContentPiece) => {
  await db
    .insert(schema.hashmap)
    .values({
      idjpath: piece.idpath.join("/"),
      pieceHash: piece.hash,
      level: -1 /* This has to be computed later... */,
    })
    .onConflictDoUpdate({
      target: schema.hashmap.idjpath,
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
    const filehash = hashAny(bytes)

    const exists = await fileExists(filehash)
    if (exists) {
      logPresentFile(filehash, filetype, filename)
    } else {
      await db.insert(schema.files).values({
        hash: filehash,
        data: bytesToBase64(bytes),
      })
      logUploadedFile(filehash, filetype, filename)
    }

    const existsAttachment = await attachmentExists(piece.hash, filehash, filetype)
    if (!existsAttachment) {
      await db.insert(schema.attachments).values({
        fileHash: filehash,
        pieceHash: piece.hash,
        filetype,
        filename,
      })
    }

  } catch (e: any) {
    console.error(`Cannot insert ${filename} (${filetype}, ${diskpath})`, e)
  }
}

export const insertQuizAnswers = async (quizAnswers: Map<Hash, string[]>) => {
  const flatAnswers: { hash: string; answer: string }[] = []
  for (const [hash, answers] of quizAnswers) {
    for (const answer of answers) {
      flatAnswers.push({ hash, answer })
    }
  }
  if (flatAnswers.length > 0) {
    await db.insert(schema.quizAnswers).values(flatAnswers).onConflictDoNothing()
  }
}

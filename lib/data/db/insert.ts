import * as schema from "@/data/schema";
import { FileType } from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import * as files from "@/lib/data/files";
import { hashAny } from "@/lib/data/hashing";
import { bytesToBase64, logPresentFile, logUploadedFile } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { readFile } from "fs/promises";
import { basename, join } from "path";
import { db } from "./db";

export const pieceSetParent = async (childHash: string, parentHash: string) => {
  // const parentExists = await _pieceHashExists(parentHash);
  // const childExists = await _pieceHashExists(childHash);
  await db.insert(schema.relatedPieces).values({ childHash, parentHash }).onConflictDoNothing();
};

const _pieceHashExists = async (hash: string) => {
  const found = await db.query.pieces.findFirst({
    where: eq(schema.pieces.pieceHash, hash),
  });
  return found !== undefined;
};

export const pieceExists = async (piece: ContentPiece) => _pieceHashExists(piece.hash);

export const fileExists = async (hash: string) => {
  const found = await db.query.files.findFirst({
    where: eq(schema.files.hash, hash),
  });
  return found !== undefined;
};

export const insertPiece = async (piece: ContentPiece, parent?: ContentPiece) => {
  if (await pieceExists(piece)) {
    return false; // it was not inserted
  }
  const dbPiece: schema.DBPiece = {
    pieceHash: piece.hash,
    name: piece.name,
    diskpath: piece.diskpath,
    createdAt: new Date(),
    metadata: piece.metadata,
  };
  try {
    await db.insert(schema.pieces).values(dbPiece).onConflictDoUpdate({
      target: schema.pieces.pieceHash,
      set: dbPiece,
    });
    return true; // it was inserted
  } catch (e: any) {
    console.log(`Inserting ${piece.diskpath} [${JSON.stringify(dbPiece)}]: ${e.toString()}`);
  }
};

export const insertPieceHashmap = async (piece: ContentPiece) => {
  await db
    .insert(schema.hashmap)
    .values({ pieceHash: piece.hash, idjpath: piece.idpath.join("/") })
    .onConflictDoUpdate({
      target: schema.hashmap.idjpath,
      set: { pieceHash: piece.hash },
    });
};

type FileInfo = {
  filename: string;
  filetype: schema.FileType;
  diskpath: string;
};
export const insertFile = async (
  piece: ContentPiece,
  { filename, filetype, diskpath }: FileInfo
) => {
  const bytes = await readFile(diskpath);
  const hash = await hashAny(bytes);

  if (!(await fileExists(hash))) {
    logUploadedFile(hash, filetype, filename);

    await db
      .insert(schema.files)
      .values({
        hash,
        data: bytesToBase64(bytes),
      })
      .onConflictDoNothing();
  } else {
    logPresentFile(hash, filetype, filename);
  }

  await db
    .insert(schema.attachments)
    .values({
      fileHash: hash,
      pieceHash: piece.hash,
      filetype,
      filename,
    })
    .onConflictDoNothing();
};

export const insertFiles = async (piece: ContentPiece) => {
  const fullpath =
    (dir: string, filetype: schema.FileType) =>
    ({ filename }: { filename: string }) => ({
      filename,
      filetype,
      diskpath: join(piece.diskpath, dir, filename),
    });

  const images = await files.getPieceImageList(piece);
  const slides = await files.getPieceSlideList(piece);
  const exercises = await files.getPieceAttachmentList(piece, FileType.exercise);
  const allFiles = [
    ...images.map(fullpath("images", FileType.image)),
    ...slides.map(fullpath("slides", FileType.slide)),
    ...exercises.map(fullpath("exercises", FileType.exercise)),
  ];

  const doc = await files.findDocFilename(piece.diskpath);
  if (doc) {
    allFiles.push({
      filename: doc,
      filetype: FileType.doc,
      diskpath: join(piece.diskpath, doc),
    });
  }
  const cover = await files.findCoverImageFilename(piece);
  if (cover) {
    allFiles.push({
      filename: basename(cover),
      filetype: FileType.cover,
      diskpath: cover,
    });
  }

  for (const file of allFiles) {
    try {
      await insertFile(piece, file);
    } catch (e: any) {
      console.error(`Cannot insert ${file.filename}: ${e.toString()}`);
      console.error(e.stack);
    }
  }
};

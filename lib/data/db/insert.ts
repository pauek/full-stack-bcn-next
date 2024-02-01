import * as schema from "@/data/schema";
import * as files from "@/lib/data/files";
import { readFile } from "fs/promises";
import { basename, join } from "path";
import { ContentPiece } from "@/lib/adt";
import { bytesToBase64 } from "@/lib/utils";
import { hashAny } from "@/lib/data/hashing";
import { db } from "./db";
import { eq } from "drizzle-orm";

export const pieceSetParent = async (childHash: string, parentHash: string) => {
  await db
    .update(schema.pieces)
    .set({ parent: parentHash })
    .where(eq(schema.pieces.piece_hash, childHash));
};

export const pieceExists = async (piece: ContentPiece) => {
  const found = await db.query.pieces.findFirst({
    where: eq(schema.pieces.piece_hash, piece.hash),
  });
  return found !== undefined;
};

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

  const adaptedPiece: schema.DBPiece = {
    piece_hash: piece.hash,
    name: piece.name,
    diskpath: piece.diskpath,
    parent: parent?.hash || null,
    createdAt: new Date(),
    metadata: piece.metadata,
  };
  try {
    await db.insert(schema.pieces).values(adaptedPiece).onConflictDoUpdate({
      target: schema.pieces.piece_hash,
      set: adaptedPiece,
    });
    return true; // it was inserted
  } catch (e: any) {
    console.log(`Inserting ${piece.diskpath} [${JSON.stringify(adaptedPiece)}]: ${e.toString()}`);
  }
};

type FileInfo = {
  filename: string;
  filetype: schema.FileTypeEnum;
  diskpath: string;
};
export const insertFile = async (
  piece: ContentPiece,
  { filename, filetype, diskpath }: FileInfo
) => {
  const bytes = await readFile(diskpath);
  const hash = await hashAny(bytes);

  if (!(await fileExists(hash))) {
    await db
      .insert(schema.files)
      .values({
        hash,
        data: bytesToBase64(bytes),
      })
      .onConflictDoNothing();
  }

  await db
    .insert(schema.attachments)
    .values({
      file: hash,
      piece: piece.hash,
      filetype,
      filename,
    })
    .onConflictDoNothing();

  console.log(`  ${hash} ${filetype} ${filename}`);
};

export const insertFiles = async (piece: ContentPiece) => {
  const fullpath =
    (dir: string, filetype: schema.FileTypeEnum) =>
    ({ name }: { name: string }) => ({
      filename: `${name}`,
      filetype,
      diskpath: join(piece.diskpath, dir, name),
    });

  const images = await files.getPieceImageList(piece);
  const slides = await files.getPieceSlideList(piece);
  const allFiles = [
    ...(images?.map(fullpath("images", "image")) || []),
    ...(slides?.map(fullpath("slides", "slide")) || []),
  ];

  const doc = await files.findDocFilename(piece.diskpath);
  if (doc) {
    allFiles.push({
      filename: doc,
      filetype: "doc",
      diskpath: join(piece.diskpath, doc),
    });
  }
  const cover = await files.findCoverImageFilename(piece);
  if (cover) {
    allFiles.push({
      filename: basename(cover),
      filetype: "cover",
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

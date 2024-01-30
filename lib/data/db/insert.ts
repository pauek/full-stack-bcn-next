import * as schema from "@/data/schema";
import * as files from "@/lib/data/files";
import { readFile } from "fs/promises";
import { basename, join } from "path";
import { ContentPiece } from "@/lib/adt";
import { bytesToBase64 } from "@/lib/utils";
import { hashAny } from "@/lib/data/files/hashes";
import { db } from "./db";
import { eq } from "drizzle-orm";

export const pieceSetParent = async (childHash: string, parentHash: string) => {
  await db
    .update(schema.pieces)
    .set({ parent: parentHash })
    .where(eq(schema.pieces.piece_hash, childHash));
};

export const insertPiece = async (piece: ContentPiece, parent?: ContentPiece) => {
  const adaptedPiece: schema.DBPiece = {
    piece_hash: piece.hash,
    name: piece.name,
    idjpath: piece.idpath.join("/"),
    diskpath: piece.diskpath,
    parent: parent?.hash || null,
    createdAt: new Date(),
    metadata: {
      hasDoc: piece.metadata.hasDoc,
      index: piece.metadata.index,
      numSlides: piece.metadata.numSlides,
      hidden: piece.metadata.hidden,
      row: piece.metadata.row,
    },
  };
  try {
    await db
      .insert(schema.pieces)
      .values(adaptedPiece)
      .onConflictDoUpdate({
        target: schema.pieces.piece_hash,
        set: adaptedPiece,
      })
      .returning({
        hash: schema.pieces.piece_hash,
        path: schema.pieces.idjpath,
      });
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

  await db
    .insert(schema.files)
    .values({
      hash,
      filetype,
      data: bytesToBase64(bytes),
      name: filename,
    })
    .onConflictDoUpdate({
      target: schema.files.hash,
      set: { name: filename, filetype },
    });

  await db
    .insert(schema.attachments)
    .values({ file: hash, piece: piece.hash })
    .onConflictDoNothing();
};

export const insertFiles = async (piece: ContentPiece) => {
  const fullpath = (dir: string, filetype: schema.FileTypeEnum) => (f: string) => ({
    filename: `${f}`,
    filetype,
    diskpath: join(piece.diskpath, dir, f),
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

export const addRoot = async (hash: string) => {
  await db.insert(schema.roots).values({ hash });
};

export const deleteRoot = async (hash: string) => {
  await db.delete(schema.roots).where(eq(schema.roots.hash, hash));
};

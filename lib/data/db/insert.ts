import * as schema from "@/data/schema";
import * as files from "@/lib/data/files";
import { readFile } from "fs/promises";
import { basename, join } from "path";
import { ContentPiece } from "@/lib/adt";
import { bytesToBase64 } from "@/lib/utils";
import { hashAny } from "@/lib/data/files/hashes";
import { db } from "./db";

export const insertPiece = async (piece: ContentPiece) => {
  const adaptedPiece = {
    index: piece.index,
    diskpath: piece.diskpath,
    hasDoc: piece.hasDoc,
    hidden: piece.hidden,
    name: piece.name,
    numSlides: piece.numSlides,
    path: piece.idpath.join("/"),
    parent: piece.parent?.hash,
  };
  try {
    const insertedPieces = await db
      .insert(schema.pieces)
      .values({
        hash: piece.hash,
        ...adaptedPiece,
      })
      .onConflictDoUpdate({
        target: schema.pieces.hash,
        set: adaptedPiece,
      })
      .returning({
        hash: schema.pieces.hash,
        path: schema.pieces.path,
      });
    if (insertedPieces.length === 1) {
      const { hash, path } = insertedPieces[0];
      console.log(hash, path);
    }
  } catch (e: any) {
    console.log(
      `Inserting ${piece.diskpath} [${JSON.stringify(
        adaptedPiece
      )}]: ${e.toString()}`
    );
  }
};

export const insertFiles = async (piece: ContentPiece) => {
  const fullpath = (dir: string) => (f: string) => ({
    filename: `${dir}/${f}`,
    diskpath: join(piece.diskpath, dir, f),
  });

  const images = await files.getPieceImageList(piece);
  const slides = await files.getPieceSlideList(piece);
  const allFiles = [
    ...(images?.map(fullpath("images")) || []),
    ...(slides?.map(fullpath("slides")) || []),
  ];

  const cover = await files.findCoverImageFilename(piece);
  if (cover) {
    allFiles.push({
      filename: basename(cover),
      diskpath: cover,
    });
  }

  const doc = await files.findDocFilename(piece.diskpath);
  if (doc) {
    allFiles.push({
      diskpath: join(piece.diskpath, doc),
      filename: doc,
    });
  }

  for (const { diskpath, filename } of allFiles) {
    try {
      const bytes = await readFile(diskpath);
      const hash = await hashAny(bytes);
      await db
        .insert(schema.files)
        .values({
          hash,
          data: bytesToBase64(bytes).slice(0, 1000),
          name: filename,
          piece: piece.hash,
        })
        .onConflictDoUpdate({
          target: schema.files.hash,
          set: {
            name: filename,
            piece: piece.hash,
          },
        });
    } catch (e: any) {
      console.error(`Cannot insert ${filename}: ${e.toString()}`);
      console.error(e.stack);
    }
  }
};

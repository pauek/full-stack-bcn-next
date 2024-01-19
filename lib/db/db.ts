import * as schema from "@/data/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readFile } from "fs/promises";
import { join } from "path";
import { ContentPiece } from "../adt";
import {
  getPieceCoverImageFilename,
  getPieceImageList,
  getPieceSlideList,
  pieceDocFilename,
} from "../files/files";
import { hashFile } from "../files/hashes";
import { bytesToBase64 } from "../utils";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

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
  const fullpath = (dir: string) => (f: string) => join(piece.diskpath, dir, f);

  const images = await getPieceImageList(piece);
  const slides = await getPieceSlideList(piece);
  const allFiles = [
    ...(images?.map(fullpath("images")) || []),
    ...(slides?.map(fullpath("slides")) || []),
  ];

  const cover = await getPieceCoverImageFilename(piece);
  if (cover) allFiles.push(cover);

  const doc = await pieceDocFilename(piece.diskpath);
  if (doc) allFiles.push(join(piece.diskpath, doc));

  for (const filename of allFiles) {
    try {
      const bytes = await readFile(filename);
      const hash = await hashFile(filename);
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

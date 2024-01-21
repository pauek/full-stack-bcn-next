import { and, eq, like } from "drizzle-orm";
import { ContentPiece } from "../../adt";
import { db } from "./db";
import * as schema from "@/data/schema";
import hashes from "./hashes.json";
import { lastItem } from "@/lib/utils";

const pathToHash = new Map(hashes.map(({ hash, path }) => [path, hash]));

export const pieceHasCover = async (piece: ContentPiece) => {
  // find file starting with cover associated with piece
  const result = await db
    .select()
    .from(schema.files)
    .where(and(eq(schema.files.piece, piece.hash), like(schema.files.name, "cover.%")));
  return result.length > 0;
};

export const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const hash = pathToHash.get(idpath.join("/"));
  if (!hash) {
    return null;
  }
  const result = await db.query.pieces.findFirst({
    where: eq(schema.pieces.hash, hash),
    with: { children: true },
  });
  if (!result) {
    return null;
  }
  return {
    ...result,
    id: lastItem(idpath),
    idpath,
    parent: undefined,
    children: [],
  };
};

export const getPieceWithChildren = async (idpath: string[]): Promise<ContentPiece | null> => {
  const hash = pathToHash.get(idpath.join("/"));
  if (!hash) {
    return null;
  }
  const result = await db.query.pieces.findFirst({
    where: eq(schema.pieces.hash, hash),
    with: { children: true },
  });
  if (!result) {
    return null;
  }
  if (idpath.join("/") !== result.idpath) {
    throw "Mismatch between paths!";
  }
  const { index, hasDoc, numSlides, hidden, row } = result.metadata;

  const piece: ContentPiece = {
    ...result,
    idpath,
    id: lastItem(idpath),
    parent: undefined,
    children: [],
    metadata: { index, hasDoc, numSlides, hidden, row },
  };
  piece.children = result.children.map((ch) => ({
    ...ch,
    id: ch.idpath.split("/").slice(-1)[0],
    idpath: ch.idpath.split("/"),
    parent: piece,
    metadata: ch.metadata,
  }));
  return piece;
};

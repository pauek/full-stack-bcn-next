import { eq } from "drizzle-orm";
import { ContentPiece } from "../adt";
import { db } from "./db";
import * as schema from "@/data/schema";
import hashes from "./hashes.json";

const pathToHash = new Map(hashes.map(({ hash, path }) => [path, hash]));

export const getPieceWithChildren = async (
  idpath: string[]
): Promise<ContentPiece | null> => {
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
  if (idpath.join("/") !== result.path) {
    throw "Mismatch between paths!";
  }
  const piece: ContentPiece = {
    ...result,
    idpath,
    id: idpath.slice(-1)[0],
    parent: undefined,
    children: [],
    index: result.index || undefined,
  };
  piece.children = result.children.map((ch) => ({
    ...ch,
    id: ch.path.split("/").slice(-1)[0],
    idpath: ch.path.split("/"),
    parent: piece,
    index: ch.index || undefined,
  }));
  return piece;
};

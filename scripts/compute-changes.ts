import { getPiece, hashPiece, walkContentPieces } from "@/lib/data/files";
import { readFile } from "fs/promises";
import { join } from "path";

const course = await getPiece([process.env.COURSE!]);
if (!course) {
  throw `Course ${process.env.COURSE!} not found!`;
}

await walkContentPieces<string>(course, async (piece, children) => {
  const oldHash = (await readFile(join(piece.diskpath, ".hash"))).toString();
  const newHash = await hashPiece(piece.diskpath, children);
  if (oldHash !== newHash) {
    console.log(newHash, piece.idpath.join("/"));
  }
  return newHash;
});

import { getPiece, hashPiece, walkContentPiecesGeneric } from "@/lib/data/files";
import { readFile } from "fs/promises";
import { join } from "path";

const courseId = process.env.COURSE_ID!
const course = await getPiece([courseId]);
if (!course) {
  throw `Course ${courseId} not found!`;
}

await walkContentPiecesGeneric<string>(course, async (piece, children) => {
  const oldHash = (await readFile(join(piece.diskpath, ".hash"))).toString();
  const newHash = await hashPiece(piece.diskpath, children);
  if (oldHash !== newHash) {
    console.log(newHash, piece.idpath.join("/"));
  }
  return newHash;
});

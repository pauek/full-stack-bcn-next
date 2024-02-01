import { insertFiles, insertPiece, pieceSetParent } from "@/lib/data/db";
import { getPiece, walkContentPieces } from "@/lib/data/files";

const root = await getPiece([process.env.COURSE_ID!]);
if (!root) {
  throw `Course "${process.env.COURSE_ID!}" not found!`;
}
await walkContentPieces(root, async (piece, children) => {
  console.log(piece.hash, piece.idpath.join("/"));
  if (await insertPiece(piece)) {
    await insertFiles(piece);
    for (const child of children) {
      await pieceSetParent(child.hash, piece.hash);
    }
  }
  return piece;
});


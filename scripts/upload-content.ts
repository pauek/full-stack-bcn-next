import { insertFiles, insertPiece, pieceSetParent } from "@/lib/data/db";
import { getPiece, walkContentPieces } from "@/lib/data/files";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}
await walkContentPieces(fullstack, async (piece, children) => {
  console.log(piece.hash, piece.idpath.join("/"));
  if (await insertPiece(piece)) {
    await insertFiles(piece);
    for (const child of children) {
      await pieceSetParent(child.hash, piece.hash);
    }
  }
  return piece;
});


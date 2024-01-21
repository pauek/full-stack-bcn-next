import { ContentPiece } from "@/lib/adt";
import { insertPiece, insertFiles, pieceSetParent } from "@/lib/data/db";
import { walkContentPiecesGeneric, getPiece } from "@/lib/data/files";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}
await walkContentPiecesGeneric<ContentPiece>(fullstack, async (piece, children) => {
  await insertPiece(piece);
  await insertFiles(piece);
  for (const child of children) {
    await pieceSetParent(child, piece);
  }
  return piece;
});

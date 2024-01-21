import { insertPiece, insertFiles } from "@/lib/data/db";
import { walkContentPiecesGeneric, getPiece } from "@/lib/data/files";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}
await walkContentPiecesGeneric(fullstack, async (piece, _) => {
  await insertPiece(piece);
  await insertFiles(piece);
});

import { insertPiece, insertFiles } from "@/lib/data/db";
import { walkContentPieces, getPiece } from "@/lib/data/files";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}
await walkContentPieces(fullstack, async (piece, _) => {
  await insertPiece(piece);
  await insertFiles(piece);
});

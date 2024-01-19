import { insertFiles, insertPiece } from "@/lib/db/db";
import { getPiece } from "@/lib/files/files";
import { walkContentPieces } from "@/lib/files/hashes";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}
await walkContentPieces(fullstack, async (piece, _) => {
  await insertPiece(piece);
  await insertFiles(piece);
});

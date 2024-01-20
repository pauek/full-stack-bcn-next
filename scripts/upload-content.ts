import { insertFiles, insertPiece } from "@/lib/data/db/insert";
import { getPiece } from "@/lib/data/files/files";
import { walkContentPieces } from "@/lib/data/files/hashes";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}
await walkContentPieces(fullstack, async (piece, _) => {
  await insertPiece(piece);
  await insertFiles(piece);
});

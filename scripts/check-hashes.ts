import backend from "@/lib/data";
import { hashPiece } from "@/lib/data/hashing";

const fullstack = await backend.getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}
await backend.walkContentPieces(fullstack, async (piece, children) => {
  const computedHash = await hashPiece(backend, piece, children);
  if (piece.hash !== computedHash.hash) {
    console.log(`Hash mismatch: ${piece.hash} != ${computedHash.hash} (${piece.idpath.join("/")})`);
  }
  return computedHash;
});

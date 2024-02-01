import backend from "@/lib/data";
import { hashPiece } from "@/lib/data/hashing";

const root = await backend.getPiece([process.env.COURSE_ID!]);
if (!root) {
  throw `Course "${process.env.COURSE_ID!}" not found!`;
}
await backend.walkContentPieces(root, async (piece, children) => {
  const computedHash = await hashPiece(backend, piece, children);
  if (piece.hash !== computedHash.hash) {
    console.log(`Hash mismatch: ${piece.hash} != ${computedHash.hash} (${piece.idpath.join("/")})`);
  }
  return computedHash;
});

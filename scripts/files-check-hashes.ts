import backend from "@/lib/data";
import { hashPiece } from "@/lib/data/hashing";
import { getCourseRoot } from "@/lib/data/root";

const root = await getCourseRoot();

await backend.walkContentPieces(root, async (piece, children) => {
  const computedHash = await hashPiece(backend, piece, children);
  if (piece.hash !== computedHash.hash) {
    console.log(`Hash mismatch: ${piece.hash} != ${computedHash.hash} (${piece.idpath.join("/")})`);
  }
  return computedHash;
});

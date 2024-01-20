import { getPiece, updateMetadata } from "@/lib/data/files/files";
import { walkContentPieces } from "@/lib/data/files/hashes";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}
await walkContentPieces(fullstack, async (piece, _) => {
  await updateMetadata(piece.diskpath, (metadata) => {
    if ("slideHashes" in metadata) {
      console.log(piece.idpath.join("/"));
      delete metadata.slideHashes;
    }
  });
});

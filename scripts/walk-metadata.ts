import { getPiece, updateMetadata, walkContentPiecesGeneric } from "@/lib/data/files";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}
await walkContentPiecesGeneric(fullstack, async (piece, _) => {
  await updateMetadata(piece.diskpath, async (metadata) => {
    if ("slideHashes" in metadata) {
      console.log(piece.idpath.join("/"));
      delete metadata.slideHashes;
    }
  });
});

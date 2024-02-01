import { getPiece, updateMetadata, walkContentPieces } from "@/lib/data/files";

const root = await getPiece([process.env.COURSE_ID!]);
if (!root) {
  throw `Course "${process.env.COURSE_ID!}" not found!`;
}
await walkContentPieces(root, async (piece, _) => {
  await updateMetadata(piece.diskpath, async (metadata) => {
    if ("slideHashes" in metadata) {
      console.log(piece.idpath.join("/"));
      delete metadata.slideHashes;
    }
  });
});

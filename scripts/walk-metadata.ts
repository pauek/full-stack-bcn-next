import { getPiece, readMetadata, writeMetadata } from "@/lib/files/files";
import { walkContentPieces } from "@/lib/files/hashes";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}

walkContentPieces(fullstack, async (piece, _) => {
  const metadata = await readMetadata(piece.diskpath);
  for (const field in metadata) {
    if (Array.isArray(metadata[field])) {
      console.log(piece.diskpath, field, metadata[field]);
    }
  }
  await writeMetadata(piece.diskpath, metadata);
})
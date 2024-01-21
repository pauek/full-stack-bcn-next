import { backend as files, updateMetadata, walkContentPieces } from "@/lib/data/files";

const fullstack = await files.getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}

let currSessionIndex = 1;

await walkContentPieces(fullstack, async (piece, children) => {
  const level = piece.idpath.length - 1; // 1-part, 2-session, 3-chapter
  await updateMetadata(piece.diskpath, async (metadata) => {
    // hasDoc
    metadata.hasDoc = await files.pieceHasDoc(piece);

    // numSlides
    const slides = await files.getPieceSlideList(piece);
    metadata.numSlides = slides ? slides.length : 0;

    // index (for sessions), we assume that the walk is *ordered by filenames*
    if (level == 2) {
      metadata.index = currSessionIndex;
      currSessionIndex++;
    } else {
      // walkContentPieces sets the index to the child index
      metadata.index = piece.metadata.index;
    }
  });
});

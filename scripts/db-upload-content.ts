import { closeConnection, insertFiles, insertPiece, pieceExists, pieceSetParent } from "@/lib/data/db";
import { getPiece, walkContentPieces } from "@/lib/data/files";

const forcedUpload = process.argv.includes("--force");
console.log(`forcedUpload = ${forcedUpload}`);

const root = await getPiece([process.env.COURSE_ID!]);
if (!root) {
  throw `Course "${process.env.COURSE_ID!}" not found!`;
}

if (!forcedUpload && await pieceExists(root)) {
  process.exit(0);
}

await walkContentPieces(root, async (piece, children) => {
  if (forcedUpload || await insertPiece(piece)) {
    console.log(piece.hash, piece.idpath.join("/"));
    await insertFiles(piece);
    for (const child of children) {
      await pieceSetParent(child.hash, piece.hash);
    }
  }
  return piece;
});

await closeConnection();



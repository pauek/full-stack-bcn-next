import { FileTypeEnum } from "@/data/schema";
import { dbBackend } from "@/lib/data";
import { closeConnection, getPiece, getPieceFilesByFiletype } from "@/lib/data/db";

const root = await getPiece([process.env.COURSE_ID!]);
if (!root) {
  throw `Course "${process.env.COURSE_ID!}" not found!`;
}

await dbBackend.walkContentPieces(root, async (piece, _children) => {
  console.log(piece.hash, piece.idpath.join("/"));
  for (const filetype of ["doc", "cover", "image", "slide"]) {
    const files = await getPieceFilesByFiletype(piece.hash, filetype as FileTypeEnum);
    for (const file of files || []) {
      console.log(`  ${file.hash} ${filetype} ${file.name}`);
    }
  }
});

await closeConnection();


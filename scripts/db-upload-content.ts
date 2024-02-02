import { filesBackend } from "@/lib/data";
import * as db from "@/lib/data/db";
import { getCourseRoot } from "@/lib/data/root";

const forcedUpload = process.argv.includes("--force");
console.log(`forcedUpload = ${forcedUpload}`);

const root = await getCourseRoot();

if (!forcedUpload && (await db.pieceExists(root))) {
  process.exit(0);
}

await filesBackend.walkContentPieces(root, async (piece, children) => {
  if (forcedUpload || (await db.insertPiece(piece))) {
    console.log(piece.hash, piece.idpath.join("/"));
    await db.insertFiles(piece);
    for (const child of children) {
      await db.pieceSetParent(child.hash, piece.hash);
    }
  }
  return piece;
});

await db.closeConnection();

import { Changes } from "../changes";
import { filesBackend } from "../files";
import { insertFiles, insertPiece, pieceSetParent } from "./insert";

// Apply updates to the database
export const applyChangesToDatabase = async (changes: Changes) => {
  for (const change of changes) {
    const piece = await filesBackend.getPiece(change.idpath);
    if (!piece) {
      console.error(`Error: now I don't find a piece that was there??`);
      continue;
    }
    console.log(change.newHash, change.idpath.join("/"));
    await insertPiece(piece);
    await insertFiles(piece);
    for (const childHash of change.childrenHashes) {
      await pieceSetParent(childHash, piece.hash);
    }
  }
};

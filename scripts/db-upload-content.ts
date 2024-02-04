import "@/lib/env.mjs";

import { closeConnection, dbBackend } from "@/lib/data/db";
import { filesBackend } from "@/lib/data/files";
import { getRoot } from "@/lib/data/root";
import { showExecutionTime } from "@/lib/utils";
import chalk from "chalk";
import {
  insertFiles,
  insertPiece,
  insertPieceHashmap,
  pieceExists,
  pieceSetParent,
} from "@/lib/data/db/insert";

showExecutionTime(async () => {
  const forcedUpload = process.argv.includes("--force");
  console.log(chalk.gray(`[${dbBackend.getInfo()}]`));
  console.log(chalk.gray(`[forcedUpload = ${forcedUpload}]`));

  const root = await getRoot(filesBackend);
  await insertPiece(root);
  await insertPieceHashmap(root);

  if (!forcedUpload && (await pieceExists(root))) {
    process.exit(0);
  }

  await filesBackend.walkContentPieces(root, async (piece, children) => {
    if ((await insertPiece(piece)) || forcedUpload) {
      console.log(piece.hash, piece.idpath.join("/"));
      await insertFiles(piece);
      for (const child of children) {
        await pieceSetParent(child.hash, piece.hash);
      }
      await insertPieceHashmap(piece);
    }
    return piece;
  });

  await closeConnection();
});

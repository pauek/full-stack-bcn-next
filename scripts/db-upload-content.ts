import "@/lib/env.mjs";

import { WalkFunc } from "@/lib/data/data-backend";
import { closeConnection, dbBackend } from "@/lib/data/db";
import * as db from "@/lib/data/db/insert";
import { filesBackend } from "@/lib/data/files";
import { getRoot } from "@/lib/data/root";
import { showExecutionTime } from "@/lib/utils";
import chalk from "chalk";

showExecutionTime(async () => {
  const forcedUpload = process.argv.includes("--force");
  console.log(chalk.gray(`[${dbBackend.getInfo()}]`));
  console.log(chalk.gray(`[forcedUpload = ${forcedUpload}]`));

  const root = await getRoot(filesBackend);
  if (!forcedUpload && await db.pieceExists(root)) {
    console.log("No changes.");
    process.exit(0);
  }

  const walkFilesIfChanged = async function (idpath: string[], func: WalkFunc) {
    const filesPiece = await filesBackend.getPieceWithChildren(idpath);
    if (!filesPiece) {
      console.error(`[ERROR] Piece not found: ${idpath.join("/")}`);
      return;
    }
    const filesChildren: any[] = [];
    for (const filesChild of filesPiece.children || []) {
      const dbChild = await dbBackend.getPiece(filesChild.idpath);
      if (dbChild?.hash !== filesChild.hash || forcedUpload) {
        await walkFilesIfChanged(filesChild.idpath, func);
      }
      filesChildren.push(filesChild);
    }
    await func(filesPiece, filesChildren);
  };

  await walkFilesIfChanged(root.idpath, async (piece, children) => {
    console.log(piece.hash, piece.idpath.join("/"), " ".repeat(40));
    await db.insertPiece(piece);
    await db.insertPieceHashmap(piece);
    await db.insertFiles(piece);
    for (const child of children) {
      await db.pieceSetParent(child.hash, piece.hash);
    }
  });

  await closeConnection();
});

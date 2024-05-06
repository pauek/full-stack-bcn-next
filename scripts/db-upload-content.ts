import "@/lib/env.mjs";

import { closeConnection, dbBackend } from "@/lib/data/db";
import * as db from "@/lib/data/db/insert";
import { showExecutionTime } from "@/lib/utils";
import chalk from "chalk";
import { getSelectedRoot, insertPieceWalker, walkFilesIfChanged } from "./lib";

const {
  argv: [_bun, _script, idjpath],
} = process;


showExecutionTime(async () => {
  const forcedUpload = process.argv.includes("--force");
  console.log(chalk.gray(`[${dbBackend.getInfo()}]`));
  console.log(chalk.gray(`[forcedUpload = ${forcedUpload}]`));

  const root = await getSelectedRoot(idjpath);

  if (!forcedUpload && (await db.pieceExists(root))) {
    console.log("No changes.");
    process.exit(0);
  }

  await walkFilesIfChanged(forcedUpload, root.idpath, insertPieceWalker);

  await closeConnection();
});

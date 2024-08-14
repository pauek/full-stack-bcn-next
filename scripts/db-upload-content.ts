import "@/lib/env-config"

import { dbBackend } from "@/lib/data"
import { closeConnection } from "@/lib/data/db/db"
import * as db from "@/lib/data/db/insert"
import { showExecutionTime } from "@/lib/utils"
import chalk from "chalk"
import { getSelectedRoot, insertPieceWalker, walkFilesIfChanged } from "./lib/lib"

const {
  argv: [_bun, _script, ...args],
} = process

showExecutionTime(async () => {
  const forcedUpload = args.includes("--force")
  const idjpath = args.filter((arg) => !arg.startsWith("--"))[0]
  
  console.log(chalk.gray(`[${dbBackend.getInfo()}]`))
  console.log(chalk.gray(`[forcedUpload = ${forcedUpload}]`))

  const root = await getSelectedRoot(idjpath)

  if (!forcedUpload && (await db.pieceExists(root))) {
    console.log("No changes.")
    process.exit(0)
  }

  await walkFilesIfChanged(forcedUpload, root.idpath, insertPieceWalker)
  await closeConnection()
})

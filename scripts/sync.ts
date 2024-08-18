import "@/lib/env-config"

import { FileType } from "@/data/schema"
import { dbBackend } from "@/lib/data"
import { closeConnection } from "@/lib/data/db/db"
import { dbGetAllHashmaps } from "@/lib/data/db/hashmaps"
import { insertPiece, insertPieceHashmap } from "@/lib/data/db/insert"
import { collectAnswersForPiece, writeAnswers } from "@/lib/data/files/quiz"
import { readStoredHash, writeStoredHash } from "@/lib/data/files/hashes"
import {
  forEachHashmapEntry,
  hashmapAdd,
  hashmapRemove,
  loadGlobalHashmap,
  writeGlobalHashmap,
} from "@/lib/data/files/hashmaps"
import { updateMetadata } from "@/lib/data/files/metadata"
import { getPiece, pieceHasDoc } from "@/lib/data/files/pieces"
import { filesGetRootIdpath, filesWalkContentPieces, listPieceSubdir } from "@/lib/data/files/utils"
import { Hash, HashItem, hashPiece } from "@/lib/data/hashing"
import { showExecutionTime } from "@/lib/utils"
import chalk from "chalk"
import { basename } from "path"
import { insertFiles } from "./lib/lib"

const cliArgs = {
  forcedUpdate: false,
  dryRun: false,
}

type HashItemLevel = HashItem & { level: number }

const allAnswers: Map<Hash, string[]> = new Map()

export const updatePiece = async (idpath: string[]) => {
  const piece = await getPiece(idpath)
  if (piece === null) {
    throw new Error(`Piece not found??? "${idpath.join("/")}"`)
  }
  if (piece.metadata.hidden) {
    return
  }
  console.log(piece.hash, piece.idpath.join("/"))
  try {
    await Promise.allSettled([
      await insertPiece(piece),
      await insertPieceHashmap(piece),
      await insertFiles(piece),
      // await uploadImages(piece),
    ])
  } catch (e) {
    console.error(`Error updating piece ${piece.idpath.join("/")}: ${e}`)
  }
}

export const updateFileTree = async function () {
  let sessionIndex = 1

  // WARNING: The pieces have to be walked in order of filename!
  // Otherwise, the indices will be wrong.

  await filesWalkContentPieces<HashItemLevel>(
    filesGetRootIdpath(),
    async ({ index, piece, diskpath, children }) => {
      const filename = basename(diskpath)

      // New hash (potential new change)
      const oldHash = await readStoredHash(diskpath)
      const newHash = await hashPiece(piece, children)
      if (!cliArgs.dryRun) {
        await writeStoredHash(diskpath, newHash)
      }

      // Compute level, depth, ...
      const childrenLevels = children.map(({ level }) => level)
      const level = 1 + Math.max(-1, ...childrenLevels)

      // As soon as we can, we update the hashmap (since other funcs depend on it)
      if (newHash !== oldHash && !piece.metadata.hidden) {
        hashmapRemove(oldHash)
        hashmapAdd({ hash: newHash, idpath: piece.idpath, diskpath, level })
      }

      // Collect quiz answers
      for (const [key, values] of await collectAnswersForPiece(piece)) {
        allAnswers.set(key, values)
      }

      // Update own metadata
      const depth = piece.idpath.length
      const slideList = await listPieceSubdir(diskpath, FileType.slide)

      updateMetadata(diskpath, async (M) => {
        if (!cliArgs.dryRun) {
          M.level = level
          M.hasDoc = await pieceHasDoc(piece) // This uses the globalHashmap!
          M.numSlides = slideList.length
          M.index = index
          if (depth === 3) {
            M.index = sessionIndex++ // for sessions
          }
        }
      })

      return { hash: newHash, filename, level }
    }
  )

  if (!cliArgs.dryRun) {
    await writeGlobalHashmap() // a.s.a.p.
  }
}

//
// Check, for each entry in the local hashmap, if that hash is in the database.
// Otherwise, upload the whole piece, including files, etc.
//
const uploadChanges = async () => {
  const hashmaps = await dbGetAllHashmaps()
  const dbMap = new Map(hashmaps.map((h) => [h.idpath.join("/"), h.pieceHash] as const))

  await forEachHashmapEntry(async ({ idpath, hash: filesHash }) => {
    const dbHash = dbMap.get(idpath.join("/"))
    if (dbHash !== filesHash || cliArgs.forcedUpdate) {
      if (!cliArgs.dryRun) {
        await updatePiece(idpath)
      } else {
        const piece = await getPiece(idpath)
        console.log(piece!.hash, piece!.idpath.join("/"))
      }
    }
  })
}

const step = async (message: string, func: () => Promise<void>) => {
  process.stdout.write(chalk.green(`${message}\n`))
  await func()
}
const [_bun, _script, ...args] = process.argv

const parseOption = (long: string, short: string): boolean =>
  args.includes(long) || args.includes(short)

showExecutionTime(async () => {
  cliArgs.dryRun = parseOption("--dry-run", "-n")
  cliArgs.forcedUpdate = parseOption("--force", "-f")

  console.log(chalk.gray(`[${dbBackend.getInfo()}]`))
  console.log(chalk.gray(`[forcedUpdate = ${cliArgs.forcedUpdate}]`))

  await loadGlobalHashmap()

  await step("Checking file tree", updateFileTree)
  await step("Processing changes", uploadChanges)
  if (!cliArgs.dryRun) {
    await step("Writing answers", () => writeAnswers(allAnswers))
  }

  if (cliArgs.dryRun) {
    console.log(chalk.bgYellow("DRY RUN: no changes were made."))
  }

  await closeConnection()
})

import "@/lib/env-config"

import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { backend as dbBackend } from "@/lib/data/db"
import { closeConnection } from "@/lib/data/db/db"
import { insertPiece, insertPieceHashmap } from "@/lib/data/db/insert"
import { getAllPieceAttachments } from "@/lib/data/files/attachments"
import { readStoredHash, writeStoredHash } from "@/lib/data/files/hashes"
import {
  hashmapAdd,
  hashmapRemove,
  loadGlobalHashmap,
  writeGlobalHashmap,
} from "@/lib/data/files/hashmaps"
import { writeMetadata } from "@/lib/data/files/metadata"
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

/** Parse options */
const parseOption = (args: string[], long: string, short: string): boolean =>
  args.includes(long) || args.includes(short)

/**
 * Update a content piece in the database.
 * @param idpath The idpath of the piece.
 *
 * Also shows the hash and idpath of the piece on the screen. If the piece has
 * the "hidden" metadata field set to `true`, it will not upload anything.
 */
export const updatePiece = async (piece: ContentPiece, childrenHashes: HashItem[]) => {
  if (piece.metadata.hidden) {
    return
  }
  try {
    await Promise.allSettled([
      await insertPiece(piece, childrenHashes),
      await insertPieceHashmap(piece),
      await insertFiles(piece),
      // await uploadImages(piece),
    ])
  } catch (e) {
    console.error(`Error updating piece ${piece.idpath.join("/")}: ${e}`)
  }
}

/**
 * Walk the file tree and compute the new hash, level,
 */
export const updateFileTree = async function () {
  let sessionIndex = 1
  let numChanges = 0

  // Load global hashmap before
  await loadGlobalHashmap()

  // WARNING: The pieces have to be walked in order of filename!
  // Otherwise, the indices will be wrong. (This is in principle
  // guaranteed by filesWalkContentPieces.)
  //
  await filesWalkContentPieces<HashItemLevel>(
    filesGetRootIdpath(),
    async ({ index, piece, diskpath, children }) => {
      const filename = basename(diskpath)

      // Attachments
      const attachments = await getAllPieceAttachments(piece)
      const slideList = await listPieceSubdir(diskpath, FileType.slide)
      const hasDoc = attachments.some((a) => a.filetype === FileType.doc)

      // Compute level
      const childrenLevels = children.map(({ level }) => level)
      if (attachments.length > 0) {
        childrenLevels.push(0) // Attachments count as level 0
      }
      const level = 1 + Math.max(-1, ...childrenLevels)

      // IMPORTANT: Updating metadata changes the hash!!
      // Update metadata fields (metadata was already read)
      const { metadata } = piece
      metadata.level = level
      metadata.hasDoc = hasDoc
      metadata.numSlides = slideList.length
      const depth = piece.idpath.length
      if (depth === 3) {
        metadata.index = sessionIndex++ // for sessions
      } else {
        metadata.index = index
      }
      if (!cliArgs.dryRun) {
        await writeMetadata(diskpath, metadata)
      }

      // Compute new hash
      const oldHash = await readStoredHash(diskpath)
      const newHash = await hashPiece(piece, children)
      if (!cliArgs.dryRun) {
        piece.hash = newHash // remember!
        await writeStoredHash(diskpath, newHash)
      }

      // --- UPDATE ---
      // Only if the hash has changed, or if we are uploading everything
      if (cliArgs.forcedUpdate || newHash !== oldHash) {
        hashmapRemove(oldHash)
        hashmapAdd({ hash: newHash, idpath: piece.idpath, diskpath, level })
        if (!cliArgs.dryRun) {
          await updatePiece(piece, children)
        }
        console.log(piece.hash, piece.idpath.join("/"))
        numChanges++
      }

      return { hash: newHash, filename, level }
    }
  )

  // Write global hashmap after
  if (!cliArgs.dryRun) {
    await writeGlobalHashmap()
  }

  return { numChanges }
}

// Main
showExecutionTime(async () => {
  const [_bun, _script, ...args] = process.argv
  cliArgs.dryRun = parseOption(args, "--dry-run", "-n")
  cliArgs.forcedUpdate = parseOption(args, "--force", "-f")

  if (cliArgs.dryRun) {
    console.log(chalk.bgYellow("DRY RUN: nothing will be written to disk."))
  }
  if (cliArgs.forcedUpdate) {
    console.log(chalk.bgYellow("FORCED UPDATE: all pieces will be processed."))
  }

  const { numChanges } = await updateFileTree()

  if (numChanges === 0) {
    console.log(`No changes.`)
  } else {
    console.log(`${numChanges} changed pieces.`)
  }
  if (cliArgs.dryRun) {
    console.log(chalk.bgYellow("DRY RUN: nothing was written to disk."))
  }

  await closeConnection()
})

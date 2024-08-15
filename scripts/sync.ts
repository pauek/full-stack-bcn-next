import "@/lib/env-config"

import { ContentPiece } from "@/lib/adt"
import { dbBackend } from "@/lib/data"
import { closeConnection } from "@/lib/data/db/db"
import {
  dbPieceExists,
  insertPiece,
  insertPieceHashmap,
  insertQuizAnswers,
} from "@/lib/data/db/insert"
import { collectAnswersForPiece, writeAnswers } from "@/lib/data/files/answers"
import { getPieceSlideList } from "@/lib/data/files/attachments"
import { HashmapChange, updateHashmapFile } from "@/lib/data/files/hash-maps"
import { readStoredHash, writeStoredHash } from "@/lib/data/files/hashes"
import { updateMetadata } from "@/lib/data/files/metadata"
import { pieceHasDoc } from "@/lib/data/files/pieces"
import { filesGetRoot, filesGetRootIdpath, filesWalkContentPieces } from "@/lib/data/files/utils"
import { Hash, HashItem, hashPiece } from "@/lib/data/hashing"
import { showExecutionTime } from "@/lib/utils"
import chalk from "chalk"
import { basename } from "path"
import { insertFiles, uploadImages } from "./lib/lib"

export const updatePiece = async (piece: ContentPiece, level: number) => {
  console.log(piece.hash, piece.idpath.join("/"))
  try {
    await Promise.allSettled([
      await insertPiece(piece),
      await insertPieceHashmap(piece, level),
      await insertFiles(piece),
    ])
  } catch (e) {
    console.error(`Error updating piece ${piece.idpath.join("/")}: ${e}`)
  }
}

export const updateFileTree = async function (fromScratch: boolean, idpath: string[]) {
  const changes: HashmapChange[] = []
  const changedPieces: (ContentPiece & { level: number })[] = []
  const allAnswers: Map<Hash, string[]> = new Map()
  let sessionIndex = 1

  // WARNING: The pieces have to be walked in order of filename!
  // Otherwise, the indices will be wrong.

  await filesWalkContentPieces<HashItem & { level: number }>(
    idpath,
    async ({ index, piece, diskpath, children }) => {
      const filename = basename(diskpath)

      // New hash (potential new change)
      const oldHash = await readStoredHash(diskpath)
      const newHash = await hashPiece(piece, children)
      await writeStoredHash(diskpath, newHash)

      // Compute level, depth, ...
      const childrenLevels = children.map(({ level }) => level)
      const level = 1 + Math.max(0, ...childrenLevels)
      const depth = piece.idpath.length
      const slideList = await getPieceSlideList(piece)

      // Collect quiz answers
      for (const [key, values] of await collectAnswersForPiece(piece)) {
        allAnswers.set(key, values)
      }

      // Update own metadata
      updateMetadata(diskpath, async (metadata) => {
        metadata.level = level
        metadata.hasDoc = await pieceHasDoc(piece)
        metadata.numSlides = slideList.length
        metadata.index = index
        if (depth === 3) {
          // Correlative order for sessions
          metadata.index = sessionIndex
          ++sessionIndex
        }
      })

      if (newHash !== oldHash || fromScratch) {
        changedPieces.push({ ...piece, level })
        changes.push({
          oldHash,
          newHash,
          idpath: piece.idpath,
          diskpath,
          children: children.map(({ hash }) => hash),
        })
      }

      return { hash: newHash, filename, level }
    }
  )

  // Process changes
  if (changedPieces.length > 0) {
    for (const piece of changedPieces) {
      await updatePiece(piece, piece.level)
    }
    await insertQuizAnswers(allAnswers)
    await writeAnswers(allAnswers)
    await updateHashmapFile(changes)
    await uploadImages() // FIXME: Only update images that are from pieces that have changed!
  } else {
    console.log("No changes.")
  }
}

const {
  argv: [_bun, _script, ...args],
} = process

showExecutionTime(async () => {
  const force = args[0] === "--force"
  console.log(chalk.gray(`[${dbBackend.getInfo()}]`))
  console.log(chalk.gray(`[forcedUpload = ${force}]`))

  try {
    const rootIdpath = filesGetRootIdpath()
    await updateFileTree(force, rootIdpath)
  } catch (e) {
    console.error(`Error updating file tree: ${e}`)
  }

  await closeConnection()
})

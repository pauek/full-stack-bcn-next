import "@/lib/env.mjs"

import { MapPosition } from "@/data/schema"
import { closeConnection, dbBackend } from "@/lib/data/db"
import { filesBackend, updateMetadata } from "@/lib/data/files"
import { getRoot } from "@/lib/data/root"
import { showExecutionTime } from "@/lib/utils"
import chalk from "chalk"

const {
  argv: [_bun, _script],
} = process

showExecutionTime(async () => {
  console.log(chalk.gray(`[${dbBackend.getInfo()}]`))

  const positions = await dbBackend.getMapPositions()
  const hashToPosition = new Map<string, MapPosition>()
  for (const pos of positions) {
    hashToPosition.set(pos.pieceHash, pos)
  }

  const root = await getRoot(filesBackend)
  await filesBackend.walkContentPieces(root, async (piece) => {
    await updateMetadata(piece.diskpath, async (metadata) => {
      const position = hashToPosition.get(piece.hash)
      if (position) {
        const { left, top, width, height } = position
        metadata.mapPosition = { left, top, width, height }
      }
    })
  })

  await closeConnection()
})

import "@/lib/env.mjs"

import { MapPosition } from "@/data/schema"
import { showExecutionTime } from "@/lib/utils"
import chalk from "chalk"

import { backend as dbBackend } from "@/lib/data/db"
import { closeConnection } from "@/lib/data/db/db"
import { updateMetadata } from "@/lib/data/files/metadata"
import { filesWalkContentPieces, filesGetRootIdpath } from "@/lib/data/files/utils"

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

  const rootIdpath = await filesGetRootIdpath()
  await filesWalkContentPieces(rootIdpath, async ({ piece, diskpath }) => {
    await updateMetadata(diskpath, async (metadata) => {
      const position = hashToPosition.get(piece.hash)
      if (position) {
        const { left, top, width, height } = position
        metadata.mapPosition = { left, top, width, height }
      }
    })
  })

  await closeConnection()
})

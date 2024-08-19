import "@/lib/env.mjs"

import { MapPosition } from "@/data/schema"
import { showExecutionTime } from "@/lib/utils"
import chalk from "chalk"

import { getMapPositionsExtended } from "@/lib/data/db/positions"
import { closeConnection } from "@/lib/data/db/db"
import { updateMetadata } from "@/lib/data/files/metadata"
import { filesWalkContentPieces, filesGetRootIdpath } from "@/lib/data/files/utils"

const {
  argv: [_bun, _script],
} = process

showExecutionTime(async () => {
  const positions = await getMapPositionsExtended()
  const hashToPosition = new Map<string, MapPosition<number>>()
  for (const pos of positions) {
    hashToPosition.set(pos.hash, pos)
  }

  const rootIdpath = await filesGetRootIdpath()
  await filesWalkContentPieces(rootIdpath, async ({ piece, diskpath }) => {
    await updateMetadata(diskpath, async (metadata) => {
      const position = hashToPosition.get(piece.hash)
      if (position) {
        const { left, top, width, height } = position.rectangle
        metadata.mapPosition = { left, top, width, height }
      }
    })
  })

  await closeConnection()
})

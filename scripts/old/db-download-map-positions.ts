import "@/lib/env.mjs"

import { MapPosition } from "@/data/schema"
import { showExecutionTime } from "@/lib/utils"

import { hash } from "@/lib/adt"
import { closeConnection } from "@/lib/data/db/db"
import { getMapPositionsExtended } from "@/lib/data/db/positions"
import { updateMetadata } from "@/lib/data/files/metadata"
import { filesGetRootIdpath, filesWalkContentPieces } from "@/lib/data/files/utils"

const {
  argv: [_bun, _script],
} = process

showExecutionTime(async () => {
  const positions = await getMapPositionsExtended()
  const hashToPosition = new Map<string, MapPosition<number>>()
  for (const pos of positions) {
    hashToPosition.set(pos.hash, pos)
  }

  await filesWalkContentPieces(await filesGetRootIdpath(), async (diskpath, piece) => {
    await updateMetadata(diskpath, async (metadata) => {
      const position = hashToPosition.get(hash(piece))
      if (position) {
        const { left, top, width, height } = position.rectangle
        metadata.mapPosition = { left, top, width, height }
      }
    })
    return piece
  })

  await closeConnection()
})

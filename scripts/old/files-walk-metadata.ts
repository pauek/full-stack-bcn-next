import { updateMetadata } from "@/lib/data/files/metadata"
import { filesWalkContentPieces, filesGetRootIdpath } from "@/lib/data/files/utils"
import { showExecutionTime } from "@/lib/utils"

showExecutionTime(async () => {
  const rootIdpath = await filesGetRootIdpath()

  await filesWalkContentPieces(rootIdpath, async ({ piece, diskpath }) => {
    await updateMetadata(diskpath, async (metadata) => {
      if ("slideHashes" in metadata) {
        console.log(piece.idpath.join("/"))
        delete metadata.slideHashes
      }
    })
  })
})

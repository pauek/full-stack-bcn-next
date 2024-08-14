import { filesBackend } from "@/lib/data"
import { updateMetadata } from "@/lib/data/files/metadata"
import { getRoot } from "@/lib/data/root"
import { showExecutionTime } from "@/lib/utils"

showExecutionTime(async () => {
  const root = await getRoot(filesBackend)

  await filesBackend.walkContentPieces(root, async (piece, _) => {
    await updateMetadata(piece.diskpath, async (metadata) => {
      if ("slideHashes" in metadata) {
        console.log(piece.idpath.join("/"))
        delete metadata.slideHashes
      }
    })
  })
})

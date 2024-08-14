import { filesBackend } from "@/lib/data"
import { getRoot } from "@/lib/data/root"
import { showExecutionTime } from "@/lib/utils"
import { insertPieceWalker, uploadImages, walkFilesIfChanged, writeHashes } from "./lib/lib"
import { okToSkipMissingHashes } from "@/lib/data/files/utils"
import { courseUpdateMetadata } from "@/lib/data/files/metadata"

await showExecutionTime(async () => {
  const root = await getRoot(filesBackend)
  await okToSkipMissingHashes(async () => {
    await writeHashes()
  })
  await courseUpdateMetadata(filesBackend, root)
  await walkFilesIfChanged(false, root.idpath, insertPieceWalker)
  await uploadImages()
})
process.exit(0) // Force exit to avoid waiting

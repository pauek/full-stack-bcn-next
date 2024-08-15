import { filesWalkContentPieces, filesGetRootIdpath } from "@/lib/data/files/utils"
import { HashItem, hashPiece } from "@/lib/data/hashing"
import { showExecutionTime } from "@/lib/utils"
import { basename } from "path"

showExecutionTime(async () => {
  const rootIdpath = await filesGetRootIdpath()

  await filesWalkContentPieces<HashItem>(rootIdpath, async ({ piece, diskpath, children }) => {
    const filename = basename(diskpath)
    const computedHash = await hashPiece(piece, children)
    if (piece.hash !== computedHash) {
      console.log(`Hash mismatch: ${piece.hash} != ${computedHash} (${piece.idpath.join("/")})`)
    }
    return { hash: computedHash, filename }
  })
})

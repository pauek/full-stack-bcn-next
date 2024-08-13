import { filesBackend } from "@/lib/data/files"
import { hashPiece } from "@/lib/data/hashing"
import { getRoot } from "@/lib/data/root"
import { showExecutionTime } from "@/lib/utils"

showExecutionTime(async () => {
  const root = await getRoot(filesBackend)

  await filesBackend.walkContentPieces(root, async (piece, children) => {
    const computedHash = await hashPiece(filesBackend, piece, children)
    if (piece.hash !== computedHash.hash) {
      console.log(
        `Hash mismatch: ${piece.hash} != ${computedHash.hash} (${piece.idpath.join("/")})`,
      )
    }
    return computedHash
  })
})

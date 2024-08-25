import { hash, setHash } from "@/lib/adt"
import { filesGetRootIdpath, filesWalkContentPieces } from "@/lib/data/files/utils"
import { childrenHashes, hashPiece } from "@/lib/data/hashing"
import { showExecutionTime } from "@/lib/utils"

showExecutionTime(async () => {
  const rootIdpath = await filesGetRootIdpath()

  await filesWalkContentPieces(rootIdpath, async (diskpath, piece) => {
    const computedHash = await hashPiece(piece, await childrenHashes(piece))
    if (hash(piece) !== computedHash) {
      console.log(`Hash mismatch: ${hash(piece)} != ${computedHash} (${piece.idpath.join("/")})`)
    }
    setHash(piece, computedHash)
    return piece
  })
})

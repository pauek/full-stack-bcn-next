import { ContentPiece } from "@/lib/adt"
import {
  insertPiece,
  insertPieceHashmap,
  insertQuizAnswers,
  pieceSetParent,
} from "@/lib/data/db/insert"
import { collectAnswersForPiece } from "@/lib/data/files/answers"
import { courseUpdateMetadata } from "@/lib/data/files/metadata"
import {
  filesGetRootIdpath,
  filesWalkContentPieces,
  okToSkipMissingHashes,
} from "@/lib/data/files/utils"
import { showExecutionTime } from "@/lib/utils"
import { insertFiles, rewriteAllHashes, uploadImages } from "../lib/lib"

await showExecutionTime(async () => {
  await okToSkipMissingHashes(async () => {
    await rewriteAllHashes()
  })
  const rootIdpath = await filesGetRootIdpath()
  await courseUpdateMetadata(rootIdpath)
  await filesWalkContentPieces<ContentPiece>(rootIdpath, async ({ piece, children }) => {
    console.log(piece.hash, piece.idpath.join("/"), " ".repeat(40))
    await insertPiece(piece)
    await insertPieceHashmap(piece)
    await insertFiles(piece)

    const answers = await collectAnswersForPiece(piece)
    await insertQuizAnswers(answers)

    for (const child of children) {
      await pieceSetParent(child.hash, piece.hash)
    }

    return piece
  })

  await uploadImages()
})
process.exit(0) // Force exit to avoid waiting

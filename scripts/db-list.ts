import { FileType, FileTypeValues } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { closeConnection } from "@/lib/data/db/db"
import { getRoot } from "@/lib/data/root"
import { showExecutionTime } from "@/lib/utils"
import chalk from "chalk"
import { dbBackend } from "@/lib/data"
import data from "@/lib/data"
import { getPieceFilesByFiletype } from "@/lib/data/db/utils"

const {
  argv: [_bun, _script, idjpath],
} = process

showExecutionTime(async () => {
  const info = dbBackend.getInfo()
  console.log(chalk.gray(`[${info}]`))

  let root: ContentPiece | null = null
  if (idjpath) {
    root = await dbBackend.getPiece(idjpath.split("/"))
    if (!root) {
      console.error(`Piece "${idjpath}" not found.`)
      process.exit(1)
    }
  } else {
    root = await getRoot(data)
  }

  await dbBackend.walkContentPieces(root, async (piece, _children) => {
    console.log(piece.hash, piece.idpath.join("/"))
    for (const filetype of FileTypeValues) {
      const files = await getPieceFilesByFiletype(piece.hash, filetype as FileType)
      for (const file of files || []) {
        console.log(chalk.gray(`  ${file.hash} ${filetype} ${file.filename}`))
      }
    }
  })

  await closeConnection()
})

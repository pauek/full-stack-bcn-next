import { FileType, FileTypeValues } from "@/data/schema"
import { ContentPiece, hash } from "@/lib/adt"
import data from "@/lib/data"
import { closeConnection } from "@/lib/data/db/db"
import { getPieceFilesByFiletype } from "@/lib/data/db/utils"
import { filesGetRoot } from "@/lib/data/files/utils"
import { showExecutionTime } from "@/lib/utils"
import chalk from "chalk"

const {
  argv: [_bun, _script, idjpath],
} = process

showExecutionTime(async () => {
  const info = data.getInfo()
  console.log(chalk.gray(`[${info}]`))

  let root: ContentPiece | null = null
  if (idjpath) {
    root = await data.getPiece(idjpath.split("/"))
    if (!root) {
      console.error(`Piece "${idjpath}" not found.`)
      process.exit(1)
    }
  } else {
    root = await filesGetRoot()
  }

  await data.walkContentPieces(root, async (piece, _children) => {
    console.log(hash(piece), piece.idpath.join("/"))
    for (const filetype of FileTypeValues) {
      const files = await getPieceFilesByFiletype(hash(piece), filetype as FileType)
      for (const file of files || []) {
        console.log(chalk.gray(`  ${file.hash} ${filetype} ${file.filename}`))
      }
    }
  })

  await closeConnection()
})

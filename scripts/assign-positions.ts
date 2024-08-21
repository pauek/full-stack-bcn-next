/*

Asignamos posiciones a los doc.mdx y a los ejercicios y actividades que pueden tener.
1. Determinar el rectángulo de cada capítulo.
2. Situar las actividades dentro con un tamaño muy pequeño

*/

import { FileType } from "@/data/schema"
import { getAllPieceAttachments } from "@/lib/data/files/attachments"
import { PositionUpdate, updateMapPositions } from "@/lib/data/files/positions"
import { filesGetRootIdpath, filesWalkContentPieces } from "@/lib/data/files/utils"

await filesWalkContentPieces<void>(filesGetRootIdpath(), async ({ piece }) => {
  if (piece.metadata.level !== 1) {
    return
  }
  console.log(piece.idpath, piece.metadata.level)
  console.log(piece.metadata.mapPosition)

  const pos = piece.metadata.mapPosition
  let i = 0
  let j = 0

  // Assign positions
  const attachments = await getAllPieceAttachments(piece)
  const positions: PositionUpdate[] = []
  for (const att of attachments) {
    if ([FileType.doc, FileType.exercise].includes(att.filetype)) {
      console.log(`${att.filetype.padEnd(9)} ${att.filename}`)
      positions.push({
        hash: att.hash,
        kind: att.filetype,
        idpath: piece.idpath,
        name: att.filename,
        rectangle: {
          left: 10 + pos.left + j * 130,
          top: 20 + pos.top + i * 30,
          width: 120,
          height: 30,
        },
      })
      i++
      if (i >= 3) {
        i = 0
        j++
      }
    }
  }

  try {
    await updateMapPositions(positions)
  } catch (e) {
    console.error(`Could not update positions for ${piece.idpath}:`, e)
  }
})

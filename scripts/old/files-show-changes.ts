import { getChangedPieces } from "@/lib/data/files/hash-maps"
import { courseUpdateMetadata } from "@/lib/data/files/metadata"
import { filesGetRootIdpath } from "@/lib/data/files/utils"
import { showExecutionTime } from "@/lib/utils"

/*

Para cada cambio:
- Subir los nuevos hashes (insertPiece para cada hash, con sus ficheros cada uno).
- Actualizar el hashmap (tanto en db como ficheros).

*/

showExecutionTime(async () => {
  const rootIdpath = await filesGetRootIdpath()
  await courseUpdateMetadata(rootIdpath)
  const changes = await getChangedPieces(rootIdpath)

  if (changes.length === 0) {
    console.log("No changes.")
  } else {
    for (const change of changes) {
      console.log(change.newHash, change.idpath.join("/"))
    }
  }
})

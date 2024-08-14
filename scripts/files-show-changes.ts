import { filesBackend } from "@/lib/data"
import { getChangedPieces } from "@/lib/data/changes"
import { courseUpdateMetadata } from "@/lib/data/files/metadata"
import { getRoot } from "@/lib/data/root"
import { showExecutionTime } from "@/lib/utils"

/*

Para cada cambio:
- Subir los nuevos hashes (insertPiece para cada hash, con sus ficheros cada uno).
- Actualizar el hashmap (tanto en db como ficheros).

*/

showExecutionTime(async () => {
  const root = await getRoot(filesBackend)
  await courseUpdateMetadata(filesBackend, root)
  const changes = await getChangedPieces(root)

  if (changes.length === 0) {
    console.log("No changes.")
  } else {
    for (const change of changes) {
      console.log(change.newHash, change.idpath.join("/"))
    }
  }
})

import { filesBackend } from "@/lib/data";
import { getChangedPieces, getCourseRoot } from "@/lib/data/changes";
import { courseUpdateMetadata } from "@/lib/data/files";

/*

Para cada cambio:
- Subir los nuevos hashes (insertPiece para cada hash, con sus ficheros cada uno).
- Actualizar el hashmap (tanto en db como ficheros).

*/

// await writePieceStoredHashes(changes);
// await applyChangesToDatabase(changes);
// await updateHashmapFile(changes);

const course = await getCourseRoot();
await courseUpdateMetadata(filesBackend, course);
const changes = await getChangedPieces(course);

if (changes.length === 0) {
  console.log("No changes.");
} else {
  for (const change of changes) {
    console.log(change.newHash, change.idpath.join("/"));
  }
}

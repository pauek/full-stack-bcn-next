import { filesBackend } from "@/lib/data";
import { updateMetadata } from "@/lib/data/files";
import { getCourseRoot } from "@/lib/data/root";

const root = await getCourseRoot();

await filesBackend.walkContentPieces(root, async (piece, _) => {
  await updateMetadata(piece.diskpath, async (metadata) => {
    if ("slideHashes" in metadata) {
      console.log(piece.idpath.join("/"));
      delete metadata.slideHashes;
    }
  });
});

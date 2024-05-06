import { courseUpdateMetadata, filesBackend, okToSkipMissingHashes } from "@/lib/data/files";
import { getRoot } from "@/lib/data/root";
import { showExecutionTime } from "@/lib/utils";
import { insertPieceWalker, uploadImages, walkFilesIfChanged, writeHashes } from "./lib";

await showExecutionTime(async () => {
  const root = await getRoot(filesBackend);
  await okToSkipMissingHashes(async () => {
    await writeHashes();
  });
  await courseUpdateMetadata(filesBackend, root);
  await walkFilesIfChanged(false, root.idpath, insertPieceWalker);
  await uploadImages();
});
process.exit(0); // Force exit to avoid waiting

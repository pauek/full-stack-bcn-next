import { FileType } from "@/data/schema";
import { withImageUploader } from "@/lib/data/images";
import { showExecutionTime } from "@/lib/utils";

await showExecutionTime(async () => {
  await withImageUploader({ parallelRequests: 20 }, async (uploader) => {
    const existing = new Set<string>();
    for (const { name } of await uploader.listAllFiles()) {
      if (name) existing.add(name);
    }
    const types: FileType[] = [FileType.image, FileType.slide, FileType.cover];
    for (const ty of types) {
      await uploader.uploadAllFilesOfType(ty as FileType, existing);
    }
  });
});

process.exit(0); // Force exit to avoid waiting
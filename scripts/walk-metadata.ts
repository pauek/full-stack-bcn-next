import { readMetadata, writeMetadata } from "@/lib/files/files";
import { walkContentPieces } from "@/lib/files/hashes";
import { join } from "path";

const fullstackPath = join(process.env.CONTENT_ROOT!, "fullstack");

walkContentPieces(fullstackPath, async (diskpath, _) => {
  const metadata = await readMetadata(diskpath);
  for (const field in metadata) {
    if (Array.isArray(metadata[field])) {
      console.log(diskpath, field, metadata[field]);
    }
  }
  await writeMetadata(diskpath, metadata);
})
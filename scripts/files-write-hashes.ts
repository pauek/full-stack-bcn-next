import { filesBackend } from "@/lib/data/files";
import { writeStoredHash } from "@/lib/data/files";
import { HashMapInfo, writeHashMapFile } from "@/lib/data/hash-maps";
import { hashAllContent } from "@/lib/data/hashing";
import { getRoot } from "@/lib/data/root";
import { showExecutionTime } from "@/lib/utils";

showExecutionTime(async () => {
  const root = await getRoot(filesBackend);

  const allHashes = await hashAllContent(filesBackend, root);

  const entries: HashMapInfo[] = [];
  for (const [idjpath, { hash, diskpath }] of allHashes) {
    await writeStoredHash(diskpath, hash);
    entries.push({ hash, idjpath, diskpath });
    console.log(hash, idjpath);
  }

  await writeHashMapFile(entries);
});

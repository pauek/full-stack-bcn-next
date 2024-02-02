import backend from "@/lib/data";
import { writeStoredHash } from "@/lib/data/files";
import { HashMapInfo, writeHashMapFile } from "@/lib/data/hash-maps";
import { hashAllContent } from "@/lib/data/hashing";
import { getCourseRoot } from "@/lib/data/root";

const root = await getCourseRoot();

const allHashes = await hashAllContent(backend, root);

const entries: HashMapInfo[] = [];
for (const [idjpath, { hash, diskpath }] of allHashes) {
  await writeStoredHash(diskpath, hash);
  entries.push({ hash, idjpath, diskpath });
  console.log(hash, idjpath);
}

await writeHashMapFile(entries);

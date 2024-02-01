import { getPiece, writeStoredHash } from "@/lib/data/files";
import { hashAllContent } from "@/lib/data/hashing";
import backend from "@/lib/data";
import { HashMapInfo, writeHashMapFile } from "@/lib/data/hash-maps";

const courseId = process.env.COURSE_ID!;

const root = await getPiece([courseId]);
if (!root) {
  throw `Course "${courseId}" not found!`;
}

const allHashes = await hashAllContent(backend, root);

const entries: HashMapInfo[] = [];
for (const [idjpath, { hash, diskpath }] of allHashes) {
  await writeStoredHash(diskpath, hash);
  entries.push({ hash, idjpath, diskpath });
  console.log(hash, idjpath);
}

await writeHashMapFile(entries);

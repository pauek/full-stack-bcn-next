import { HashMapInfo, getPiece, hashAllContent, writeHashMapFile } from "@/lib/data/files";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}

const allHashes = await hashAllContent(fullstack);

const entries: HashMapInfo[] = [];
for (const [idjpath, { hash, diskpath }] of allHashes) {
  entries.push({ hash, idjpath, diskpath });
}

await writeHashMapFile(entries);

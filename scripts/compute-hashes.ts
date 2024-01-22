import { HASH_MAP_FILE, getPiece, hashAllContent } from "@/lib/data/files";
import { writeFile } from "fs/promises";
import { join } from "path";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}

const allHashes = await hashAllContent(fullstack);

const entries: Record<string, string>[] = [];
for (const [path, { hash, diskpath }] of allHashes) {
  entries.push({ hash, path, diskpath });
}

const hashMapFilePath = join(process.cwd(), "lib", "data", "db", HASH_MAP_FILE);
await writeFile(hashMapFilePath, JSON.stringify(entries, null, 2));

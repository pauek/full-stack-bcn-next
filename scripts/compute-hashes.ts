import { HASH_MAP_FILE, getPiece, hashAllContent } from "@/lib/data/files";
import { writeFile } from "fs/promises";
import { join } from "path";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}

const result = await hashAllContent(fullstack);

const entries: Record<string, string>[] = [];
for (const [path, { hash, diskpath }] of result) {
  entries.push({ hash, path, diskpath });
}

const mapPath = join(process.cwd(), "lib", "db", HASH_MAP_FILE);
await writeFile(mapPath, JSON.stringify(entries, null, 2));

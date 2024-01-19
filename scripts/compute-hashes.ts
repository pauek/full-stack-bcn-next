import { getPiece } from "@/lib/files/files";
import { HASH_MAP, hashAllContent } from "@/lib/files/hashes";
import { writeFile } from "fs/promises";
import { join } from "path";

const fullstack = await getPiece(["fullstack"]);
if (!fullstack) {
  throw `Course "fullstack" not found!`;
}

const result = await hashAllContent(fullstack);

const lines: string[] = [];
for (const [path, { hash, diskpath }] of result) {
  lines.push(`${hash};${path};${diskpath}`);
}

const mapPath = join(process.env.CONTENT_ROOT!, HASH_MAP);
await writeFile(mapPath, lines.join("\n") + "\n");
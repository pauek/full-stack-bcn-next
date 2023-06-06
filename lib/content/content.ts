import { readdir } from "fs/promises";

const CONTENT_DIR = process.env.CONTENT;
if (!CONTENT_DIR) {
  throw new Error("CONTENT_DIR not set!");
}

export const readDirs = async () => {
  const dirs: string[] = [];
  const entities = await readdir(CONTENT_DIR, { withFileTypes: true });
  for (const ent of entities) {
    if (ent.isDirectory()) {
      dirs.push(ent.name);
    }
  }
  return dirs;
}
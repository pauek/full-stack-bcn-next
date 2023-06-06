import { readFile, readdir } from "fs/promises";
import { join } from "path";

const CONTENT_DIR = process.env.CONTENT;
if (!CONTENT_DIR) {
  throw new Error("CONTENT_DIR not set!");
}
console.log(CONTENT_DIR);

const levelToType = (n: number) => ["part", "session", "chapter"][n];

type ContentType = "part" | "session" | "chapter";
export type ContentDir = {
  type: ContentType;
  name: string;
  path: string;
  level: number;
  children: null | Array<ContentDir>;
  metadata: Record<string, any>;
};

const dirNameToTitle = (dirName: string) => {
  const firstSpace = dirName.indexOf(" ");
  return firstSpace !== -1 ? dirName.slice(firstSpace + 1) : dirName;
};

const readMetadata = async (path: string) => {
  try {
    const bytes = await readFile(join(path, ".meta.json"));
    return JSON.parse(bytes.toString());
  } catch (e) {
    console.warn(`Couldn't read metadata for ${path}`);
    return {};
  }
};

type Options = {
  recursive: boolean;
};
const _readContentDir = async (
  path: string,
  level: number,
  { recursive }: Options = { recursive: false }
): Promise<Array<ContentDir> | null> => {
  const result: Array<ContentDir> = [];
  const entities = await readdir(path, { withFileTypes: true });

  // Sort by name
  entities.sort((a, b) => a.name.localeCompare(b.name));

  // Assemble array of ContentDirs
  for (const ent of entities) {
    if (ent.isDirectory()) {
      const dirPath = join(path, ent.name);
      const dir: ContentDir = {
        type: levelToType(level) as ContentType,
        name: dirNameToTitle(ent.name),
        path: dirPath,
        level: level,
        children: null,
        metadata: await readMetadata(dirPath),
      };
      if (recursive && level < 2) {
        dir.children = await _readContentDir(join(path, ent.name), level + 1, {
          recursive,
        });
      }
      result.push(dir);
    }
  }
  return result.length > 0 ? result : null;
};

export const readTree = () =>
  _readContentDir(CONTENT_DIR, 0, { recursive: true });

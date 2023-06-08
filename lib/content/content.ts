import { readFile, readdir } from "fs/promises";
import { join } from "path";

const CONTENT_DIR = process.env.CONTENT;
if (!CONTENT_DIR) {
  throw new Error("CONTENT_DIR not set!");
}

const levelToType = (n: number) => ["root", "part", "session", "chapter"][n];

const readDirWithFileTypes = (path: string) => {
  return readdir(path, { withFileTypes: true });
};

type ContentType = "root" | "part" | "session" | "chapter";
export type ContentDir = {
  type: ContentType;
  name: string;
  path: string;
  level: number;
  children: null | Array<ContentDir>;
  metadata: Record<string, any>;
  doc?: string;
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

class ContentReader {
  recursive: boolean;
  currentSlug: Array<string>;
  sessionMap: Map<string, ContentDir>;
  sessionIndex: number = 0;

  constructor(options: Options = { recursive: false }) {
    this.recursive = options.recursive;
    this.currentSlug = [];
    this.sessionMap = new Map();
  }

  async readChildren(path: string, level: number) {
    const entities = await readDirWithFileTypes(path);
    entities.sort((a, b) => a.name.localeCompare(b.name));
    const children: Array<ContentDir> = [];
    for (const ent of entities) {
      if (ent.isDirectory() && !ent.name.startsWith("_") && ent.name !== "slides") {
        const dir = await this.readContentDir(path, ent.name, level + 1);
        children.push(dir);
      }
    }
    return children.length > 0 ? children : null;
  }

  pushSlug(slug: string) {
    if (slug) {
      this.currentSlug.push(slug);
    }
  }

  popSlug(slug: string) {
    if (slug) {
      this.currentSlug.pop();
    }
  }

  async readDoc(path: string) {
    try {
      const buf = await readFile(join(path, "doc.svx"));
      return buf.toString();
    } catch (e) {
      return undefined;
    }
  }

  async readContentDir(basePath: string, name: string = "", level: number = 0) {
    const path = join(basePath, name);

    const result: ContentDir = {
      type: levelToType(level) as ContentType,
      name: dirNameToTitle(name),
      path,
      level,
      metadata: await readMetadata(path),
      children: null,
    };

    this.pushSlug(result.metadata.slug);

    if (result.type !== "chapter") {
      result.children = await this.readChildren(path, level);
    }

    switch (result.type) {
      case "session": {
        result.children = await this.readChildren(path, level);
        this.sessionMap.set(this.currentSlug.join("/"), result);
        result.metadata.index = ++this.sessionIndex;
        break;
      }
      case "chapter": {
        result.doc = await this.readDoc(path);
      }
    }

    this.popSlug(result.metadata.slug);
    return result;
  }
}

type Content = [ContentDir, Map<string, ContentDir>];

export const loadContent = async (): Promise<Content> => {
  const reader = new ContentReader({ recursive: true });
  const root = await reader.readContentDir(CONTENT_DIR);

  return [root, reader.sessionMap];
};

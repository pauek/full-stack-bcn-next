import { exists, readFile, readdir, writeFile } from "fs/promises";
import { join } from "path";
import { __CONTENT_ROOT, walkContentPiecesGeneric } from "../files";
import { ContentPiece } from "../../adt";
import { readMetadata } from "./metadata";
import { removeNullElements } from "@/lib/utils";

export const HASH_FILE = ".hash";
export const HASH_MAP_FILE = "./lib/data/hashes.json";

export type Hash = string;

export type AbstractContentPiece = {
  files: string[];
  metadata: Record<string, string>;
  children: AbstractContentPiece;
};

export const hashAny = (x: any) => {
  const hasher = new Bun.CryptoHasher("sha256");
  if (typeof x === "number") {
    hasher.update(`number(${x})`);
  } else if (typeof x === "string") {
    hasher.update(`string(${x})`);
  } else if (typeof x === "boolean") {
    hasher.update(`boolean(${x})`);
  } else if (Array.isArray(x)) {
    hasher.update(x.map((elem) => hashAny(elem)).join("\n"));
  } else if (x instanceof Buffer) {
    hasher.update(x.buffer);
  } else if (typeof x === "object") {
    hasher.update(
      Object.entries(x)
        .map(([field, value]) => hashAny(`${field}=${value}\n`))
        .join("")
    );
  } else {
    throw `hash: Unsupported type ${typeof x}: ${JSON.stringify(x)}`;
  }
  return hasher.digest("hex");
};

const isPieceFile = (filename: string) => {
  return filename === "doc.mdx" || filename.startsWith("cover.");
};
const isPieceSubdir = (dir: string) => dir === "images" || dir === "slides";

export const hashFile = async (diskpath: string) => hashAny(await readFile(diskpath));

export const readStoredHash = async (diskpath: string): Promise<string | null> => {
  const hashFilePath = join(diskpath, ".hash");
  if (!(await exists(hashFilePath))) {
    return null;
  }
  try {
    const fileContents = await readFile(hashFilePath);
    return fileContents.toString();
  } catch (e) {
    console.warn(`Warning: error reading .hash at ${diskpath}.`);
    return null;
  }
};

export const hashPiece = async (
  diskpath: string,
  children: Hash[],
  options?: { save: boolean }
): Promise<Hash> => {
  const hashes: { name: string; hash: string }[] = children.map((hash) => ({
    name: "",
    hash,
  }));

  const metadata = await readMetadata(diskpath);
  for (const field in metadata) {
    hashes.push({
      name: field,
      hash: hashAny(metadata[field]),
    });
  }

  const hashSubdir = async (subdir: string) => {
    const subdirpath = join(diskpath, subdir);
    for (const ent of await readdir(subdirpath, { withFileTypes: true })) {
      if (ent.isFile()) {
        hashes.push({
          name: `${subdir}/${ent.name}`,
          hash: await hashFile(join(subdirpath, ent.name)),
        });
      }
    }
  };

  for (const ent of await readdir(diskpath, { withFileTypes: true })) {
    if (ent.isFile() && isPieceFile(ent.name)) {
      hashes.push({
        name: ent.name,
        hash: await hashFile(join(diskpath, ent.name)),
      });
    } else if (ent.isDirectory() && isPieceSubdir(ent.name)) {
      await hashSubdir(ent.name);
    }
  }

  hashes.sort((a, b) => {
    // first by name, then by hash
    const cmp1 = a.name.localeCompare(b.name);
    if (cmp1 != 0) return cmp1;
    const cmp2 = a.hash.localeCompare(b.hash);
    return cmp2;
  });

  const concat = hashes.map(({ name, hash }) => `${hash} ${name}\n`).join("");
  const result = hashAny(concat);
  if (options?.save) {
    await writeFile(join(diskpath, HASH_FILE), result);
  }
  return result;
};

export const hashAllContent = async (piece: ContentPiece) => {
  const hashes: Map<string, { hash: Hash; diskpath: string }> = new Map();
  
  await walkContentPiecesGeneric<Hash>(piece, async (piece, children) => {
    const hash = await hashPiece(piece.diskpath, children, { save: true });
    const idjpath = piece.idpath.join("/");
    hashes.set(idjpath, {
      hash,
      diskpath: piece.diskpath,
    });
    return hash;
  });

  return hashes;
};

let mapRead: boolean = false;

export type HashMapInfo = {
  hash: string;
  idjpath: string;
  diskpath: string;
};

type GlobalHashMaps = {
  info: (HashMapInfo | null)[];
  byHash: Map<string, number>;
  byPath: Map<string, number>;
};

const globalHashMaps: GlobalHashMaps = {
  info: [],
  byHash: new Map<string, number>(),
  byPath: new Map<string, number>(),
};

export const readHashMapFile = async (): Promise<GlobalHashMaps> => {
  const diskpath = join(process.cwd(), HASH_MAP_FILE);
  const buffer = await readFile(diskpath);
  const entries = JSON.parse(buffer.toString());

  const hashMaps: GlobalHashMaps = {
    info: [],
    byHash: new Map(),
    byPath: new Map(),
  };
  for (const { hash, idjpath, diskpath } of entries) {
    const index = hashMaps.info.length;
    hashMaps.info[index] = { hash, idjpath, diskpath };
    hashMaps.byHash.set(hash, index);
    hashMaps.byPath.set(idjpath, index);
  }
  return hashMaps;
};

export const writeHashMapFile = async (entries: (HashMapInfo | null)[]) => {
  const diskpath = join(process.cwd(), HASH_MAP_FILE);
  await writeFile(diskpath, JSON.stringify(removeNullElements(entries), null, 2));
};

const readMaps = async () => {
  const result = await readHashMapFile();
  globalHashMaps.info = result.info;
  globalHashMaps.byHash = result.byHash;
  globalHashMaps.byPath = result.byPath;
};

export const hashToDiskpath = async (hash: string) => {
  if (!mapRead) {
    await readMaps();
    mapRead = true;
  }
  const index = globalHashMaps.byHash.get(hash);
  if (!index) {
    return undefined;
  }
  return globalHashMaps.info[index]?.diskpath;
};

export const pathToHash = async (path: string) => {
  if (!mapRead) {
    await readMaps();
    mapRead = true;
  }
  const index = globalHashMaps.byPath.get(path);
  if (!index) {
    return undefined;
  }
  return globalHashMaps.info[index]?.hash;
};

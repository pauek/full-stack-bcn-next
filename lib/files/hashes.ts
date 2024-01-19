import { readFile, readdir, writeFile } from "fs/promises";
import { join } from "path";
import { ContentPiece } from "../adt";
import { __CONTENT_ROOT, readMetadata, readPieceAtSubdir } from "./files";

export const HASH_FILE = ".hash";
export const HASH_MAP = ".hashmap";

export type Hash = string;

export type AbstractContentPiece = {
  files: string[];
  metadata: Record<string, string>;
  children: AbstractContentPiece;
};

const rPieceDirectory = /^[0-9]{2} +.+$/;

export const hash = (x: any) => {
  const hasher = new Bun.CryptoHasher("sha256");
  if (typeof x === "number") {
    hasher.update(`number(${x})`);
  } else if (typeof x === "string") {
    hasher.update(`string(${x})`);
  } else if (typeof x === "boolean") {
    hasher.update(`boolean(${x})`);
  } else if (Array.isArray(x)) {
    hasher.update(x.map((elem) => hash(elem)).join("\n"));
  } else if (x instanceof Buffer) {
    hasher.update(x.buffer);
  } else if (typeof x === "object") {
    hasher.update(
      Object.entries(x)
        .map(([field, value]) => hash(`${field}=${value}\n`))
        .join("")
    );
  } else {
    throw `hash: Unsupported type ${typeof x}: ${JSON.stringify(x)}`;
  }
  return hasher.digest("hex");
};

type WalkFunc<T> = (piece: ContentPiece, children: T[]) => Promise<T>;

export const walkContentPieces = async <T>(
  piece: ContentPiece,
  func: WalkFunc<T>
) => {
  const childSubdirs: string[] = [];
  for (const ent of await readdir(piece.diskpath, { withFileTypes: true })) {
    if (ent.isDirectory() && ent.name.match(rPieceDirectory)) {
      childSubdirs.push(ent.name);
    }
  }
  childSubdirs.sort();

  const children: T[] = [];
  const results = await Promise.allSettled(
    childSubdirs.map(async (subdir) => {
      const childDir = join(piece.diskpath, subdir);
      const child = await readPieceAtSubdir(childDir, piece);
      child.idpath = [...piece.idpath, child.id];
      child.parent = piece;
      return walkContentPieces(child, func);
    })
  );
  for (const res of results) {
    if (res.status === "rejected") {
      throw `walkContentPieces: some promise rejected: ${res.reason}`;
    }
    children.push(res.value);
  }
  return await func(piece, children);
};

const isPieceFile = (filename: string) => {
  return filename === "doc.mdx" || filename.startsWith("cover.");
};
const isPieceSubdir = (dir: string) => dir === "images" || dir === "slides";

export const hashFile = async (diskpath: string) =>
  hash(await readFile(diskpath));

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
      hash: hash(metadata[field]),
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
  const result = hash(concat);
  if (options?.save) {
    await writeFile(join(diskpath, HASH_FILE), result);
  }
  return result;
};

export const hashAllContent = async (piece: ContentPiece) => {
  const hashes: Map<string, { hash: Hash, diskpath: string }> = new Map();
  await walkContentPieces<Hash>(piece, async (piece, children) => {
    const hash = await hashPiece(piece.diskpath, children, { save: true });
    hashes.set(piece.idpath.join("/"), { hash, diskpath: piece.diskpath });
    return hash;
  });
  return hashes;
};

let mapsRead: boolean = false;
const hash2diskpath: Map<string, string> = new Map();
const path2hash: Map<string, string> = new Map();

const maybeReadMaps = async () => {
  if (mapsRead) {
    return;
  }
  const mapPath = join(__CONTENT_ROOT, HASH_MAP);
  const buffer = await readFile(mapPath);
  const lines = buffer.toString().split("\n").filter(Boolean);
  for (const line of lines) {
    const [hash, path, diskpath] = line.split(";");
    hash2diskpath.set(hash, diskpath);
    path2hash.set(path, hash);
  }
  mapsRead = true;
};

export const hashToDiskpath = async (hash: string) => {
  await maybeReadMaps();
  return hash2diskpath.get(hash);
};

export const pathToHash = async (path: string) => {
  await maybeReadMaps();
  return path2hash.get(path);
};

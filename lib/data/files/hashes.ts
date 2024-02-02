import { CONTENT_ROOT } from "@/lib/env";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { Changes } from "../hash-maps";

const HASH_FILE = ".hash";
export const HASH_MAP_FILE = join(CONTENT_ROOT, "./hashes.json");

export const readStoredHash = async (diskpath: string): Promise<string | null> => {
  try {
    const fileContents = await readFile(join(diskpath, HASH_FILE));
    return fileContents.toString();
  } catch (e) {
    console.warn(`Warning: error reading .hash at ${diskpath}.`);
    return null;
  }
};

export const readStoredHashOrThrow = async (diskpath: string): Promise<string> => {
  const hash = await readStoredHash(diskpath);
  if (hash === null) {
    throw new Error(`Hash not found at ${diskpath}`);
  }
  return hash;
};

export const writeStoredHash = async (diskpath: string, hash: string) => {
  await writeFile(join(diskpath, HASH_FILE), hash);
};

const writePieceStoredHashes = async (changes: Changes) => {
  for (const { diskpath, newHash } of changes) {
    await writeStoredHash(diskpath, newHash);
  }
};

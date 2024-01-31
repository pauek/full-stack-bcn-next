import { exists, readFile, writeFile } from "fs/promises";
import { join } from "path";

export const HASH_FILE = ".hash";
export const HASH_MAP_FILE = "./lib/data/hashes.json";

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

export const writeStoredHash = async (diskpath: string, hash: string) => {
  await writeFile(join(diskpath, HASH_FILE), hash);
};

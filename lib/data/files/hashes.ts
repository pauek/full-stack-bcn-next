import { getContentRoot } from "@/lib/env-files"
import { readFile, writeFile } from "fs/promises"
import { join } from "path"

const HASH_FILE = ".hash"
export const getHashmapFilepath = () => join(getContentRoot(), "./hashmap.csv")

export const readStoredHash = async (diskpath: string): Promise<string | null> => {
  try {
    const fileContents = await readFile(join(diskpath, HASH_FILE))
    return fileContents.toString()
  } catch (e) {
    console.warn(`Warning: error reading .hash at ${diskpath}.`)
    return null
  }
}

export const readStoredHashOrThrow = async (diskpath: string): Promise<string> => {
  const hash = await readStoredHash(diskpath)
  if (hash === null) {
    throw new Error(`Hash not found at ${diskpath}`)
  }
  return hash
}

export const writeStoredHash = async (diskpath: string, hash: string) => {
  await writeFile(join(diskpath, HASH_FILE), hash)
}

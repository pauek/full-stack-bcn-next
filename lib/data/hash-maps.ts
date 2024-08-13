import { join } from "path"
import { HASH_MAP_FILE } from "./files/hashes"
import { readFile, writeFile } from "fs/promises"
import { removeNullElements } from "../utils"

let mapRead: boolean = false

export type HashMapInfo = {
  hash: string
  idjpath: string
  diskpath: string
}

type GlobalHashMaps = {
  info: (HashMapInfo | null)[]
  byHash: Map<string, number>
  byPath: Map<string, number>
}

const globalHashMaps: GlobalHashMaps = {
  info: [],
  byHash: new Map<string, number>(),
  byPath: new Map<string, number>(),
}

const readMaps = async () => {
  const result = await readHashMapFile()
  globalHashMaps.info = result.info
  globalHashMaps.byHash = result.byHash
  globalHashMaps.byPath = result.byPath
}

export const hashToDiskpath = async (hash: string) => {
  if (!mapRead) {
    await readMaps()
    mapRead = true
  }
  const index = globalHashMaps.byHash.get(hash)
  if (!index) {
    return undefined
  }
  return globalHashMaps.info[index]?.diskpath
}

export const pathToHash = async (path: string) => {
  if (!mapRead) {
    await readMaps()
    mapRead = true
  }
  const index = globalHashMaps.byPath.get(path)
  if (!index) {
    return undefined
  }
  return globalHashMaps.info[index]?.hash
}

export const readHashMapFile = async (): Promise<GlobalHashMaps> => {
  const diskpath = join(process.cwd(), HASH_MAP_FILE)
  const buffer = await readFile(diskpath)
  const entries = JSON.parse(buffer.toString())

  const hashMaps: GlobalHashMaps = {
    info: [],
    byHash: new Map(),
    byPath: new Map(),
  }
  for (const { hash, idjpath, diskpath } of entries) {
    const index = hashMaps.info.length
    hashMaps.info[index] = { hash, idjpath, diskpath }
    hashMaps.byHash.set(hash, index)
    hashMaps.byPath.set(idjpath, index)
  }
  return hashMaps
}

export const writeHashMapFile = async (entries: (HashMapInfo | null)[]) => {
  const diskpath = join(process.cwd(), HASH_MAP_FILE)
  await writeFile(diskpath, JSON.stringify(removeNullElements(entries), null, 2))
}

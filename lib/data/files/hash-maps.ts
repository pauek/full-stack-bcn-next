import { readFile, writeFile } from "fs/promises"
import { basename, join } from "path"
import { removeNullElements } from "../../utils"
import { HashItem, hashPiece } from "../hashing"
import { HASH_MAP_FILE, readStoredHash } from "./hashes"
import { filesWalkContentPieces } from "./utils"
import { env } from "@/lib/env.mjs"

export type HashmapEntry = {
  hash: string
  idpath: string[]
  diskpath: string
  level: number
}

export type HashmapChange = {
  oldHash: string | null
  newHash: string
  idpath: string[]
  diskpath: string
  children: string[]
}

type GlobalHashmaps = {
  loaded: boolean
  entries: (HashmapEntry | null)[]
  byHash: Map<string, number>
  byIdjpath: Map<string, number>
}

const globalHashmaps: GlobalHashmaps = {
  loaded: false,
  entries: [],
  byHash: new Map<string, number>(),
  byIdjpath: new Map<string, number>(),
}

const hashmapAdd = (hash: string, idpath: string[], diskpath: string, level: number) => {
  const pos = globalHashmaps.entries.length
  globalHashmaps.entries.push({ hash, idpath, diskpath, level })
  globalHashmaps.byHash.set(hash, pos)
  globalHashmaps.byIdjpath.set(idpath.join("/"), pos)
}

const hashmapUpdate = (
  oldHash: string | null,
  newHash: string,
  idpath: string[],
  diskpath: string
) => {
  const pos = findHashIndex(oldHash)
  const oldEntry = globalHashmaps.entries[pos]
  globalHashmaps.entries[pos] = { hash: newHash, diskpath, idpath, level: oldEntry?.level || -1 }
  globalHashmaps.byHash.set(newHash, pos)
  globalHashmaps.byIdjpath.set(idpath.join("/"), pos)
}

const loadGlobalHashmap = async () => {
  if (globalHashmaps.loaded) {
    return
  }

  // 1. Try reading from file
  try {
    await readGlobalHashmap()
  } catch (e) {
    console.warn(`Warning: could not read hashmap from file`)
  }
  if (globalHashmaps.loaded) {
    return
  }

  type Item = HashItem & { level: number }

  // 2. Walk the files directly
  await filesWalkContentPieces<Item>([env.COURSE_ID], async ({ piece, diskpath, children }) => {
    const level = 1 + Math.max(0, ...children.map(({ level }) => level))

    // 2a. try getting it from file
    let hash = await readStoredHash(diskpath)
    if (hash !== null) {
      hashmapAdd(hash, piece.idpath, diskpath, level)
      return { hash, filename: basename(diskpath) }
    }

    // 2b. compute it
    hash = await hashPiece(piece, children)
    hashmapAdd(hash, piece.idpath, diskpath, level)
  })

  globalHashmaps.loaded = true

  // Now write the file, for next time
  await writeGlobalHashmap(globalHashmaps.entries)
}

export const getAllIdjpaths = async (prefix: string) => {
  if (!globalHashmaps.loaded) {
    await loadGlobalHashmap()
  }
  return [...globalHashmaps.byIdjpath.keys()].filter((idjpath) => idjpath.startsWith(prefix))
}

export const getDiskpathByHash = async (hash: string) => {
  if (!globalHashmaps.loaded) {
    await loadGlobalHashmap()
  }
  const index = globalHashmaps.byHash.get(hash)
  if (index === undefined) {
    return null
  }
  return globalHashmaps.entries[index]!.diskpath
}

export const getDiskpathByIdpath = async (idpath: string[]) => {
  if (!globalHashmaps.loaded) {
    await loadGlobalHashmap()
  }
  const idjpath = idpath.join("/")
  const index = globalHashmaps.byIdjpath.get(idjpath)
  if (index === undefined) {
    return null
  }
  const entry = globalHashmaps.entries[index]
  if (entry === null || entry === undefined) {
    return null
  }
  return entry.diskpath
}

export const getHashFromIdjpath = async (idjpath: string) => {
  if (!globalHashmaps.loaded) {
    await loadGlobalHashmap()
  }
  const index = globalHashmaps.byIdjpath.get(idjpath)
  if (!index) {
    throw new Error(`Hashmaps do not contain idjpath ${idjpath}`)
  }
  return globalHashmaps.entries[index]?.hash
}

export const readGlobalHashmap = async (): Promise<boolean> => {
  const diskpath = join(process.cwd(), HASH_MAP_FILE)
  const buffer = await readFile(diskpath)
  const entries = JSON.parse(buffer.toString())

  for (const { hash, idpath, diskpath, level } of entries) {
    hashmapAdd(hash, idpath, diskpath, level)
  }
  globalHashmaps.loaded = true
  return true
}

export const writeGlobalHashmap = async (entries: (HashmapEntry | null)[]) => {
  const diskpath = join(process.cwd(), HASH_MAP_FILE)
  await writeFile(diskpath, JSON.stringify(removeNullElements(entries), null, 2))
}

export const hashAllContent = async function (rootIdpath: string[]) {
  const hashes: Map<string, HashmapEntry> = new Map()

  await filesWalkContentPieces<HashItem & { level: number }>(
    rootIdpath,
    async ({ piece, diskpath, children }) => {
      const filename = basename(diskpath)
      const hash = await hashPiece(piece, children)
      const idjpath = piece.idpath.join("/")

      // Compute level here
      const childrenLevels = children.map(({ level }) => level)
      const level = 1 + Math.max(...childrenLevels)

      hashes.set(idjpath, { hash, idpath: piece.idpath, diskpath, level })

      return { hash, filename, level }
    }
  )

  return hashes
}

export const getChangedPieces = async (rootIdpath: string[]): Promise<HashmapChange[]> => {
  const changes: HashmapChange[] = []

  await filesWalkContentPieces<HashItem>(rootIdpath, async ({ piece, diskpath, children }) => {
    const oldHash = await readStoredHash(diskpath)
    const newHash = await hashPiece(piece, children)
    if (oldHash === null || oldHash !== newHash) {
      changes.push({
        oldHash,
        newHash: newHash,
        idpath: piece.idpath,
        diskpath: diskpath,
        children: children.map(({ hash }) => hash),
      })
    }
    return newHash
  })

  return changes
}

const findHashIndex = (hash: string | null) => {
  let pos: number = globalHashmaps.entries.length
  if (hash) {
    const index = globalHashmaps.byHash.get(hash)
    if (index !== undefined) {
      pos = index
    }
  }
  return pos
}

export const updateHashmapFile = async (changes: HashmapChange[]) => {
  await readGlobalHashmap()
  for (const { oldHash, newHash, diskpath, idpath } of changes) {
    hashmapUpdate(oldHash, newHash, idpath, diskpath)
  }
  await writeGlobalHashmap(removeNullElements(globalHashmaps.entries))
}

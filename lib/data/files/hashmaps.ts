import { env } from "@/lib/env.mjs"
import { readFile, writeFile } from "fs/promises"
import { basename, join } from "path"
import { HashItem, hashPiece } from "../hashing"
import { HASH_MAP_FILE, readStoredHash } from "./hashes"
import { filesWalkContentPieces } from "./utils"

export type HashmapEntry = {
  hash: string
  idpath: string[]
  diskpath: string
  level: number
}

type GlobalHashmaps = {
  loaded: boolean,
  changes: boolean,
  entries: HashmapEntry[]
  deleted: boolean[]
  byHash: Map<string, number>
  byIdjpath: Map<string, number>
}

const globalHashmaps: GlobalHashmaps = {
  loaded: false,
  changes: false,
  entries: [],
  deleted: [],
  byHash: new Map<string, number>(),
  byIdjpath: new Map<string, number>(),
}

export const hashmapAdd = (entry: HashmapEntry) => {
  const newIndex = globalHashmaps.entries.length
  globalHashmaps.entries.push(entry)
  globalHashmaps.deleted.push(false)
  globalHashmaps.byHash.set(entry.hash, newIndex)
  globalHashmaps.byIdjpath.set(entry.idpath.join("/"), newIndex)
  globalHashmaps.changes = true
}

export const hashmapRemove = (hash: string | null) => {
  if (hash === null) {
    return
  }
  const index = globalHashmaps.byHash.get(hash)
  if (index === undefined) {
    return
  }
  const entry = globalHashmaps.entries[index]
  if (entry === undefined) {
    return
  }
  globalHashmaps.deleted[index] = true
  globalHashmaps.byHash.delete(hash)
  globalHashmaps.byIdjpath.delete(entry.idpath.join("/"))
  globalHashmaps.changes = true
}

export const readGlobalHashmap = async (): Promise<boolean> => {
  const diskpath = join(process.cwd(), HASH_MAP_FILE)
  const buffer = await readFile(diskpath)
  const lines = buffer
    .toString()
    .split("\n")
    .filter((L) => L !== "")

  const entries = lines.map((line) => {
    const [hash, idjpath, diskpath, level] = line.split(";")
    return { hash, idpath: idjpath.split("/"), diskpath, level: Number(level) }
  })

  for (const entry of entries) {
    hashmapAdd(entry)
  }
  globalHashmaps.loaded = true
  globalHashmaps.changes = false
  return true
}

export const writeGlobalHashmap = async () => {
  if (!globalHashmaps.changes) {
    return
  }
  const diskpath = join(process.cwd(), HASH_MAP_FILE)
  const lines: string[] = []

  const { entries, deleted } = globalHashmaps
  for (let i = 0; i < globalHashmaps.entries.length; i++) {
    const { hash, idpath, diskpath, level } = entries[i]
    if (!deleted[i]) {
      lines.push(`${hash};${idpath.join("/")};${diskpath};${level}`)
    }
  }
  await writeFile(diskpath, lines.join(`\n`) + `\n`)
  // console.info(`Wrote hashmap (${entries.length} entries)`)
}

export const loadGlobalHashmap = async () => {
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
    // console.info(`Loaded hashmap (${globalHashmaps.entries.length} entries)`)
    return
  }

  type Item = HashItem & { level: number }

  // 2. Walk the files directly
  await filesWalkContentPieces<Item>(
    [env.COURSE_ID],
    async ({ piece, diskpath, children }): Promise<Item> => {
      const level = 1 + Math.max(-1, ...children.map(({ level }) => level))
      const { idpath } = piece

      // 2a. try getting it from file
      let hash = await readStoredHash(diskpath)
      if (hash === null) {
        // 2b. compute it
        hash = await hashPiece(piece, children)
      }

      if (hash === null) {
        throw new Error(`hash shoud not be null!`)
      }

      hashmapAdd({ hash, idpath, diskpath, level })

      return { hash, filename: basename(diskpath), level }
    }
  )

  globalHashmaps.loaded = true
  console.info(`Remade hashmap (${globalHashmaps.entries.length} entries)`)
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
  return globalHashmaps.entries[index].diskpath
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
  return globalHashmaps.entries[index].diskpath
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

export const forEachHashmapEntry = async (fn: (entry: HashmapEntry) => Promise<void>) => {
  await loadGlobalHashmap()
  for (const entry of globalHashmaps.entries) {
    if (entry !== null) {
      await fn(entry)
    }
  }
}

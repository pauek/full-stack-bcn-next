import { ContentPiece } from "../adt"
import { readStoredHash, writeStoredHash } from "./files/hashes"
import { hashPiece } from "./hashing"
import { removeNullElements } from "../utils"
import { readHashMapFile, writeHashMapFile } from "./hash-maps"
import backend from "."

export type Changes = {
  oldHash: string | null
  newHash: string
  diskpath: string
  idpath: string[]
  childrenHashes: string[]
}[]

export const getChangedPieces = async (course: ContentPiece): Promise<Changes> => {
  const changes: Changes = []

  await backend.walkContentPieces(course, async (piece, children) => {
    const oldHash = await readStoredHash(piece.diskpath)
    const newHash = await hashPiece(backend, piece, children)
    if (oldHash === null || oldHash !== newHash.hash) {
      changes.push({
        oldHash,
        newHash: newHash.hash,
        diskpath: piece.diskpath,
        idpath: piece.idpath,
        childrenHashes: children,
      })
    }
    return newHash
  })

  return changes
}

export const updateHashmapFile = async (changes: Changes) => {
  // Update hash map file
  const maps = await readHashMapFile()
  for (const change of changes) {
    let pos: number = maps.info.length
    if (change.oldHash) {
      const index = maps.byHash.get(change.oldHash)
      if (!index) {
        throw Error(`Old hash index not found?!?`)
      }
      pos = index
    }
    const idjpath = change.idpath.join("/")
    maps.info[pos] = {
      hash: change.newHash,
      diskpath: change.diskpath,
      idjpath,
    }
    maps.byHash.set(change.newHash, pos)
    maps.byPath.set(idjpath, pos)
  }

  // Save hash map file
  await writeHashMapFile(removeNullElements(maps.info))
  console.log("Updated hash map file")
}

const writePieceStoredHashes = async (changes: Changes) => {
  for (const { diskpath, newHash } of changes) {
    await writeStoredHash(diskpath, newHash)
  }
}

import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { env } from "@/lib/env.mjs"
import { Dirent } from "fs"
import { readdir } from "fs/promises"
import { basename, extname, join } from "path"
import { FileReference, FilesWalkFunc } from "../data-backend"
import { hashFile } from "../hashing"
import { getDiskpathByHash, getDiskpathByIdpath } from "./hash-maps"
import { readStoredHash } from "./hashes"
import { readMetadata } from "./metadata"
import { getPiece } from "./pieces"

export const readDirWithFileTypes = (path: string) => readdir(path, { withFileTypes: true })

export const dirNameToTitle = (dirName: string) => {
  const firstSpace = dirName.indexOf(" ")
  return firstSpace !== -1 ? dirName.slice(firstSpace + 1) : dirName
}

const rPieceDirectory = /^[0-9X]{2} .+$/

const imageExtensions = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".avif"]

const isMarkdown = (filename: string) => [".md", ".mdx"].includes(extname(filename))

export const isContentPiece = (ent: Dirent) => ent.isDirectory() && ent.name.match(rPieceDirectory)
export const isDoc = (ent: Dirent) =>
  ent.isFile() && ent.name.startsWith("doc.") && isMarkdown(ent.name)
export const isCover = (ent: Dirent) => ent.isFile() && ent.name.startsWith("cover.")
export const isSlide = (ent: Dirent) => ent.isFile() && extname(ent.name) === ".svg"
export const isImage = (ent: Dirent) => ent.isFile() && imageExtensions.includes(extname(ent.name))
export const isExercise = (ent: Dirent) => ent.isFile() && isMarkdown(ent.name)
export const isQuiz = (ent: Dirent) => ent.isFile() && isMarkdown(ent.name)

type FileTypeInfo = {
  subdir: string
  predicate: (ent: Dirent) => boolean
}

export const fileTypeInfo: Record<FileType, FileTypeInfo> = {
  doc: { predicate: isDoc, subdir: "" },
  cover: { predicate: isCover, subdir: "" },
  slide: { predicate: isSlide, subdir: "slides" },
  image: { predicate: isImage, subdir: "images" },
  exercise: { predicate: isExercise, subdir: "exercises" },
  quiz: { predicate: isQuiz, subdir: "quiz" },
  video: { predicate: () => false, subdir: "<none>" },
  other: { predicate: () => false, subdir: "" },
}

export const determineFiletype = (ent: Dirent): FileType => {
  if (isImage(ent)) {
    return FileType.image
  } else if (isSlide(ent)) {
    return FileType.slide
  } else if (isDoc(ent)) {
    return FileType.doc
  } else if (isCover(ent)) {
    return FileType.cover
  } else {
    return FileType.other
  }
}

export type FilePred = (ent: Dirent) => boolean

export const findFilename = async (diskpath: string, func: FilePred) => {
  for (const ent of await readDirWithFileTypes(diskpath)) {
    if (ent.isFile() && func(ent)) {
      return ent.name
    }
  }
  return null
}

export const findDocFilename = async (diskpath: string) =>
  findFilename(diskpath, (ent) => ent.name.startsWith("doc."))

export const findCoverImageFilename = async (piece: ContentPiece) => {
  const diskpath = await getDiskpathForPiece(piece)
  const filename = await findFilename(diskpath, (ent) => ent.name.startsWith("cover."))
  return filename ? join(diskpath, filename) : null
}

export const listPieceSubdir = async (
  diskpath: string,
  filetype: FileType
): Promise<Array<FileReference>> => {
  try {
    const typeInfo = fileTypeInfo[filetype]
    const abspath = join(diskpath, typeInfo.subdir)
    const files: FileReference[] = []
    for (const ent of await readDirWithFileTypes(abspath)) {
      if (typeInfo.predicate(ent)) {
        const filename = ent.name
        const hash = await hashFile(join(abspath, filename))
        files.push({ filename, hash, filetype })
      }
    }
    files.sort((a, b) => a.filename.localeCompare(b.filename))
    return files
  } catch (e) {
    return []
  }
}

// HACK: Let's make sure we don't skip hashing except in 'bun files:hashes'!
export let _okToSkipMissingHashes = false
export const okToSkipMissingHashes = async (func: (...args: any[]) => Promise<any>) => {
  _okToSkipMissingHashes = true
  await func()
  _okToSkipMissingHashes = false
}

export const readPieceAtDiskpath = async (
  diskpath: string,
  parentIdpath: string[]
): Promise<ContentPiece> => {
  const dirname = basename(diskpath)
  const name = dirNameToTitle(dirname)
  const metadata = await readMetadata(diskpath)

  let hash: string = "<unknown>"
  const readHash = await readStoredHash(diskpath)
  if (readHash !== null) {
    hash = readHash
  }

  const { id } = metadata
  if (!id) {
    throw Error(`Missing id from ContentPiece at ${diskpath}!`)
  }
  const idpath = [...parentIdpath, id]
  return { id, idpath, hash, name, metadata }
}

type PieceAndPath = {
  piece: ContentPiece
  diskpath: string
}

export const getPieceChildren = async (
  parent: ContentPiece,
  diskpath: string
): Promise<PieceAndPath[]> => {
  const children: PieceAndPath[] = []
  const idToPath: Map<string, string> = new Map() // Check that no IDs in children are repeated

  for (const ent of await readDirWithFileTypes(diskpath)) {
    if (isContentPiece(ent)) {
      const childDiskpath = join(diskpath, ent.name)
      const child = await readPieceAtDiskpath(childDiskpath, parent.idpath)
      child.idpath = [...parent.idpath, child.id]

      const existingPath = idToPath.get(child.id)
      if (existingPath) {
        throw new Error(
          `INCONSISTENCY ERROR: children of ${parent.idpath.join("/")}` +
            ` the same ID: "${child.id}"!\n` +
            `["${existingPath}" <=> "${childDiskpath}"]\n`
        )
      }

      idToPath.set(child.id, childDiskpath)
      if (!child.metadata.hidden) {
        children.push({ piece: child, diskpath: childDiskpath })
      }
    }
  }

  // IMPORTANT: Sort children by their filenames
  children.sort((a, b) => {
    const fa = basename(a.diskpath)
    const fb = basename(b.diskpath)
    return fa.localeCompare(fb)
  })

  return children
}

export const getDiskpathForPiece = async (piece: ContentPiece): Promise<string> => {
  const d1 = await getDiskpathByHash(piece.hash)
  if (d1) {
    return d1
  }
  const d2 = await getDiskpathByIdpath(piece.idpath)
  if (d2) {
    return d2
  }
  throw new Error(`Could not find diskpath for "${piece.name}" ${piece.idpath.join("/")}`)
}

export const findoutDiskpathFromIdpath = async (idpath: string[]): Promise<string | null> => {
  const findSubdirWithID = async (diskpath: string, id: string) => {
    for (const ent of await readDirWithFileTypes(diskpath)) {
      if (isContentPiece(ent)) {
        const subdir = join(currDiskpath, ent.name)
        const metadata = await readMetadata(subdir)
        if (metadata.id === id) {
          return subdir
        }
      }
    }
    return null
  }

  // Iterate over subdirectories
  let currDiskpath: string = env.CONTENT_ROOT
  for (const id of idpath) {
    const subdir = await findSubdirWithID(currDiskpath, id)
    if (subdir === null) {
      return null
    }
    currDiskpath = subdir
  }

  return currDiskpath
}

export const getPieceAndPathWithChildren = async (
  idpath: string[]
): Promise<PieceAndPath | null> => {
  let diskpath = await findoutDiskpathFromIdpath(idpath)
  if (diskpath === null) {
    return null
  }
  let piece = await readPieceAtDiskpath(diskpath, idpath)
  const children_diskpath = await getPieceChildren(piece, diskpath)
  piece.children = children_diskpath.map(({ piece }) => piece)
  return { piece, diskpath }
}

const walkFiles = async function <T>(
  index: number,
  idpath: string[],
  diskpath: string,
  func: FilesWalkFunc<T>
) {
  const parentIdpath = idpath.slice(0, -1)
  const piece = await readPieceAtDiskpath(diskpath, parentIdpath)
  const children_diskpath = await getPieceChildren(piece, diskpath)

  const children: any[] = []
  for (let i = 0; i < children_diskpath.length; i++) {
    const { piece, diskpath } = children_diskpath[i]
    const childIndex = i + 1
    children.push(await walkFiles(childIndex, piece.idpath, diskpath, func))
  }
  return await func({ index, piece, diskpath, children })
}

export const filesWalkContentPieces = async function <T>(idpath: string[], func: FilesWalkFunc<T>) {
  const diskpath = await findoutDiskpathFromIdpath(idpath)
  if (diskpath === null) {
    throw Error(`Diskpath not found for ${idpath.join("/")}`)
  }
  return walkFiles(1, idpath, diskpath, func)
}

export const filesGetRoot = async (): Promise<ContentPiece> => {
  const rootId = env.COURSE_ID
  const course = await getPiece([rootId])
  if (!course) {
    throw `Course "${rootId}" not found!`
  }
  return course
}

export const filesGetRootIdpath = (): string[] => {
  return [env.COURSE_ID]
}

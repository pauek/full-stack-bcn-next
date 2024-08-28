import { FileType } from "@/data/schema"
import { ContentPiece, hash, UNKNOWN } from "@/lib/adt"
import { CONTENT_ROOT, env } from "@/lib/env.mjs"
import { getMetadataFromMarkdownPreamble, splitMarkdownPreamble } from "@/lib/utils"
import { Dirent } from "fs"
import { readdir } from "fs/promises"
import { basename, extname, join } from "path"
import { FileReference } from "../data-backend"
import { hashFile } from "../hashing"
import { readStoredHash } from "./hashes"
import { getDiskpathByHash, getDiskpathByIdpath } from "./hashmaps"
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
  typeMatch: (ent: Dirent) => boolean
}

export const fileTypeInfo: Record<FileType, FileTypeInfo> = {
  doc: { typeMatch: isDoc, subdir: "." },
  cover: { typeMatch: isCover, subdir: "." },
  slide: { typeMatch: isSlide, subdir: "slides" },
  image: { typeMatch: isImage, subdir: "images" },
  exercise: { typeMatch: isExercise, subdir: "exercises" },
  quiz: { typeMatch: isQuiz, subdir: "quiz" },
  video: { typeMatch: () => false, subdir: "<none>" },
  other: { typeMatch: () => false, subdir: "" },
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

export const readAttachmentMetadata = async (
  idpath: string[],
  filename: string,
  bytes: Buffer,
): Promise<Record<string, any> | null> => {
  try {
    const { preamble } = splitMarkdownPreamble(bytes.toString())
    if (preamble.length > 0) {
      return getMetadataFromMarkdownPreamble(preamble)
    } else {
      // FIXME(pauek): Unimplemented
      return null
    }
  } catch (e) {
    console.warn(`Error reading metadata from attachment ${idpath.join("/")} (${filename}): ${e}`)
    return null
  }
}

export const listPieceSubdir = async (
  diskpath: string,
  filetype: FileType,
): Promise<FileReference[]> => {
  try {
    const typeInfo = fileTypeInfo[filetype]
    const abspath = join(diskpath, typeInfo.subdir)
    const files: FileReference[] = []
    for (const ent of await readDirWithFileTypes(abspath)) {
      if (typeInfo.typeMatch(ent)) {
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

/**
 * Read a piece from disk including: name, metadata (id), hash and idpath.
 * Does _not_ read children.
 *
 * @param diskpath The directory where to read the piece from.
 * @param parentIdpath The path of the parent, to construct the complete idpath.
 * @returns a `ContentPiece` object.
 */
export const readPieceAtDiskpath = async (
  diskpath: string,
  parentIdpath: string[],
): Promise<ContentPiece> => {
  const metadata = await readMetadata(diskpath)
  return {
    id: metadata.id,
    idpath: [...parentIdpath, metadata.id],
    name: dirNameToTitle(basename(diskpath)),
    hash: (await readStoredHash(diskpath)) ?? "<missing>",
    metadata: {
      ...metadata,
      index: UNKNOWN,
      level: UNKNOWN,
      diskpath,
    },
  }
}

type PieceAndPath = {
  piece: ContentPiece
  diskpath: string
}

export const filesReadChildren = async (
  parent: ContentPiece,
  diskpath: string,
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
            `["${existingPath}" <=> "${childDiskpath}"]\n`,
        )
      }

      idToPath.set(child.id, childDiskpath)
      children.push({ piece: child, diskpath: childDiskpath })
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

type IdAndPath = {
  id: string
  diskpath: string
}
export const filesFindChildrenDiskpaths = async (
  diskpath: string,
  parentIdpath: string[],
): Promise<IdAndPath[]> => {
  const children: IdAndPath[] = []
  const childIdToDiskpath: Map<string, string> = new Map() // Check that no IDs in children are repeated

  for (const ent of await readDirWithFileTypes(diskpath)) {
    if (isContentPiece(ent)) {
      const childDiskpath = join(diskpath, ent.name)
      const { id: childId } = await readMetadata(childDiskpath)

      // Check duplicated IDs and show where they occur
      const existingPath = childIdToDiskpath.get(childId)
      if (existingPath) {
        throw new Error(
          `INCONSISTENCY ERROR: children of ${parentIdpath.join("/")}` +
            ` the same ID: "${childId}"!\n` +
            `["${existingPath}" <=> "${childDiskpath}"]\n`,
        )
      }

      childIdToDiskpath.set(childId, childDiskpath)
      children.push({ id: childId, diskpath: childDiskpath })
    }
  }

  // IMPORTANT: Sort children by their filenames
  children.sort((a, b) => basename(a.diskpath).localeCompare(basename(b.diskpath)))

  return children
}

export const getDiskpathForPiece = async (piece: ContentPiece): Promise<string> => {
  const d1 = await getDiskpathByHash(hash(piece))
  if (d1) return d1

  const d2 = await getDiskpathByIdpath(piece.idpath)
  if (d2) return d2

  const d3 = await findDiskpathFromIdpath(piece.idpath)
  if (d3) return d3

  throw new Error(`Could not find diskpath for "${piece.name}" ${piece.idpath.join("/")}????`)
}

export const findDiskpathFromIdpath = async (idpath: string[]): Promise<string | null> => {
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
  let currDiskpath: string = CONTENT_ROOT
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
  idpath: string[],
): Promise<PieceAndPath | null> => {
  let diskpath = await findDiskpathFromIdpath(idpath)
  if (diskpath === null) {
    return null
  }
  let parentIdPath = idpath.slice(0, -1)
  let piece = await readPieceAtDiskpath(diskpath, parentIdPath)
  const children_diskpath = await filesReadChildren(piece, diskpath)
  piece.children = children_diskpath.map(({ piece }) => piece)
  return { piece, diskpath }
}

/**
 * Type of callback for the `filesWalkContentPieces` function.
 */
export type FilesWalkFunc = (diskpath: string, piece: ContentPiece) => Promise<ContentPiece>

/**
 * Walk the file tree recursively for each piece, starting at a certain idpath.
 * At each piece, the function `func` is called with the `diskpath` and the `piece`,
 * and the given `piece` contains both the `index` and the `children` fields filled in,
 * which means that children are walked first.
 *
 * @param idpath
 * @param func
 * @returns
 */
export const filesWalkContentPieces = async (idpath: string[], func: FilesWalkFunc) => {
  const diskpath = await findDiskpathFromIdpath(idpath)
  if (diskpath === null) {
    throw Error(`Diskpath not found for ${idpath.join("/")}`)
  }

  const _walkFiles = async (index: number, idpath: string[], diskpath: string) => {
    const parentIdpath = idpath.slice(0, -1)
    const piece = await readPieceAtDiskpath(diskpath, parentIdpath)
    piece.metadata.index = index

    const childrenDiskpaths = await filesFindChildrenDiskpaths(diskpath, idpath)
    const children: ContentPiece[] = []
    for (let i = 0; i < childrenDiskpaths.length; i++) {
      const { id, diskpath } = childrenDiskpaths[i]
      children.push(await _walkFiles(i + 1, [...idpath, id], diskpath))
    }
    piece.children = children

    return await func(diskpath, piece)
  }

  return _walkFiles(1, idpath, diskpath)
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

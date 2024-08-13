import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { readFile } from "fs/promises"
import { basename, join, join as pathJoin } from "path"
import { FileBuffer, FileReference, WalkFunc } from "../data-backend"
import * as utils from "./utils"
import { env } from "@/lib/env.mjs"
import { Hash } from "../hashing"
import { readAnswers } from "./answers"

export { findCoverImageFilename } from "./utils"

export const pieceHasCover = async (piece: ContentPiece) =>
  (await utils.findCoverImageFilename(piece)) !== null

export const pieceHasDoc = async (piece: ContentPiece) =>
  (await utils.findDocFilename(piece.diskpath)) !== null

const __getPieceChildren = async (parent: ContentPiece, idpath: string[]) => {
  const children = []
  for (const ent of await utils.readDirWithFileTypes(parent.diskpath)) {
    if (utils.isContentPiece(ent)) {
      const childPath = join(parent.diskpath, ent.name)
      const child = await utils.readPieceAtSubdir(childPath, parent.idpath)
      child.idpath = [...idpath, child.id]
      if (!child.metadata.hidden) {
        children.push(child)
      }
    }
  }
  children.sort((a, b) => a.diskpath.localeCompare(b.diskpath))
  return children
}

export const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const [id, ...rest] = idpath
  let piece = await utils.readPieceAtSubdir(env.COURSE_SUBDIR, [])
  // Confirm that the root course has the same ID
  if (id != piece.id) {
    throw Error(`The 'id' of the course doesn't match ("${id}" vs "${piece.id})"`)
  }
  if (!rest || rest.length === 0) {
    return piece
  }
  let currpath = [id]
  for (const rid of rest) {
    let children = await __getPieceChildren(piece, idpath)
    let child = children.find((ch) => ch.id === rid)
    if (!child) {
      return null
    }
    piece = child
    currpath.push(rid)
  }
  piece.idpath = idpath
  return piece
}

export const getPieceWithChildren = async (idpath: string[]): Promise<ContentPiece | null> => {
  let piece = await getPiece(idpath)
  if (!piece) {
    return null
  }
  piece.children = await __getPieceChildren(piece, idpath)
  return piece
}

export const getContentTree = async (idpath: string[], { level = 2 }: { level: number }) => {
  const _getContentTree = async (idpath: string[], level: number) => {
    if (level === 0) {
      return await getPiece(idpath)
    }
    let root = await getPieceWithChildren(idpath)
    if (!root) {
      return null
    }
    if (root.children) {
      for (let i = 0; i < root.children.length; i++) {
        const childId = root.children[i].id
        const child = await _getContentTree([...idpath, childId], level - 1)
        root.children[i] = child!
      }
    }
    return root
  }

  return await _getContentTree(idpath, level)
}

export const getSessionSequence = async (courseId: string): Promise<ContentPiece[]> => {
  const course = await getContentTree([courseId], { level: 2 })
  const sessionSequence = []
  let k = 0
  for (const part of course?.children || []) {
    for (const session of part.children || []) {
      sessionSequence.push(session)
    }
  }
  return sessionSequence
}

export const pieceNumSlides = async (piece: ContentPiece) => {
  return (await getPieceSlideList(piece)).length
}

export const getPieceDocument = async (piece: ContentPiece): Promise<FileBuffer | null> => {
  try {
    let doc = await utils.findDocFilename(piece.diskpath)
    if (!doc) {
      return null
    }
    return { name: doc, buffer: await readFile(pathJoin(piece.diskpath, doc)) }
  } catch (e) {
    return null
  }
}

export const getAttachmentBytes = async (piece: ContentPiece, fileref: FileReference) => {
  try {
    let typeInfo = utils.fileTypeInfo[fileref.filetype]
    const filepath = pathJoin(piece.diskpath, typeInfo.subdir, fileref.filename)
    return await readFile(filepath)
  } catch (e) {
    return null
  }
}

export const getPieceSlideList = async (piece: ContentPiece) =>
  utils.listPieceSubdir(piece.diskpath, FileType.slide)

export const getPieceImageList = async (piece: ContentPiece) =>
  utils.listPieceSubdir(piece.diskpath, FileType.image)

export const getPieceAttachmentList = async (piece: ContentPiece, filetype: FileType) =>
  utils.listPieceSubdir(piece.diskpath, filetype)

export const getPieceCoverImageData = async (piece: ContentPiece): Promise<FileBuffer | null> => {
  const coverFilename = await utils.findCoverImageFilename(piece)
  if (!coverFilename) {
    return null
  }
  const buffer = await readFile(coverFilename)
  return { buffer, name: basename(coverFilename) }
}

export const getPieceFileData = async (
  piece: ContentPiece,
  filename: string,
  filetype: FileType,
): Promise<Buffer | null> => {
  const fileTypeInfo = utils.fileTypeInfo[filetype]
  const fulldiskpath = join(piece.diskpath, fileTypeInfo.subdir, filename)
  try {
    return await readFile(fulldiskpath)
  } catch (e) {
    console.error(`Error reading ${fulldiskpath}: ${e}`)
    return null
  }
}

const __walkFiles = async function (idpath: string[], func: WalkFunc) {
  const piece = await getPieceWithChildren(idpath)
  if (!piece) {
    throw `__walkFiles: not found: "${idpath.join("/")}"`
  }
  const children: any[] = []
  for (const child of piece.children || []) {
    children.push(await __walkFiles(child.idpath, func))
  }
  return await func(piece, children)
}

export const getAllIdpaths = async (rootIdpath: string[]): Promise<string[][]> => {
  const result: string[][] = []
  await __walkFiles(rootIdpath, async (piece) => {
    result.push(piece.idpath)
  })
  return result
}

export const getAllAttachmentPaths = async (
  rootIdpath: string[],
  filetype: FileType,
): Promise<string[][]> => {
  const result: string[][] = []
  await __walkFiles(rootIdpath, async (piece) => {
    const attachments = await getPieceAttachmentList(piece, filetype)
    for (const file of attachments) {
      result.push([...piece.idpath, file.filename])
    }
  })
  return result
}

export const getQuizAnswerForHash = async (hash: Hash): Promise<string[]> => {
  const answers = await readAnswers()
  return answers.get(hash) || []
}

import { AllAttachmentTypes, FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { readFile } from "fs/promises"
import { basename, join, join as pathJoin } from "path"
import { FileBuffer, FileReference } from "../data-backend"
import * as utils from "./utils"
import { getDiskpathByIdpath } from "./hashmaps"
import { splitMarkdownPreamble } from "@/lib/utils"
import { writeFile } from "fs/promises"

export const pieceNumSlides = async (piece: ContentPiece) => {
  return (await getPieceSlideList(piece)).length
}

export const getPieceDocument = async (piece: ContentPiece): Promise<FileBuffer | null> => {
  try {
    const diskpath = await utils.getDiskpathForPiece(piece)
    let doc = await utils.findDocFilename(diskpath)
    if (!doc) {
      return null
    }
    return {
      name: doc,
      buffer: await readFile(pathJoin(diskpath, doc)),
    }
  } catch (e) {
    return null
  }
}

export const getAttachmentContent = async (piece: ContentPiece, fileref: FileReference) => {
  try {
    const diskpath = await utils.getDiskpathForPiece(piece)
    let typeInfo = utils.fileTypeInfo[fileref.filetype]
    const filepath = pathJoin(diskpath, typeInfo.subdir, fileref.filename)
    const bytes = await readFile(filepath)
    const metadata = await utils.readAttachmentMetadata(piece.idpath, fileref.filename, bytes)
    return { bytes, metadata }
  } catch (e) {
    console.error(`Error reading attachment! ${e}`)
    return null
  }
}

export const updateMarkdownMetadata = async (
  idpath: string[],
  filetype: FileType,
  filename: string,
  metadata: Record<string, any>
) => {
  const diskpath = await getDiskpathByIdpath(idpath)
  if (diskpath === null) {
    console.error(`Error updating exercise metadata: diskpath not found for ${idpath.join("/")}`)
    return
  }
  const filepath = pathJoin(diskpath, utils.fileTypeInfo[filetype].subdir, filename)
  const bytes = await readFile(filepath)
  const { body } = await splitMarkdownPreamble(bytes.toString())
  const newPreamble = JSON.stringify(metadata, null, 2)
  await writeFile(filepath, `---\n${newPreamble}\n---\n${body}`)
}

export const getPieceSlideList = async (piece: ContentPiece) =>
  utils.listPieceSubdir(await utils.getDiskpathForPiece(piece), FileType.slide)

export const getPieceImageList = async (piece: ContentPiece) =>
  utils.listPieceSubdir(await utils.getDiskpathForPiece(piece), FileType.image)

export const getPieceAttachmentList = async (piece: ContentPiece, filetype: FileType) =>
  utils.listPieceSubdir(await utils.getDiskpathForPiece(piece), filetype)

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
  filetype: FileType
): Promise<Buffer | null> => {
  const diskpath = await utils.getDiskpathForPiece(piece)
  const fileTypeInfo = utils.fileTypeInfo[filetype]
  const fulldiskpath = join(diskpath, fileTypeInfo.subdir, filename)
  try {
    return await readFile(fulldiskpath)
  } catch (e) {
    console.error(`Error reading ${fulldiskpath}: ${e}`)
    return null
  }
}

export const getAllPieceAttachments = async (piece: ContentPiece) => {
  let result: FileReference[] = []
  for (const type of AllAttachmentTypes) {
    const attachments = await getPieceAttachmentList(piece, type)
    result = result.concat(attachments)
  }
  return result
}

// NOTE(pauek): Maybe optimize this, idk
export const getPieceAttachmentTypes = async (piece: ContentPiece): Promise<Set<FileType>> => {
  const attachments = await getAllPieceAttachments(piece)
  return new Set(attachments.map((a) => a.filetype))
}

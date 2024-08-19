import "@/lib/env.mjs"

import { AllAttachmentTypes, FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { insertFile } from "@/lib/data/db/insert"
import { getPieceAttachmentList } from "@/lib/data/files/attachments"
import { writeStoredHash } from "@/lib/data/files/hashes"
import { hashAllContent, HashmapEntry, writeGlobalHashmap } from "@/lib/data/files/hashmaps"
import {
  filesGetRootIdpath,
  fileTypeInfo,
  findCoverImageFilename,
  findDocFilename,
  getDiskpathForPiece,
} from "@/lib/data/files/utils"
import { basename, join } from "path"
import { withImageUploader } from "./image-uploader"

type FileInsertion = {
  filename: string
  filetype: FileType
  diskpath: string
}

export const insertFiles = async (piece: ContentPiece) => {
  const diskpath = await getDiskpathForPiece(piece)

  const fullpath =
    (dir: string, filetype: FileType) =>
    ({ filename }: { filename: string }): FileInsertion => ({
      filename,
      filetype,
      diskpath: join(diskpath, dir, filename),
    })

  let allFiles: FileInsertion[] = []
  for (const filetype of AllAttachmentTypes) {
    allFiles = allFiles.concat(
      (await getPieceAttachmentList(piece, filetype)).map(
        fullpath(fileTypeInfo[filetype].subdir, filetype),
      ),
    )
  }
  const doc = await findDocFilename(diskpath)
  if (doc) {
    allFiles.push({
      filename: doc,
      filetype: FileType.doc,
      diskpath: join(diskpath, doc),
    })
  }
  const cover = await findCoverImageFilename(piece)
  if (cover) {
    allFiles.push({
      filename: basename(cover),
      filetype: FileType.cover,
      diskpath: cover,
    })
  }

  for (const file of allFiles) {
    try {
      await insertFile(piece, file)
    } catch (e: any) {
      console.error(`Cannot insert ${file.filename}: ${e.toString()}`)
      console.error(e.stack)
    }
  }

  return allFiles
}

export const rewriteAllHashes = async (options?: { log?: boolean }) => {
  const rootIdpath = await filesGetRootIdpath()
  const allHashes = await hashAllContent(rootIdpath)

  const entries: HashmapEntry[] = []
  for (const [idjpath, { hash, diskpath, level }] of allHashes) {
    await writeStoredHash(diskpath, hash)
    entries.push({
      hash,
      idpath: idjpath.split("/"),
      diskpath,
      level,
    })
    if (options && options.log) {
      console.log(hash, idjpath)
    }
  }
  await writeGlobalHashmap()
}

export const uploadImages = async (piece: ContentPiece) => {
  await withImageUploader({ parallelRequests: 20 }, async (uploader) => {
    const types: FileType[] = [FileType.image, FileType.slide, FileType.cover]
    for (const ty of types) {
      await uploader.uploadAllFilesOfType(piece.idpath, ty as FileType)
    }
  })
}

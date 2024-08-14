import "@/lib/env.mjs"

import { AllAttachmentTypes, FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { WalkFunc } from "@/lib/data/data-backend"
import { dbBackend } from "@/lib/data"
import {
  insertFile,
  insertPiece,
  insertPieceHashmap,
  insertQuizAnswers,
  pieceSetParent,
} from "@/lib/data/db/insert"
import * as files from "@/lib/data/files"
import { filesBackend } from "@/lib/data"
import { collectAnswersForPiece } from "@/lib/data/files/answers"
import { HashMapInfo, writeHashMapFile } from "@/lib/data/hash-maps"
import { hashAllContent } from "@/lib/data/hashing"
import { withImageUploader } from "./image-uploader"
import { getRoot } from "@/lib/data/root"
import { basename, join } from "path"
import { Changes } from "@/lib/data/changes"
import { fileTypeInfo, findCoverImageFilename, findDocFilename } from "@/lib/data/files/utils"
import { getPieceAttachmentList } from "@/lib/data/files/backend"
import { writeStoredHash } from "@/lib/data/files/hashes"

export const getSelectedRoot = async (idjpath: string | undefined) => {
  // Get root (user can select one)
  let root: ContentPiece | null = null
  if (idjpath) {
    root = await filesBackend.getPiece(idjpath.split("/"))
    if (!root) {
      console.error(`Piece "${idjpath}" not found.`)
      process.exit(1)
    }
  } else {
    root = await getRoot(filesBackend)
  }
  return root
}

const revalidate = async (idjpath: string) => {
  const res = await fetch(`http://full-stack-bcn.dev/api/revalidate/${idjpath}`)
  if (!res.ok) {
    console.error(`Failed to revalidate ${idjpath}`)
  }
}

export const walkFilesIfChanged = async function (
  forcedUpload: boolean,
  idpath: string[],
  func: WalkFunc
) {
  const piece = await filesBackend.getPieceWithChildren(idpath)
  if (!piece) {
    console.error(`[ERROR] Piece not found: ${idpath.join("/")}`)
    return
  }
  const children: any[] = []
  for (const child of piece.children || []) {
    const dbChild = await dbBackend.getPiece(child.idpath)
    if (dbChild === null || dbChild.hash !== child.hash || forcedUpload) {
      await walkFilesIfChanged(forcedUpload, child.idpath, func)
    }
    children.push(child)
  }
  await func(piece, children)
}

type FileInsertion = {
  filename: string
  filetype: FileType
  diskpath: string
}

export const insertFiles = async (piece: ContentPiece) => {
  const fullpath =
    (dir: string, filetype: FileType) =>
    ({ filename }: { filename: string }): FileInsertion => ({
      filename,
      filetype,
      diskpath: join(piece.diskpath, dir, filename),
    })

  let allFiles: FileInsertion[] = []
  for (const filetype of AllAttachmentTypes) {
    allFiles = allFiles.concat(
      (await getPieceAttachmentList(piece, filetype)).map(
        fullpath(fileTypeInfo[filetype].subdir, filetype)
      )
    )
  }
  const doc = await findDocFilename(piece.diskpath)
  if (doc) {
    allFiles.push({
      filename: doc,
      filetype: FileType.doc,
      diskpath: join(piece.diskpath, doc),
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

export const insertPieceWalker = async (piece: ContentPiece, children: any[]) => {
  console.log(piece.hash, piece.idpath.join("/"), " ".repeat(40))
  await insertPiece(piece)
  await insertPieceHashmap(piece)
  await insertFiles(piece)

  const answers = await collectAnswersForPiece(piece)
  await insertQuizAnswers(answers)

  for (const child of children) {
    await pieceSetParent(child.hash, piece.hash)
  }
}

export const writeHashes = async (options?: { log?: boolean }) => {
  const root = await getRoot(filesBackend)

  const allHashes = await hashAllContent(filesBackend, root)

  const entries: HashMapInfo[] = []
  for (const [idjpath, { hash, diskpath }] of allHashes) {
    await writeStoredHash(diskpath, hash)
    entries.push({ hash, idjpath, diskpath })
    if (options && options.log) {
      console.log(hash, idjpath)
    }
  }

  await writeHashMapFile(entries)
}

export const uploadImages = async () => {
  await withImageUploader({ parallelRequests: 20 }, async (uploader) => {
    const existing = new Set<string>()
    for (const { name } of await uploader.listAllFiles()) {
      if (name) existing.add(name)
    }
    const types: FileType[] = [FileType.image, FileType.slide, FileType.cover]
    for (const ty of types) {
      await uploader.uploadAllFilesOfType(ty as FileType, existing)
    }
  })
}

// Apply updates to the database
export const applyChangesToDatabase = async (changes: Changes) => {
  for (const change of changes) {
    const piece = await filesBackend.getPiece(change.idpath)
    if (!piece) {
      console.error(`Error: now I don't find a piece that was there??`)
      continue
    }
    await insertPiece(piece)
    await insertFiles(piece)
    for (const childHash of change.childrenHashes) {
      await pieceSetParent(childHash, piece.hash)
    }
  }
}

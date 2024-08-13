import "@/lib/env.mjs"

import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { WalkFunc } from "@/lib/data/data-backend"
import { dbBackend } from "@/lib/data/db"
import * as db from "@/lib/data/db/insert"
import { filesBackend, writeStoredHash } from "@/lib/data/files"
import { collectAnswersForPiece } from "@/lib/data/files/answers"
import { HashMapInfo, writeHashMapFile } from "@/lib/data/hash-maps"
import { hashAllContent } from "@/lib/data/hashing"
import { withImageUploader } from "@/lib/data/images"
import { getRoot } from "@/lib/data/root"

export const getSelectedRoot = async (idjpath: string) => {
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
  func: WalkFunc,
) {
  const filesPiece = await filesBackend.getPieceWithChildren(idpath)
  if (!filesPiece) {
    console.error(`[ERROR] Piece not found: ${idpath.join("/")}`)
    return
  }
  const filesChildren: any[] = []
  for (const filesChild of filesPiece.children || []) {
    const dbChild = await dbBackend.getPiece(filesChild.idpath)
    if (dbChild?.hash !== filesChild.hash || forcedUpload) {
      await walkFilesIfChanged(forcedUpload, filesChild.idpath, func)
    }
    filesChildren.push(filesChild)
  }
  await func(filesPiece, filesChildren)
}

export const insertPieceWalker = async (piece: ContentPiece, children: any[]) => {
  console.log(piece.hash, piece.idpath.join("/"), " ".repeat(40))
  await db.insertPiece(piece)
  await db.insertPieceHashmap(piece)
  await db.insertFiles(piece)

  // Revalidate all paths for piece
  for (const slug of ["doc", "quiz", "exc", "slides"]) {
    revalidate([...piece.idpath, slug].join("/"))
  }

  const answers = await collectAnswersForPiece(piece)
  await db.insertQuizAnswers(answers)

  for (const child of children) {
    await db.pieceSetParent(child.hash, piece.hash)
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

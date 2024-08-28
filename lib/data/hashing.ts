import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import crypto from "crypto"
import { readFile } from "fs/promises"
import { getPieceAttachmentList, getPieceDocument, getPieceFileData } from "./files/attachments"
import { METADATA_FILENAME } from "./files/metadata"
import { fileTypeInfo } from "./files/utils"
import { basename } from "path"

export type Hash = string

export interface AbstractContentPiece {
  files: string[]
  metadata: Record<string, string>
  children: AbstractContentPiece
}

export const hashAny = (x: any) => {
  const hasher = crypto.createHash("sha256")
  if (typeof x === "number") {
    hasher.update(`number(${x})`)
  } else if (typeof x === "string") {
    hasher.update(`string(${x})`)
  } else if (typeof x === "boolean") {
    hasher.update(`boolean(${x})`)
  } else if (Array.isArray(x)) {
    hasher.update(x.map((elem) => hashAny(elem)).join("\n"))
  } else if (x instanceof Buffer) {
    hasher.update(Buffer.from(x))
  } else if (typeof x === "object") {
    hasher.update(
      Object.entries(x)
        .map(([field, value]) => hashAny(`${field}=${value}\n`))
        .join(""),
    )
  } else {
    throw `hash: Unsupported type ${typeof x}: ${JSON.stringify(x)}`
  }
  return hasher.digest("hex")
}

export const hashFile = async (diskpath: string) => {
  return hashAny(await readFile(diskpath))
}

export const childrenHashes = async (piece: ContentPiece) => {
  const result: HashItem[] = []
  for (const child of piece.children || []) {
    const { diskpath } = child.metadata
    if (!diskpath) {
      throw new Error(`No diskpath for child ${child.idpath.join("/")}!`)
    }
    result.push({ id: child.id, hash: child.hash })
  }
  return result
}

export type HashItem = {
  id: string
  hash: string
}
export const hashPiece = async function (
  piece: ContentPiece,
  childrenHashes: HashItem[],
): Promise<Hash> {
  //
  childrenHashes.sort((a, b) => a.id.localeCompare(b.id))

  // WARNING: Choose *carefully* what metadata fields we want to put in the hash
  //
  // index: if we change the index, the hash should NOT change, because it only
  //    changes the position as a sibling the parent. The parent hash _will_ change,
  //    but the child's content is the same.
  //
  // hidden: That a piece is hidden also should NOT make the hash change.
  //
  const { id, hasDoc, numSlides, mapPosition } = piece.metadata
  const selectedMetadata = { id, hasDoc, numSlides, mapPosition }

  const hashes: HashItem[] = []
  const fields = Object.entries(selectedMetadata).sort(([a], [b]) => a.localeCompare(b))
  const strFields = JSON.stringify(fields)
  hashes.push({
    id: METADATA_FILENAME,
    hash: hashAny(strFields),
  })

  const doc = await getPieceDocument(piece)
  if (doc !== null) {
    const { name, buffer } = doc
    hashes.push({ id: name, hash: hashAny(buffer) })
  }

  const [cover] = await getPieceAttachmentList(piece, FileType.cover)
  if (cover) {
    const { filename, hash } = cover
    hashes.push({ id: filename, hash })
  }

  // All kinds of attachments
  for (const filetype of [FileType.image, FileType.slide, FileType.exercise, FileType.quiz]) {
    const info = fileTypeInfo[filetype]
    const attachmentList = await getPieceAttachmentList(piece, filetype)
    for (const { filename } of attachmentList) {
      const fileData = await getPieceFileData(piece, filename, filetype)
      hashes.push({
        id: `${info.subdir}/${filename}`,
        hash: hashAny(fileData),
      })
    }
  }

  hashes.sort((a, b) => {
    // first by name, then by hash
    const cmp1 = a.id.localeCompare(b.id)
    if (cmp1 != 0) return cmp1
    const cmp2 = a.hash.localeCompare(b.hash)
    return cmp2
  })

  const allHashes = [...childrenHashes, ...hashes]
  const allHashesAsText = allHashes.map(({ id: name, hash }) => `${hash} ${name}\n`).join("")

  return hashAny(allHashesAsText)
}

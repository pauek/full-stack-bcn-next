import { FileType } from "@/data/schema"
import { env } from "@/lib/env.mjs"
import { extname } from "path"
import { FileReference } from "./data/data-backend"

const DEFAULT_PREFIX = "c"

export const pieceUrlPath = (idpath: string[], prefix?: string) =>
  `/${prefix || DEFAULT_PREFIX}/${idpath.join("/")}`

const _filetypeToUrlSegment: Map<FileType, string> = new Map([
  [FileType.doc, ".doc"],
  [FileType.slide, ".slides"],
  [FileType.exercise, ".exercises"],
  [FileType.quiz, ".quiz"],
])

export const filetypeToUrlSegment = (filetype: FileType): string | null => {
  return _filetypeToUrlSegment.get(filetype) || null
}

export const attachmentPageUrl = (idpath: string[], filetype: FileType, prefix?: string) => {
  const segment = filetypeToUrlSegment(filetype)
  if (!segment) {
    throw new Error(`Attachment Type "${filetype}" does not have a segment1`)
  }
  return `/${prefix || DEFAULT_PREFIX}/${idpath.join("/")}/${segment}`
}

export const fileUrl = (fileref: FileReference) =>
  `${env.R2_PUBLIC_URL}/${fileref.hash}${extname(fileref.filename)}`

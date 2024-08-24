import { extname } from "path"
import { FileReference } from "./data/data-backend"
import { env } from "@/lib/env.mjs"

const DEFAULT_PREFIX = "c"

// export const pieceRef = (prefix: string, path: string) => `/${prefix}/${path}`

export const pieceUrlPath = (idpath: string[], prefix?: string) =>
  `/${prefix || DEFAULT_PREFIX}/${idpath.join("/")}`

export const attachmentUrl = (fileref: FileReference) =>
  `${env.R2_PUBLIC_URL}/${fileref.hash}${extname(fileref.filename)}`

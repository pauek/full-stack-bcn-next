import { z } from "zod"
import { IRectangle, zRectangle } from "./geometry"

export type ContentPiece = {
  id: string
  idpath: string[]
  hash: string
  name: string
  metadata: ContentPieceMetadata
  children?: ContentPiece[]
}

/**
 * This metadata is stored in the filesystem, so it is convenient to store it
 * as it exists in the JSON file.
 */
export type ContentPieceMetadata = {
  id: string
  index: number
  level: number
  hidden?: boolean
  diskpath?: string
  hasDoc?: boolean
  numSlides?: number
  mapPosition?: IRectangle
  row?: number
}

export const zContentPieceMetadata = z.object({
  id: z.string(),
  index: z.number(),
  level: z.number(),
  hidden: z.boolean().optional(),
  diskpath: z.string().optional(),
  hasDoc: z.boolean().optional(),
  numSlides: z.number().optional(),
  mapPosition: zRectangle.optional(),
  row: z.number().optional(),
})

export const UNKNOWN = -1

export const isPieceFile = (filename: string) => {
  return filename === "doc.mdx" || filename.startsWith("cover.")
}
export const isPieceSubdir = (dir: string) => dir === "images" || dir === "slides"

export const hash = (piece: ContentPiece): string => piece.hash
export const setHash = (piece: ContentPiece, hash: string) => (piece.hash = hash)

export const pieceLevelFromChildren = (piece: ContentPiece): number => {
  const { children } = piece
  let level = 1
  if (children && children.length > 0) {
    level = 1 + Math.max(...children.map((c) => c.metadata.level))
  }
  return level
}

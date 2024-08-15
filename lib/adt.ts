export type ContentPiece = {
  id: string
  idpath: string[]
  hash: string
  // TODO: add level!
  name: string
  metadata: Record<string, any>
  children?: ContentPiece[]
  diskpath?: string
}

export const isPieceFile = (filename: string) => {
  return filename === "doc.mdx" || filename.startsWith("cover.")
}
export const isPieceSubdir = (dir: string) => dir === "images" || dir === "slides"

import { FileType } from "@/data/schema"
import { getPieceAttachmentList } from "./attachments"
import { getAllIdjpaths } from "./hash-maps"
import { filesWalkContentPieces } from "./utils"

export const getAllIdpaths = async (rootIdpath: string[]): Promise<string[][]> => {
  const idjpaths = await getAllIdjpaths(rootIdpath.join("/"))
  return idjpaths.map((idjpath) => idjpath.split("/"))
}

export const getAllAttachmentPaths = async (
  rootIdpath: string[],
  filetype: FileType
): Promise<string[][]> => {
  const result: string[][] = []
  await filesWalkContentPieces(rootIdpath, async ({ piece }) => {
    const attachments = await getPieceAttachmentList(piece, filetype)
    for (const file of attachments) {
      result.push([...piece.idpath, file.filename])
    }
  })
  return result
}

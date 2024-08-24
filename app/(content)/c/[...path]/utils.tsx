import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import data from "@/lib/data"
import { FileReference } from "@/lib/data/data-backend"

type SplitIdPath = {
  idpath: string[]
  attachment: string | null
}
export const splitIdpath = (parts: string[]): SplitIdPath => {
  const last = parts[parts.length - 1]
  if (last.startsWith(".")) {
    return {
      idpath: parts.slice(0, -1),
      attachment: last,
    }
  } else {
    return {
      idpath: parts,
      attachment: null,
    }
  }
}

export type AttachmentInfo = {
  name: string
  attachments: FileReference[]
}

export const attachmentsMenuOptions = async (
  piece: ContentPiece
): Promise<Record<string, AttachmentInfo>> => {
  return {
    doc: { name: "Document", attachments: await data.getPieceAttachmentList(piece, FileType.doc) },
    slds: { name: "Slides", attachments: await data.getPieceAttachmentList(piece, FileType.slide) },
    exc: {
      name: "Exercises",
      attachments: await data.getPieceAttachmentList(piece, FileType.exercise),
    },
    quiz: { name: "Quiz", attachments: await data.getPieceAttachmentList(piece, FileType.quiz) },
  }
}

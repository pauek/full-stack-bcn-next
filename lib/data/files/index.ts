import { DataBackendBase } from "../data-backend"

import { getPiece, getPieceWithChildren, pieceHasCover, pieceHasDoc } from "./pieces"

import {
  getAttachmentContent,
  getPieceAttachmentList,
  getPieceDocument,
  getPieceFileData,
  getPieceImageList,
  getPieceSlideList,
} from "./attachments"

import { getQuizAnswersForHash } from "./quiz"
import { getAllIdpaths } from "./backend"
import { getMapPositionsExtended, updateMapPositions } from "./positions"
import { getContentTree } from "./tree"

console.info(`Backend = "files"`)

export const backend: DataBackendBase = {
  getInfo: () => {
    return "<< FILES >>"
  },

  getPiece,
  getPieceWithChildren,
  pieceHasCover,
  pieceHasDoc,

  getAttachmentContent: getAttachmentContent,
  getPieceAttachmentList,
  getPieceDocument,
  getPieceFileData,
  getPieceImageList,
  getPieceSlideList,

  getQuizAnswersForHash,

  getAllIdpaths,
  getContentTree,

  getMapPositionsExtended,
  updateMapPositions,
}

import { DataBackendBase } from "../data-backend"

import { getPiece, getPieceWithChildren, pieceHasCover, pieceHasDoc } from "./pieces"

import {
  getAttachmentBytes,
  getPieceAttachmentList,
  getPieceDocument,
  getPieceFileData,
  getPieceImageList,
  getPieceSlideList,
} from "./attachments"

import { getQuizAnswerForHash } from "./answers"
import { getAllIdpaths } from "./backend"
import { getMapPositions, getMapPositionsExtended, updateMapPositions } from "./positions"
import { getContentTree } from "./tree"

export const backend: DataBackendBase = {
  getInfo: () => {
    return "<< FILES >>"
  },

  getPiece,
  getPieceWithChildren,
  pieceHasCover,
  pieceHasDoc,

  getAttachmentBytes,
  getPieceAttachmentList,
  getPieceDocument,
  getPieceFileData,
  getPieceImageList,
  getPieceSlideList,

  getQuizAnswerForHash,

  getMapPositions,

  getAllIdpaths,
  getContentTree,

  getMapPositionsExtended,
  updateMapPositions,
}

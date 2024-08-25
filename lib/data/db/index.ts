import { env } from "@/lib/env.mjs"
import { DataBackendBase } from "../data-backend"
import { getPiece, getPieceWithChildren, pieceHasCover, pieceHasDoc } from "./pieces"
import { getAllIdpaths } from "./tree"

import {
  getAttachmentContent,
  getPieceAttachmentList,
  getPieceAttachmentTypes,
  getPieceDocument,
  getPieceFileData,
  getPieceImageList,
  getPieceSlideList,
  getQuizAnswersForHash,
} from "./attachments"

import { getContentTree } from "./tree"

import { getMapPositionsExtended, updateMapPositions } from "./positions"

export const backend: DataBackendBase = {
  getInfo: () => `DB: ${env.TURSO_URL}`,

  getAllIdpaths,

  getPiece,
  getPieceDocument,
  getPieceWithChildren,
  pieceHasCover,
  pieceHasDoc,

  getPieceAttachmentTypes,
  getPieceAttachmentList,
  getAttachmentContent,
  getPieceImageList,
  getPieceSlideList,
  getPieceFileData,
  getQuizAnswersForHash,

  getContentTree,

  getMapPositionsExtended,  
  updateMapPositions,
}

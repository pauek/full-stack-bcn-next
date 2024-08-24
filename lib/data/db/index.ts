import { env } from "@/lib/env.mjs"
import { DataBackendBase } from "../data-backend"

import { getAllIdpaths } from "./idpaths"

import { getPiece, getPieceWithChildren, pieceHasCover, pieceHasDoc } from "./pieces"

import {
  getPieceDocument,
  getAttachmentContent,
  getPieceAttachmentList,
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

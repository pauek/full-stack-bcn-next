import { env } from "@/lib/env.mjs"
import { DataBackendBase } from "../data-backend"

import { getAllIdpaths } from "./idpaths"

import {
  getPiece,
  getPieceDocument,
  getPieceWithChildren,
  pieceHasCover,
  pieceHasDoc,
} from "./pieces"

import {
  getAttachmentBytes,
  getPieceAttachmentList,
  getPieceFileData,
  getPieceImageList,
  getPieceSlideList,
  getQuizAnswerForHash,
} from "./attachments"

import { getContentTree } from "./tree"

import { getMapPositions, getMapPositionsExtended, updateMapPositions } from "./positions"

export const backend: DataBackendBase = {
  getInfo: () => `DB: ${env.TURSO_URL}`,

  getAllIdpaths,

  getPiece,
  getPieceDocument,
  getPieceWithChildren,
  pieceHasCover,
  pieceHasDoc,

  getPieceAttachmentList,
  getAttachmentBytes,
  getPieceImageList,
  getPieceSlideList,
  getPieceFileData,
  getQuizAnswerForHash,

  getContentTree,

  getMapPositions,
  getMapPositionsExtended,
  updateMapPositions,
}


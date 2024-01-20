import { DataBackend } from "../data-backend";
import {
  getAllIdpaths,
  getBreadcrumbData,
  getContentTree,
  getPiece,
  getPieceCoverImageData,
  getPieceDocument,
  getPieceImageList,
  getPieceSlideList,
  getPieceWithChildren,
  pieceHasCover,
} from "./piece";

if (!process.env.CONTENT_ROOT) {
  throw "No content root!";
}
export const __CONTENT_ROOT = process.env.CONTENT_ROOT!;

export default {
  getPiece,
  getPieceWithChildren,
  getPieceDocument,
  getPieceImageList,
  getPieceSlideList,
  getPieceCoverImageData,
  getBreadcrumbData,
  getContentTree,
  getAllIdpaths,
  pieceHasCover,
} satisfies DataBackend;

export * from "./hashes";
export * from "./piece";
export * from "./metadata";
export { findDocFilename, findCoverImageFilename } from "./utils";

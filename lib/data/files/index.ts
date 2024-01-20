import { DataBackend } from "../data-backend";
import {
  getAllIdpaths,
  getBreadcrumbData,
  getContentTree,
  getPiece,
  getPieceCoverImageData,
  getPieceCoverImageFilename,
  getPieceDocument,
  getPieceImageList,
  getPieceSlideList,
  getPieceWithChildren,
} from "./piece";

export default {
  getPiece,
  getPieceWithChildren,
  getPieceDocument,
  getPieceImageList,
  getPieceSlideList,
  getPieceCoverImageData,
  getPieceCoverImageFilename,
  getBreadcrumbData,
  getContentTree,
  getAllIdpaths,
} satisfies DataBackend;

export * from "./hashes";
export * from "./piece";
export * from "./metadata";

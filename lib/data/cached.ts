import data from "@/lib/data";
import { cache } from "react";
import { ContentPiece } from "../adt";
import { FileTypeEnum } from "@/data/schema";

export const cachedGetPiece = cache(async (idpath: string[]) => {
  return data.getPiece(idpath);
});

export const cachedGetPieceWithChildren = cache(async (idpath: string[]) => {
  return data.getPieceWithChildren(idpath);
});

export const cachedGetAllIdpaths = cache(async (root: ContentPiece) => {
  return data.getAllIdpaths(root);
});

export const cachedGetPieceImageList = cache(async (piece: ContentPiece) => {
  return data.getPieceImageList(piece);
});

export const cachedGetPieceSlideList = cache(async (piece: ContentPiece) => {
  return data.getPieceSlideList(piece);
});

export const cachedGetPieceFileData = cache(
  async (piece: ContentPiece, filename: string, filetype: FileTypeEnum) => {
    return data.getPieceFileData(piece, filename, filetype);
  }
);

export const cachedPieceHasCover = cache(async (piece: ContentPiece) => {
  return data.pieceHasCover(piece);
});

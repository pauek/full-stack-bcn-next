import { FileTypeEnum } from "@/data/schema";
import { ContentPiece } from "../adt";

export type ImgData = {
  data: Buffer;
  extension: string;
};

export type CrumbData = {
  name: string;
  idpath: string[];
  siblings?: Array<CrumbData>;
};

export type WalkFunc = (piece: ContentPiece, children: any[]) => Promise<any>;

export type FileBuffer = {
  name: string;
  buffer: Buffer;
};

// prettier-ignore
export interface DataBackendBase {
  getInfo: () => string;

  getPiece: (idpath: string[]) => Promise<ContentPiece | null>;
  getPieceWithChildren: (idpath: string[]) => Promise<ContentPiece | null>;
  getContentTree: (idpath: string[], options: { level: number }) => Promise<ContentPiece | null>;

  getPieceCoverImageData: (piece: ContentPiece) => Promise<FileBuffer | null>;
  getPieceDocument: (piece: ContentPiece) => Promise<FileBuffer | null>;
  getPieceFileData: (piece: ContentPiece, filename: string, filetype: FileTypeEnum) => Promise<Buffer | null>;
  getPieceImageList: (piece: ContentPiece) => Promise<{ name: string, hash: string }[]>;
  getPieceSlideList: (piece: ContentPiece) => Promise<{ name: string, hash: string }[]>;

  pieceHasCover: (piece: ContentPiece) => Promise<boolean>;
  pieceHasDoc: (piece: ContentPiece) => Promise<boolean>;
}

export interface DataBackend extends DataBackendBase {
  getBreadcrumbData: (...idpath: string[]) => Promise<CrumbData[]>;
  getAllIdpaths: (root: ContentPiece) => Promise<string[][]>;
  walkContentPieces: (piece: ContentPiece, func: WalkFunc) => Promise<void>;
}

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

  getPieceDocument: (piece: ContentPiece) => Promise<FileBuffer | null>;
  getPieceImageList: (piece: ContentPiece) => Promise<{ name: string, hash: string }[] | null>;
  getPieceSlideList: (piece: ContentPiece) => Promise<{ name: string, hash: string }[] | null>;
  getPieceCoverImageData: (piece: ContentPiece) => Promise<FileBuffer | null>;
  getPieceFileData: (piece: ContentPiece, filename: string, filetype: FileTypeEnum) => Promise<Buffer | null>;
  pieceHasCover: (piece: ContentPiece) => Promise<boolean>;
  pieceHasDoc: (piece: ContentPiece) => Promise<boolean>;

  walkContentPieces: (piece: ContentPiece, func: WalkFunc) => Promise<void>;
}

export interface DataBackend extends DataBackendBase {
  getBreadcrumbData: (...idpath: string[]) => Promise<CrumbData[]>;
  getAllIdpaths: (root: ContentPiece) => Promise<string[][]>;
}

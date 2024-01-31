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

type WalkFunc = (piece: ContentPiece) => Promise<void>;


// prettier-ignore
export interface DataBackendBase {
  getInfo: () => string;

  getPiece: (idpath: string[]) => Promise<ContentPiece | null>;
  getPieceWithChildren: (idpath: string[]) => Promise<ContentPiece | null>;
  getContentTree: (idpath: string[], options: { level: number }) => Promise<ContentPiece | null>;

  getPieceDocument: (piece: ContentPiece) => Promise<Buffer | null>;
  getPieceImageList: (piece: ContentPiece) => Promise<string[] | null>;
  getPieceSlideList: (piece: ContentPiece) => Promise<string[] | null>;
  getPieceCoverImageData: (piece: ContentPiece) => Promise<ImgData | null>;
  getPieceFileData: (piece: ContentPiece, filename: string, filetype: FileTypeEnum) => Promise<Buffer | null>;
  pieceHasCover: (piece: ContentPiece) => Promise<boolean>;
  pieceHasDoc: (piece: ContentPiece) => Promise<boolean>;

  walkContentPieces: (piece: ContentPiece, func: WalkFunc) => Promise<void>;
}

export interface DataBackend extends DataBackendBase {
  getBreadcrumbData: (...idpath: string[]) => Promise<CrumbData[]>;
  getAllIdpaths: (root: ContentPiece) => Promise<string[][]>;
}

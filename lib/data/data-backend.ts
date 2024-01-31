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
export interface DataBackend {
  getInfo: () => string;

  getPiece: (idpath: string[]) => Promise<ContentPiece | null>;
  getPieceWithChildren: (idpath: string[]) => Promise<ContentPiece | null>;
  getPieceDocument: (idpath: string[]) => Promise<Buffer | null>;
  getPieceImageList: (piece: ContentPiece) => Promise<string[] | null>;
  getPieceSlideList: (piece: ContentPiece) => Promise<string[] | null>;
  getPieceCoverImageData: (piece: ContentPiece) => Promise<ImgData | null>;
  getPieceFileData: (piece: ContentPiece, filename: string, filetype: FileTypeEnum) => Promise<Buffer | null>;
  pieceHasCover: (piece: ContentPiece) => Promise<boolean>;
  pieceHasDoc: (piece: ContentPiece) => Promise<boolean>;

  getContentTree: (idpath: string[], options: { level: number }) => Promise<ContentPiece | null>;
  getBreadcrumbData: (...idpath: string[]) => Promise<CrumbData[]>;
  getAllIdpaths: (piece: ContentPiece) => Promise<string[][]>;
  walkContentPieces: (piece: ContentPiece, func: WalkFunc) => Promise<void>;
}

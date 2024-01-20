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

export interface DataBackend {
  getPiece: (idpath: string[]) => Promise<ContentPiece | null>;
  getPieceWithChildren: (idpath: string[]) => Promise<ContentPiece | null>;
  getPieceDocument: (idpath: string[]) => Promise<Buffer | null>;
  getPieceImageList: (piece: ContentPiece) => Promise<string[] | null>;
  getPieceSlideList: (piece: ContentPiece) => Promise<string[] | null>;
  getPieceCoverImageData: (piece: ContentPiece) => Promise<ImgData | null>;
  getPieceCoverImageFilename: (piece: ContentPiece) => Promise<string | null>;

  getContentTree: (idpath: string[], options: { level: number }) => Promise<ContentPiece | null>;
  getBreadcrumbData: (...idpath: string[]) => Promise<CrumbData[]>;
  getAllIdpaths: (piece: ContentPiece) => Promise<string[][]>;
}

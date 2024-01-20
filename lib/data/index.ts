import { ContentPiece } from "../adt";
import type { CrumbData, ImgData } from "./files/files";
import filesBackend from '@/lib/data/files/files';

export interface DataBackend {
  getPiece: (idpath: string[]) => Promise<ContentPiece | null>;
  getPieceWithChildren: (idpath: string[]) => Promise<ContentPiece | null>;
  getPieceDocument: (idpath: string[]) =>  Promise<Buffer | null>;
  getPieceImageList: (piece: ContentPiece) => Promise<string[] | null>;
  getPieceSlideList: (piece: ContentPiece) => Promise<string[] | null>;
  getPieceCoverImageData: (piece: ContentPiece) => Promise<ImgData | null>;
  getPieceCoverImageFilename: (piece: ContentPiece) => Promise<string | null>;
  getBreadcrumbData: (...idpath: string[]) => Promise<CrumbData[]>;
  getContentTree: (idpath: string[], level: number) => Promise<ContentPiece | null>;
  getAllIdpaths: (piece: ContentPiece) => Promise<string[][]>;
  pieceDocFilename: (diskpath: string) => Promise<string | null>;
}

export default filesBackend;
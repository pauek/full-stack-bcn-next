import { FileType, MapPosition, MapPositionExtended } from "@/data/schema"
import { ContentPiece } from "../adt"
import { Hash } from "./hashing"

export type ImgData = {
  data: Buffer
  extension: string
}

export type CrumbData = {
  name: string
  idpath: string[]
  siblings?: Array<CrumbData>
}

export type WalkFunc = (piece: ContentPiece, children: any[]) => Promise<any>

export type FilesWalkFunc<T> = (data: {
  index: number
  piece: ContentPiece
  diskpath: string
  children: T[]
}) => Promise<any>

export type FileBuffer = {
  name: string
  buffer: Buffer
}

export type FileReference = {
  filename: string
  hash: string
  filetype: FileType
}

export type FileContent = null | {
  bytes: Buffer
  metadata: Record<string, any> | null
}

// prettier-ignore
export interface DataBackendBase {
  getInfo: () => string

  getPiece: (idpath: string[]) => Promise<ContentPiece | null>
  getPieceWithChildren: (idpath: string[]) => Promise<ContentPiece | null>
  getContentTree: (idpath: string[], options: { level: number }) => Promise<ContentPiece | null>

  getPieceAttachmentList: (piece: ContentPiece, filetype: FileType) => Promise<FileReference[]>
  getAttachmentContent: (piece: ContentPiece, fileref: FileReference) => Promise<FileContent>
  getQuizAnswersForHash: (idpath: string[], hash: Hash) => Promise<string[]>
  
  getPieceDocument: (piece: ContentPiece) => Promise<FileBuffer | null>
  getPieceFileData: (piece: ContentPiece, filename: string, filetype: FileType) => Promise<Buffer | null>
  getPieceImageList: (piece: ContentPiece) => Promise<FileReference[]>
  getPieceSlideList: (piece: ContentPiece) => Promise<FileReference[]>

  pieceHasCover: (piece: ContentPiece) => Promise<boolean>
  pieceHasDoc: (piece: ContentPiece) => Promise<boolean>

  getAllIdpaths: (rootIdpath: string[]) => Promise<string[][]>

  getMapPositions(): Promise<MapPosition[]>
  getMapPositionsExtended(): Promise<MapPositionExtended[]>
  updateMapPositions: (positions: MapPosition[]) => Promise<void>
}

export interface DataBackend extends DataBackendBase {
  getBreadcrumbData: (...idpath: string[]) => Promise<CrumbData[]>
  walkContentPieces: (piece: ContentPiece, func: WalkFunc) => Promise<void>
  anyChildHasAttachmentsOfType: (piece: ContentPiece, filetype: FileType) => Promise<boolean>
}

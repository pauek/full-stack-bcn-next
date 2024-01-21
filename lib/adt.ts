
export type ContentPieceMetadata = {
  numSlides: number;
  hasDoc: boolean;
  index: number;
  hidden?: boolean | null;
  row?: number | null;
}

export type ContentPiece = {
  id: string;
  hash: string;
  name: string;
  idpath: string[];
  diskpath: string;
  children?: ContentPiece[];
  metadata: ContentPieceMetadata;
};

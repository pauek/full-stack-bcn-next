export type ContentPiece = {
  id: string;
  hash: string;
  name: string;
  idpath: string[];
  diskpath: string;
  numSlides: number;
  hasDoc: boolean;
  
  parent?: ContentPiece;
  children?: ContentPiece[];
  index?: number;
  hidden?: boolean;
  row?: number;
};

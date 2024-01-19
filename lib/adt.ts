export type ContentPiece = {
  id: string;
  name: string;
  idpath: string[];
  diskpath: string;
  parent?: ContentPiece;
  children?: ContentPiece[];
  index?: number;
  hidden?: boolean;
  row?: number;
};

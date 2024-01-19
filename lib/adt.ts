export type ContentPiece = {
  id: string;
  name: string;
  idpath: string[];
  diskpath: string;
  index?: number;
  hidden?: boolean;
  row?: number;
  children?: ContentPiece[];
};

export type Chapter = ContentPiece & { type: "chapter" };

export type Session = ContentPiece & { type: "session" };

export type Part = ContentPiece & { type: "part" };

export type Course = ContentPiece & { type: "root" };

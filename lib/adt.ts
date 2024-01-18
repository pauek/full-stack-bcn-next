export type ContentPiece = {
  type: "chapter" | "session" | "part" | "root";
  id: string;
  path: string[];
  index?: number;
  name: string;
  diskpath: string;
  children?: ContentPiece[];
};

export type Chapter = ContentPiece & { type: "chapter" };

export type Session = ContentPiece & { type: "session" };

export type Part = ContentPiece & { type: "part" };

export type Course = ContentPiece & { type: "root" };

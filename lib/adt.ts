export type ContentPiece = {
  type: "chapter" | "session" | "part" | "root";
  id: string;
  name: string;
  path: string[];
  diskpath: string;
  index?: number;
  hidden?: boolean;
  children?: ContentPiece[];
};

export type Chapter = ContentPiece & { type: "chapter" };

export type Session = ContentPiece & { type: "session" };

export type Part = ContentPiece & { type: "part" };

export type Course = ContentPiece & { type: "root" };

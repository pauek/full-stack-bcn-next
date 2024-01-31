export type ContentPiece = {
  id: string;
  hash: string;
  name: string;
  idpath: string[];
  diskpath: string;
  children?: ContentPiece[];
  metadata: Record<string, any>;
};

export const isPieceFile = (filename: string) => {
  return filename === "doc.mdx" || filename.startsWith("cover.");
};
export const isPieceSubdir = (dir: string) => dir === "images" || dir === "slides";

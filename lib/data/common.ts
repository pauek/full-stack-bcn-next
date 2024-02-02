import { ContentPiece } from "../adt";
import { CrumbData, DataBackend, DataBackendBase, WalkFunc } from "./data-backend";

export const getBreadcrumbData = async function (
  this: DataBackendBase,
  ...idpath: string[]
): Promise<CrumbData[]> {
  const crumbs: CrumbData[] = [];
  let siblings: ContentPiece[] | undefined;
  for (const size of [2, 3, 4].slice(0, idpath.length - 1)) {
    const piece = await this.getPieceWithChildren(idpath.slice(0, size));
    if (!piece) return [];
    crumbs.push({ name: piece.name, idpath: piece.idpath, siblings });
    siblings = piece.children; // for next iteration
  }
  return crumbs;
};

export const getAllIdpaths = async function (
  this: DataBackend,
  root: ContentPiece
): Promise<string[][]> {
  const result: string[][] = [];
  await this.walkContentPieces(root, async (piece) => {
    result.push(piece.idpath);
  });
  return result;
};

export const walkContentPieces = async function (
  this: DataBackend,
  piece: ContentPiece,
  func: WalkFunc
) {
  const dbPiece = await this.getPieceWithChildren(piece.idpath);
  if (!dbPiece) {
    throw `Piece not found in database: ${piece.idpath.join("/")}`;
  }
  const children: any[] = [];
  for (const child of dbPiece.children || []) {
    children.push(await this.walkContentPieces(child, func));
  }
  return await func(dbPiece, children);
};

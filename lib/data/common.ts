import { ContentPiece } from "../adt";
import { CrumbData, DataBackendBase } from "./data-backend";

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
  this: DataBackendBase,
  root: ContentPiece
): Promise<string[][]> {
  const result: string[][] = [];
  await this.walkContentPieces(root, async (piece) => {
    result.push(piece.idpath);
  });
  return result;
};

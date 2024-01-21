import { ContentPiece } from "../adt";
import { CrumbData } from "./data-backend";

export const getBreadcrumbData =
  (getPieceWithChildren: (idpath: string[]) => Promise<ContentPiece | null>) =>
  async (...idpath: string[]): Promise<CrumbData[]> => {
    const crumbs: CrumbData[] = [];
    let siblings: ContentPiece[] | undefined;
    for (const size of [2, 3, 4].slice(0, idpath.length - 1)) {
      const piece = await getPieceWithChildren(idpath.slice(0, size));
      if (!piece) return [];
      crumbs.push({ name: piece.name, idpath: piece.idpath, siblings });
      siblings = piece.children; // for next iteration
    }
    return crumbs;
  };

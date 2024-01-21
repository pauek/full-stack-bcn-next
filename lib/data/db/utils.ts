import { DBPiece } from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import { lastItem } from "@/lib/utils";

export const fromDbPiece = (dbPiece: DBPiece): ContentPiece => {
  const idpath = dbPiece.idpath.split("/");
  return {
    hash: dbPiece.hash,
    name: dbPiece.name,
    diskpath: dbPiece.diskpath,
    id: lastItem(idpath),
    idpath,
    children: [],
    metadata: dbPiece.metadata,
  };
};

import * as schema from "@/data/schema";
import { base64ToBytes, lastItem } from "@/lib/utils";
import { and, eq, like } from "drizzle-orm";
import { extname } from "path";
import { ContentPiece } from "../../adt";
import { ImgData } from "../data-backend";
import { db } from "./db";
import hashes from "./hashes.json";
import { getFileData, getPieceFilesByFiletype, pieceHasFiletype } from "./utils";

const pathToHash = new Map(hashes.map(({ hash, path }) => [path, hash]));

export const pieceHasCover = (piece: ContentPiece) => pieceHasFiletype(piece.hash, "cover");
export const pieceHasDoc = (piece: ContentPiece) => pieceHasFiletype(piece.hash, "doc");

export const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const hash = pathToHash.get(idpath.join("/"));
  if (!hash) {
    return null;
  }
  const result = await db.query.pieces.findFirst({
    where: eq(schema.pieces.hash, hash),
    with: { children: true },
  });
  if (!result) {
    return null;
  }
  return {
    ...result,
    id: lastItem(idpath),
    idpath,
    parent: undefined,
    children: [],
  };
};

export const getPieceWithChildren = async (idpath: string[]): Promise<ContentPiece | null> => {
  const hash = pathToHash.get(idpath.join("/"));
  if (!hash) {
    return null;
  }
  const result = await db.query.pieces.findFirst({
    where: eq(schema.pieces.hash, hash),
    with: { children: true },
  });
  if (!result) {
    return null;
  }
  if (idpath.join("/") !== result.idpath) {
    throw "Mismatch between paths!";
  }
  const { index, hasDoc, numSlides, hidden, row } = result.metadata;

  const piece: ContentPiece = {
    ...result,
    idpath,
    id: lastItem(idpath),
    parent: undefined,
    children: [],
    metadata: { index, hasDoc, numSlides, hidden, row },
  };
  piece.children = result.children.map((ch) => ({
    ...ch,
    id: ch.idpath.split("/").slice(-1)[0],
    idpath: ch.idpath.split("/"),
    parent: piece,
    metadata: ch.metadata,
  }));
  return piece;
};

export const getPieceDocument = async (idpath: string[]): Promise<Buffer | null> => {
  const hash = pathToHash.get(idpath.join("/"));
  if (!hash) {
    return null;
  }
  const [result] = await getPieceFilesByFiletype(hash, "doc");
  if (!result) {
    return null;
  }
  const data = await getFileData(result.hash);
  if (!data) {
    console.warn(`Document ${idpath} has dangling document!`);
    return null;
  }
  return Buffer.from(base64ToBytes(data));
};

export const __getFileListByFiletype =
  (filetype: schema.FileTypeEnum) =>
  async (piece: ContentPiece): Promise<string[] | null> => {
    const results = await getPieceFilesByFiletype(piece.hash, filetype);
    if (!results) {
      return null;
    }
    return results.map(({ name }) => name);
  };

export const getPieceImageList = __getFileListByFiletype("image");
export const getPieceSlideList = __getFileListByFiletype("slide");

export const getPieceCoverImageData = async (piece: ContentPiece): Promise<ImgData | null> => {
  const [file] = await getPieceFilesByFiletype(piece.hash, "cover", { limit: 1 });
  if (!file) {
    return null;
  }
  const base64 = await getFileData(file.hash);
  if (!base64) {
    return null;
  }
  const extension = extname(file.name);
  const data = Buffer.from(base64ToBytes(base64));
  return { data, extension };
};

export const getPieceFileData = async (
  piece: ContentPiece,
  filename: string,
  filetype: schema.FileTypeEnum
): Promise<Buffer | null> => {
  const [result] = await db
    .select({ data: schema.files.data })
    .from(schema.pieces)
    .leftJoin(schema.attachments, eq(schema.pieces.hash, schema.attachments.piece))
    .leftJoin(schema.files, eq(schema.attachments.file, schema.files.hash))
    .where(
      and(
        eq(schema.pieces.hash, piece.hash),
        eq(schema.files.name, filename),
        eq(schema.files.filetype, filetype)
      )
    ).limit(1);
  if (!result || !result.data) {
    return null;
  }
  return Buffer.from(base64ToBytes(result.data));
};

export const getContentTree = async (
  idpath: string[],
  { level }: { level: number }
): Promise<ContentPiece | null> => {
  const hash = pathToHash.get(idpath.join("/"));
  if (!hash) {
    return null;
  }

  // TODO: Implement other levels??
  if (level !== 2) {
    throw Error(`Unimplemented tree with level != 2 (level = ${level})`);
  }

  const result = await db.query.pieces.findFirst({
    where: eq(schema.pieces.hash, hash),
    with: { children: { with: { children: true } } },
  });
  if (!result) {
    return null;
  }

  type Result = schema.DBPiece & { children?: Result[] };

  const __convert = (res: Result): ContentPiece => {
    const piece: ContentPiece = {
      ...res,
      id: lastItem(res.idpath.split("/")),
      idpath: res.idpath.split("/"),
      parent: undefined,
      children: res.children?.map((ch) => __convert(ch)),
    };
    return piece;
  };

  return __convert(result);
};

export const getAllIdpaths = async (piece: ContentPiece): Promise<string[][]> => {
  const idjpath = piece.idpath.join("/");
  const result = await db.query.pieces.findMany({
    columns: { idpath: true },
    where: like(schema.pieces.idpath, `${idjpath}%`),
  });
  return result.map(({ idpath }) => idpath.split("/"));
};

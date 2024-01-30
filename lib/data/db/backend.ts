import * as schema from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import { base64ToBytes, lastItem } from "@/lib/utils";
import { and, asc, eq, like } from "drizzle-orm";
import { extname } from "path";
import { ImgData } from "../data-backend";
import { db } from "./db";
import hashes from "../hashes.json";
import { getFileData, getPieceFilesByFiletype, pieceHasFiletype } from "./utils";

const pathToHash = new Map(hashes.map(({ hash, idjpath }) => [idjpath, hash]));

export const pieceHasCover = (piece: ContentPiece) => pieceHasFiletype(piece.hash, "cover");
export const pieceHasDoc = (piece: ContentPiece) => pieceHasFiletype(piece.hash, "doc");

export const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const hash = pathToHash.get(idpath.join("/"));
  if (!hash) {
    return null;
  }
  const result = await db.query.pieces.findFirst({
    where: eq(schema.pieces.piece_hash, hash),
  });
  if (!result) {
    return null;
  }
  return {
    ...result,
    hash: result.piece_hash,
    id: lastItem(idpath),
    idpath,
    children: [],
  };
};

export const getPieceWithChildren = async (idpath: string[]): Promise<ContentPiece | null> => {
  const hash = pathToHash.get(idpath.join("/"));
  if (!hash) {
    return null;
  }
  const result = await db.query.pieces.findFirst({
    where: eq(schema.pieces.piece_hash, hash),
    with: { children: true },
  });
  if (!result) {
    return null;
  }
  if (idpath.join("/") !== result.idjpath) {
    throw "Mismatch between paths!";
  }
  const { index, hasDoc, numSlides, hidden, row } = result.metadata;

  const piece: ContentPiece = {
    ...result,
    hash: result.piece_hash,
    idpath,
    id: lastItem(idpath),
    children: [],
    metadata: { index, hasDoc, numSlides, hidden, row },
  };
  piece.children = result.children.map((child) => ({
    ...child,
    hash: child.piece_hash,
    id: child.idjpath.split("/").slice(-1)[0],
    idpath: child.idjpath.split("/"),
    metadata: child.metadata,
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
  if (data === null) {
    console.warn(`Document ${idpath} has dangling document!
    [file_hash = ${result.hash}]
    [piece_hash = ${hash}]
`);
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
    .leftJoin(schema.attachments, eq(schema.pieces.piece_hash, schema.attachments.piece))
    .leftJoin(schema.files, eq(schema.attachments.file, schema.files.hash))
    .where(
      and(
        eq(schema.pieces.piece_hash, piece.hash),
        eq(schema.files.name, filename),
        eq(schema.files.filetype, filetype)
      )
    )
    .limit(1);
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
    where: eq(schema.pieces.piece_hash, hash),
    with: {
      children: {
        with: {
          children: { orderBy: schema.pieces.diskpath },
        },
        orderBy: schema.pieces.diskpath,
      },
    },
    orderBy: schema.pieces.diskpath,
  });
  if (!result) {
    return null;
  }

  type Result = schema.DBPiece & { children?: Result[] };

  const __convert = (res: Result): ContentPiece => {
    const piece: ContentPiece = {
      ...res,
      hash: res.piece_hash,
      id: lastItem(res.idjpath.split("/")),
      idpath: res.idjpath.split("/"),
      children: res.children?.map((ch) => __convert(ch)),
    };
    return piece;
  };

  return __convert(result);
};

export const getAllIdpaths = async (piece: ContentPiece): Promise<string[][]> => {
  const idjpath = piece.idpath.join("/");
  const result = await db.query.pieces.findMany({
    columns: { idjpath: true },
    where: like(schema.pieces.idjpath, `${idjpath}%`),
    orderBy: schema.pieces.diskpath,
  });
  return result.map(({ idjpath }) => idjpath.split("/"));
};

type WalkFunc = (piece: ContentPiece) => Promise<void>;

export const walkContentPieces = async (piece: ContentPiece, func: WalkFunc) => {
  const allIdpaths = await db
    .select({ idjpath: schema.pieces.idjpath })
    .from(schema.pieces)
    .orderBy(asc(schema.pieces.diskpath));

  for (const { idjpath } of allIdpaths) {
    const idpath = idjpath.split("/");
    const piece = await getPiece(idpath);
    if (!piece) {
      console.warn(`Strange that cannot find a piece by idpath here! idpath = ${idpath}`);
      continue;
    }
    await func(piece);
  }
};

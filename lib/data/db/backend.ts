import * as schema from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import { base64ToBytes, lastItem } from "@/lib/utils";
import { and, eq } from "drizzle-orm";
import { extname } from "path";
import { FileBuffer, ImgData, WalkFunc } from "../data-backend";
import hashes from "../hashes.json";
import { db } from "./db";
import { getFileData, getPieceFilesByFiletype, pieceHasFiletype } from "./utils";

const pathToHash = new Map(hashes.map(({ hash, idjpath }) => [idjpath, hash]));
const hashToPath = new Map(hashes.map(({ hash, idjpath }) => [hash, idjpath]));

export const pieceHasCover = (piece: ContentPiece) => pieceHasFiletype(piece.hash, "cover");
export const pieceHasDoc = (piece: ContentPiece) => pieceHasFiletype(piece.hash, "doc");

export const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const hash = pathToHash.get(idpath.join("/"));
  if (!hash) {
    console.log(`Hash not found for idpath ${idpath.join("/")}`);
    return null;
  }
  const result = await db.query.pieces.findFirst({
    where: eq(schema.pieces.pieceHash, hash),
  });
  if (!result) {
    console.log(
      `Piece not found in table 'pieces' for idpath ${idpath.join("/")} [hash = ${hash}]`
    );
    return null;
  }
  return {
    ...result,
    hash: result.pieceHash,
    id: lastItem(idpath),
    idpath,
    children: [],
  };
};

export const getPieceWithChildren = async (idpath: string[]): Promise<ContentPiece | null> => {
  const hash = pathToHash.get(idpath.join("/"));
  if (!hash) {
    console.info("Hash not found in table!");
    return null;
  }
  const result = await db.query.pieces.findFirst({
    where: eq(schema.pieces.pieceHash, hash),
    with: { children: { columns: {}, with: { child: true } } },
  });
  if (!result) {
    return null;
  }

  const piece: ContentPiece = {
    ...result,
    hash: result.pieceHash,
    idpath,
    id: lastItem(idpath),
    children: [],
    metadata: result.metadata,
  };
  piece.children = result.children.map(({ child }) => {
    const idjpath = hashToPath.get(child.pieceHash);
    if (idjpath === undefined) {
      throw Error(`getPieceWithChildren: path not found for "${child.pieceHash}"?!?`);
    }
    return {
      ...child,
      hash: child.pieceHash,
      id: idjpath.split("/").slice(-1)[0],
      idpath: idjpath.split("/"),
      metadata: child.metadata,
    };
  });
  return piece;
};

export const getPieceDocument = async (piece: ContentPiece): Promise<FileBuffer | null> => {
  const hash = pathToHash.get(piece.idpath.join("/"));
  if (!hash) {
    return null;
  }
  const [result] = await getPieceFilesByFiletype(hash, "doc");
  if (!result) {
    return null;
  }
  const data = await getFileData(result.hash);
  if (data === null) {
    console.warn(`Content piece "${piece.idpath.join("/")}" [${hash}] has a dangling document!
    [file_hash = ${result.hash}]
    [pieceHash = ${hash}]
`);
    return null;
  }
  return { name: result.name, buffer: Buffer.from(base64ToBytes(data)) };
};

export const __getFileListByFiletype =
  (filetype: schema.FileTypeEnum) =>
  async (piece: ContentPiece): Promise<{ name: string; hash: string }[]> => {
    const results = await getPieceFilesByFiletype(piece.hash, filetype);
    if (!results) {
      return [];
    }
    return results;
  };

export const getPieceImageList = __getFileListByFiletype("image");
export const getPieceSlideList = __getFileListByFiletype("slide");

export const getPieceCoverImageData = async (piece: ContentPiece): Promise<FileBuffer | null> => {
  const [file] = await getPieceFilesByFiletype(piece.hash, "cover", { limit: 1 });
  if (!file) {
    return null;
  }
  const base64 = await getFileData(file.hash);
  if (!base64) {
    return null;
  }
  const buffer = Buffer.from(base64ToBytes(base64));
  return { buffer, name: file.name };
};

export const getPieceFileData = async (
  piece: ContentPiece,
  filename: string,
  filetype: schema.FileTypeEnum
): Promise<Buffer | null> => {
  const [result] = await db
    .select({ data: schema.files.data })
    .from(schema.pieces)
    .leftJoin(schema.attachments, eq(schema.pieces.pieceHash, schema.attachments.piece))
    .leftJoin(schema.files, eq(schema.attachments.file, schema.files.hash))
    .where(
      and(
        eq(schema.pieces.pieceHash, piece.hash),
        eq(schema.attachments.filename, filename),
        eq(schema.attachments.filetype, filetype)
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
    where: eq(schema.pieces.pieceHash, hash),
    with: {
      children: {
        with: {
          child: {
            with: {
              children: {
                with: {
                  child: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!result) {
    return null;
  }

  type Result = schema.DBPiece & { children?: { child: Result }[] };

  const __convert = (res: Result): ContentPiece => {
    const idjpath = hashToPath.get(res.pieceHash);
    if (idjpath === undefined) {
      throw Error(`getContentTree: path not found for "${res.pieceHash}"?!?`);
    }
    const piece: ContentPiece = {
      ...res,
      hash: res.pieceHash,
      id: lastItem(idjpath.split("/")),
      idpath: idjpath.split("/"),
      children: res.children?.map(({ child }) => __convert(child)),
    };
    return piece;
  };

  return __convert(result);
};

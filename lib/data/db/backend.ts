import * as schema from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import { base64ToBytes, lastItem } from "@/lib/utils";
import { and, eq, like } from "drizzle-orm";
import { FileBuffer, FileReference } from "../data-backend";
import { Hash } from "../hashing";
import { db } from "./db";
import { getFileData, getPieceFilesByFiletype, pieceHasFiletype } from "./utils";
import { fileTypeInfo } from "../files/utils";

export const pieceHasCover = (piece: ContentPiece) => pieceHasFiletype(piece.hash, "cover");
export const pieceHasDoc = (piece: ContentPiece) => pieceHasFiletype(piece.hash, "doc");

export const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const result = await db.query.hashmap.findFirst({
    where: eq(schema.hashmap.idjpath, idpath.join("/")),
    with: {
      piece: {
        columns: {
          pieceHash: true,
          name: true,
          metadata: true,
          diskpath: true,
        },
      },
    },
  });
  if (!result) {
    console.log(`getPiece: piece not found for idpath "${idpath.join("/")}"`);
    return null;
  }

  return {
    ...result.piece,
    hash: result.pieceHash,
    id: lastItem(idpath),
    idpath,
    children: [],
  };
};

export const getPieceWithChildren = async (idpath: string[]): Promise<ContentPiece | null> => {
  const result = await db.query.hashmap.findFirst({
    where: eq(schema.hashmap.idjpath, idpath.join("/")),
    with: { piece: { with: { children: { with: { child: true } } } } },
  });
  if (!result) {
    return null;
  }
  const { piece: dbPiece } = result;
  const piece: ContentPiece = {
    ...dbPiece,
    hash: dbPiece.pieceHash,
    idpath,
    id: lastItem(idpath),
    children: [],
    metadata: dbPiece.metadata,
  };
  const children: ContentPiece[] = [];
  for (const { child } of dbPiece.children) {
    const result = await db.query.hashmap.findFirst({
      where: eq(schema.hashmap.pieceHash, child.pieceHash),
    });
    if (!result) {
      throw Error(`getPieceWithChildren: ijdpath for child hash not found "${child.pieceHash}"`);
    }
    const { idjpath } = result;
    const idpath = idjpath.split("/");
    children.push({
      ...child,
      hash: child.pieceHash,
      id: idpath.slice(-1)[0],
      idpath,
      metadata: child.metadata,
    });
  }
  piece.children = children;
  return piece;
};

export const pathToHash = async (idpath: string[]): Promise<Hash | null> => {
  const mapItem = await db.query.hashmap.findFirst({
    where: eq(schema.hashmap.idjpath, idpath.join("/")),
  });
  if (!mapItem) {
    return null;
  }
  const { pieceHash: hash } = mapItem;
  return hash;
};

export const hashToPath = async (hash: string): Promise<string[] | null> => {
  const mapItem = await db.query.hashmap.findFirst({
    where: eq(schema.hashmap.pieceHash, hash),
  });
  if (!mapItem) {
    return null;
  }
  const { idjpath } = mapItem;
  return idjpath.split("/");
};

export const getPieceDocument = async (piece: ContentPiece): Promise<FileBuffer | null> => {
  const hash = await pathToHash(piece.idpath);
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
  return { name: result.filename, buffer: Buffer.from(base64ToBytes(data)) };
};

export const getAttachmentBytes = async (piece: ContentPiece, fileref: FileReference) => {
  try {
    const data = await getFileData(fileref.hash);
    if (!data) {
      return null;
    }
    return Buffer.from(data);
  } catch (e) {
    return null;
  }
}

export const __getFileListByFiletype =
  (filetype: schema.FileTypeEnum) =>
  async (piece: ContentPiece): Promise<FileReference[]> => {
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
  return { buffer, name: file.filename };
};

export const getPieceFileData = async (
  piece: ContentPiece,
  filename: string,
  filetype: schema.FileTypeEnum
): Promise<Buffer | null> => {
  const [result] = await db
    .select({ data: schema.files.data })
    .from(schema.pieces)
    .leftJoin(schema.attachments, eq(schema.pieces.pieceHash, schema.attachments.pieceHash))
    .leftJoin(schema.files, eq(schema.attachments.fileHash, schema.files.hash))
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
  const hash = await pathToHash(idpath);
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

  const __convert = async (res: Result): Promise<ContentPiece> => {
    const idpath = await hashToPath(res.pieceHash);
    if (!idpath) {
      throw Error(`getContentTree: path not found for "${res.pieceHash}"?!?`);
    }
    const children: ContentPiece[] = [];
    for (const { child } of res.children || []) {
      children.push(await __convert(child));
    }
    const piece: ContentPiece = {
      ...res,
      hash: res.pieceHash,
      id: lastItem(idpath),
      idpath,
      children,
    };
    return piece;
  };

  return await __convert(result);
};

export const getAllIdpaths = async (rootIdpath: string[]): Promise<string[][]> => {
  const result = await db.query.hashmap.findMany({
    where: like(schema.hashmap.idjpath, `${rootIdpath.join("/")}%`),
    columns: { idjpath: true },
  });
  return result.map(({ idjpath }) => idjpath.split("/"));
};

export const getAllAttachmentPaths = async (
  rootIdpath: string[],
  filetype: schema.FileTypeEnum
): Promise<string[][]> => {
  const results = await db.query.hashmap.findMany({
    where: like(schema.hashmap.idjpath, `${rootIdpath.join("/")}%`),
    with: {
      piece: {
        with: {
          attachments: {
            where: eq(schema.attachments.filetype, filetype),
            columns: { filename: true },
          },
        },
      },
    },
  });
  const idpaths: string[][] = [];
  for (const { idjpath, piece } of results) {
    for (const { filename } of piece.attachments) {
      idpaths.push([...idjpath.split("/"), filename]);
    }
  }
  return idpaths;
};

export const getPieceAttachmentList = async (
  piece: ContentPiece,
  filetype: schema.FileTypeEnum
): Promise<FileReference[]> => {
  const results = await getPieceFilesByFiletype(piece.hash, filetype);
  if (!results) {
    return [];
  }
  return results;
};

import { ContentPiece } from "@/lib/adt";
import { readFile } from "fs/promises";
import { extname, join, join as pathJoin } from "path";
import { CrumbData, ImgData } from "../data-backend";
import { walkContentPieces } from "./hashes";
import * as utils from "./utils";
import { FileTypeEnum } from "@/data/schema";

export { findCoverImageFilename } from "./utils";

export const pieceHasCover = async (piece: ContentPiece) =>
  (await utils.findCoverImageFilename(piece)) !== null;

export const pieceHasDoc = async (piece: ContentPiece) =>
  (await utils.findDocFilename(piece.diskpath)) !== null;

const __getPieceChildren = async (parent: ContentPiece, idpath: string[]) => {
  const children = [];
  for (const ent of await utils.readDirWithFileTypes(parent.diskpath)) {
    if (utils.isContentPiece(ent)) {
      const childPath = join(parent.diskpath, ent.name);
      const child = await utils.readPieceAtSubdir(childPath, parent.idpath, parent);
      child.idpath = [...idpath, child.id];
      child.parent = parent;
      children.push(child);
    }
  }
  children.sort((a, b) => a.diskpath.localeCompare(b.diskpath));
  return children;
};

export const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const [id, ...rest] = idpath;
  let piece = await utils.readPieceAtSubdir(process.env.COURSE_SUBDIR!, []);
  // Confirm that the root course has the same ID
  if (id != piece.id) {
    throw Error(`The 'id' of the course doesn't match ("${id}" vs "${piece.id})"`);
  }
  if (!rest || rest.length === 0) {
    return piece;
  }
  let currpath = [id];
  for (const rid of rest) {
    let children = await __getPieceChildren(piece, idpath);
    let child = children.find((ch) => ch.id === rid);
    if (!child) {
      return null;
    }
    piece = child;
    currpath.push(rid);
  }
  piece.idpath = idpath;
  return piece;
};

export const getPieceWithChildren = async (idpath: string[]): Promise<ContentPiece | null> => {
  let piece = await getPiece(idpath);
  if (!piece) {
    return null;
  }
  piece.children = await __getPieceChildren(piece, idpath);
  return piece;
};

export const getContentTree = async (idpath: string[], { level = 2 }: { level: number }) => {
  const _getContentTree = async (idpath: string[], level: number) => {
    if (level === 0) {
      return await getPiece(idpath);
    }
    let root = await getPieceWithChildren(idpath);
    if (!root) {
      return null;
    }
    if (root.children) {
      for (let i = 0; i < root.children.length; i++) {
        const childId = root.children[i].id;
        const child = await _getContentTree([...idpath, childId], level - 1);
        root.children[i] = child!;
      }
    }
    return root;
  };

  return await _getContentTree(idpath, level);
};

export const getSessionSequence = async (courseId: string): Promise<string[]> => {
  const course = await getContentTree([courseId], { level: 2 });
  const sessionSequence = [];
  let k = 0;
  for (const part of course?.children || []) {
    for (const session of part.children || []) {
      sessionSequence.push(session.diskpath);
    }
  }
  return sessionSequence;
};

export const pieceNumSlides = async (piece: ContentPiece) => {
  return (await getPieceSlideList(piece))?.length ?? 0;
};

export const getPieceDocument = async (idpath: string[]) => {
  try {
    const chapter = await getPieceWithChildren(idpath);
    if (!chapter) {
      return null;
    }
    let doc = await utils.findDocFilename(chapter.diskpath);
    return doc ? readFile(pathJoin(chapter.diskpath, doc)) : null;
  } catch (e) {
    return null;
  }
};

export const getPieceSlideList = async (piece: ContentPiece) =>
  utils.listPieceSubdir(piece.diskpath, "slides", utils.isSlide);

export const getPieceImageList = async (piece: ContentPiece) =>
  utils.listPieceSubdir(piece.diskpath, "images", utils.isImage);

export const getPieceCoverImageData = async (piece: ContentPiece): Promise<ImgData | null> => {
  const coverFilename = await utils.findCoverImageFilename(piece);
  if (!coverFilename) {
    return null;
  }
  const extension = extname(coverFilename);
  const data = await readFile(coverFilename);
  return { data, extension };
};

export const getPieceFileData = async (
  piece: ContentPiece,
  filename: string,
  filetype: FileTypeEnum
): Promise<Buffer | null> => {
  let searchedFilename = filename;
  if (filetype === "image") {
    searchedFilename = `images/${filename}`;
  } else if (filetype === "slide") {
    searchedFilename = `images/${filename}`;
  }
  const foundFilename = await utils.findFilename(piece.diskpath, (ent) => ent.name === searchedFilename);
  if (!foundFilename) {
    return null;
  }
  return await readFile(join(piece.diskpath, foundFilename));
};

export const getAllIdpaths = async (piece: ContentPiece) => {
  const idpaths: string[][] = [];
  await walkContentPieces(piece, async (piece, _) => {
    if (piece.idpath.length != 2) {
      // except parts for now
      idpaths.push(piece.idpath);
    }
  });
  return idpaths;
};

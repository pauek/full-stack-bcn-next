import { FileTypeEnum } from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import { readFile, readdir } from "fs/promises";
import { join, join as pathJoin } from "path";
import { FileBuffer, WalkFunc } from "../data-backend";
import * as utils from "./utils";

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

export const getPieceDocument = async (piece: ContentPiece): Promise<FileBuffer | null> => {
  try {
    let doc = await utils.findDocFilename(piece.diskpath);
    if (!doc) {
      return null;
    }
    return { name: doc, buffer: await readFile(pathJoin(piece.diskpath, doc)) };
  } catch (e) {
    return null;
  }
};

export const getPieceSlideList = async (piece: ContentPiece) =>
  utils.listPieceSubdir(piece.diskpath, "slides", utils.isSlide);

export const getPieceImageList = async (piece: ContentPiece) =>
  utils.listPieceSubdir(piece.diskpath, "images", utils.isImage);

export const getPieceCoverImageData = async (piece: ContentPiece): Promise<FileBuffer | null> => {
  const coverFilename = await utils.findCoverImageFilename(piece);
  if (!coverFilename) {
    return null;
  }
  const buffer = await readFile(coverFilename);
  return { buffer, name: coverFilename };
};

export const getPieceFileData = async (
  piece: ContentPiece,
  filename: string,
  filetype: FileTypeEnum
): Promise<Buffer | null> => {
  let fulldiskpath: string = "";
  if (filetype === "image") {
    fulldiskpath = join(piece.diskpath, "images", filename);
  } else if (filetype === "slide") {
    fulldiskpath = join(piece.diskpath, "slides", filename);
  } else {
    fulldiskpath = join(piece.diskpath, filename);
  }
  try {
    return await readFile(fulldiskpath);
  } catch (e) {
    console.error(`Error reading ${fulldiskpath}: ${e}`);
    return null;
  }
};

export const walkContentPieces = async (piece: ContentPiece, func: WalkFunc) => {
  const childSubdirs: string[] = [];
  for (const ent of await readdir(piece.diskpath, { withFileTypes: true })) {
    if (utils.isContentPiece(ent)) {
      childSubdirs.push(ent.name);
    }
  }
  childSubdirs.sort();

  const children: any[] = [];
  for (let i = 0; i < childSubdirs.length; i++) {
    const subdir = childSubdirs[i];
    const childSubdir = join(piece.diskpath, subdir);
    const child = await utils.readPieceAtSubdir(childSubdir, [...piece.idpath], piece);
    // Set an index if there was no index in the metadata
    if (!child.metadata.index) {
      child.metadata.index = i;
    }
    children.push(await walkContentPieces(child, func));
  }

  return await func(piece, children);
};

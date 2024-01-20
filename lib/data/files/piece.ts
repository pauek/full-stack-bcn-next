import { ContentPiece } from "@/lib/adt";
import { readFile } from "fs/promises";
import { extname, join, join as pathJoin } from "path";
import { CrumbData, ImgData } from "../data-backend";
import { walkContentPieces } from "./hashes";
import * as utils from "./utils";

export { findCoverImageFilename } from './utils';

export const pieceHasCover = async (piece: ContentPiece) =>
  utils.findCoverImageFilename(piece) != null;

const __getPieceChildren = async (parent: ContentPiece, idpath: string[]) => {
  const children = [];
  for (const ent of await utils.readDirWithFileTypes(parent.diskpath)) {
    if (utils.isContentEntity(ent)) {
      const childPath = join(parent.diskpath, ent.name);
      const child = await utils.readPieceAtSubdir(childPath, parent);
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
  let piece = await utils.readPieceAtSubdir(id);
  if (!rest || rest.length === 0) {
    piece.idpath = [id];
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

export const getBreadcrumbData = async (...idpath: string[]): Promise<CrumbData[]> => {
  const crumbs: CrumbData[] = [];
  const [partPath, sessionPath, chapterPath] = [2, 3, 4].map((n) => idpath.slice(0, n));
  if (partPath.length === 2) {
    const part = await getPieceWithChildren(partPath);
    if (!part) return [];
    crumbs.push({ ...part });
    const sessionSiblings = part.children;
    if (sessionPath.length === 3) {
      const session = await getPieceWithChildren(sessionPath);
      if (!session) return [];
      crumbs.push({ ...session, siblings: sessionSiblings });
      const chapterSiblings = session.children;
      if (chapterPath.length === 4) {
        const chapter = await getPieceWithChildren(idpath);
        if (!chapter) return [];
        crumbs.push({ ...chapter, siblings: chapterSiblings });
      }
    }
  }
  return crumbs;
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

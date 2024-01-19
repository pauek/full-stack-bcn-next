import { ContentPiece } from "@/lib/adt";
import { Dirent } from "fs";
import { readFile, readdir, writeFile } from "fs/promises";
import { basename, extname, join, join as pathJoin } from "path";
import * as utils from "./utils";
import { walkContentPieces } from "./hashes";

if (!process.env.CONTENT_ROOT) {
  throw "No content root!";
}

export const __CONTENT_ROOT = process.env.CONTENT_ROOT!;
export const __METADATA_FILENAME = ".meta.json";

export const readMetadata = async (diskpath: string): Promise<any> => {
  try {
    const metadataPath = pathJoin(diskpath, __METADATA_FILENAME);
    const bytes = await readFile(metadataPath);
    return JSON.parse(bytes.toString());
  } catch (e) {
    return {};
  }
};

export const writeMetadata = async (dir: string, metadata: any) => {
  const json = JSON.stringify(metadata, null, 2);
  const metadataPath = pathJoin(dir, __METADATA_FILENAME);
  await writeFile(metadataPath, json);
};

export const updateMetadata = async (
  diskpath: string,
  func: (metadata: any) => any
) => {
  const metadata = await readMetadata(diskpath);
  func(metadata);
  await writeMetadata(diskpath, metadata);
};

export const readPieceAtDir = async (
  dirpath: string
): Promise<ContentPiece> => {
  const dirname = basename(dirpath);
  const diskpath = pathJoin(__CONTENT_ROOT, dirpath);
  const metadata = await readMetadata(diskpath);
  const name = utils.dirNameToTitle(dirname);
  return { index: 0, diskpath, name, ...metadata /* <-- id is here */ };
};

export const getPiece = async (
  idpath: string[]
): Promise<ContentPiece | null> => {
  const [id, ...rest] = idpath;
  let piece = await readPieceAtDir(id);
  if (!rest || rest.length === 0) {
    piece.idpath = [id];
    return piece;
  }
  let currpath = [id];
  for (const rid of rest) {
    let children = await getPieceChildren(piece.diskpath, idpath);
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

export const getPieceChildren = async (diskpath: string, idpath: string[]) => {
  const children = [];
  for (const ent of await utils.readDirWithFileTypes(diskpath)) {
    if (utils.isContentEntity(ent)) {
      const childPath = join(diskpath, ent.name);
      const child = await readPieceAtDir(childPath);
      child.idpath = [...idpath, child.id];
      children.push(child);
    }
  }
  children.sort((a, b) => a.diskpath.localeCompare(b.diskpath));
  return children;
};

export const getPieceWithChildren = async (
  idpath: string[]
): Promise<ContentPiece | null> => {
  let piece = await getPiece(idpath);
  if (!piece) {
    return null;
  }
  piece.children = await getPieceChildren(piece.diskpath, idpath);
  return piece;
};

const __readRootPiece = async (id: string) => readPieceAtDir(id);

const __getRootPieceWithChildren = async (
  id: string
): Promise<ContentPiece | null> => {
  const piece = await __readRootPiece(id);
  piece.children = await getPieceChildren(piece.diskpath, [id]);
  return piece;
};

export const getContentTree = async (idpath: string[], level: number = 2) => {
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

export const getSessionSequence = async (
  courseId: string
): Promise<string[]> => {
  const course = await getContentTree([courseId], 2);
  const sessionSequence = [];
  let k = 0;
  for (const part of course?.children || []) {
    for (const session of part.children || []) {
      sessionSequence.push(session.diskpath);
    }
  }
  return sessionSequence;
};

export const pieceDocFilename = async (piece: ContentPiece) => {
  for (const ent of await utils.readDirWithFileTypes(piece.diskpath)) {
    if (ent.isFile() && ent.name.startsWith("doc.")) {
      return ent.name;
    }
  }
  return null;
};

export const pieceHasDoc = async (piece: ContentPiece) => {
  return (await pieceDocFilename(piece)) != null;
};

export const pieceNumSlides = async (piece: ContentPiece) => {
  return (await getPieceSlideList(piece))?.length ?? 0;
};

export const getPieceDocument = async (path: string[]) => {
  try {
    const chapter = await getPieceWithChildren(path);
    if (!chapter) {
      return null;
    }
    let doc = await pieceDocFilename(chapter);
    return doc ? readFile(pathJoin(chapter.diskpath, doc)) : null;
  } catch (e) {
    return null;
  }
};

type __FilePred = (ent: Dirent) => boolean;

const __listPieceSubdir = async (
  piece: ContentPiece,
  subdir: string,
  predicateFn: __FilePred
): Promise<Array<string> | null> => {
  try {
    const dirpath = pathJoin(piece.diskpath, subdir);
    const files: string[] = [];
    for (const ent of await readdir(dirpath, { withFileTypes: true })) {
      if (predicateFn(ent)) {
        files.push(ent.name);
      }
    }
    return files;
  } catch (e) {
    return null;
  }
};

export const getPieceSlideList = async (piece: ContentPiece) =>
  __listPieceSubdir(piece, "slides", utils.isSlide);

export const getPieceImageList = async (piece: ContentPiece) =>
  __listPieceSubdir(piece, "images", utils.isImage);

export const getPieceCoverImageFilename = async (piece: ContentPiece) => {
  for (const ent of await readdir(piece.diskpath, { withFileTypes: true })) {
    if (ent.isFile() && ent.name.startsWith("cover.")) {
      return join(piece.diskpath, ent.name);
    }
  }
  return null;
};

export const getPieceCoverImageData = async (piece: ContentPiece) => {
  const coverFilename = await getPieceCoverImageFilename(piece);
  if (!coverFilename) {
    return null;
  }
  const extension = extname(coverFilename);
  const data = await readFile(coverFilename);
  return { data, extension };
};

export type CrumbData = {
  name: string;
  idpath: string[];
  siblings?: Array<CrumbData>;
};

export const getBreadcrumbData = async (
  ...idpath: string[]
): Promise<CrumbData[]> => {
  // TODO: simplify getBreadcrumbs
  const crumbs: CrumbData[] = [];

  const [courseId, partId, sessionId, chapterId] = idpath;
  if (partId) {
    const part = await getPieceWithChildren([courseId, partId]);
    if (!part) return [];
    crumbs.push({ name: part.name, idpath: [partId] });
    const sessionSiblings =
      part.children?.map((s) => ({
        name: s.name,
        idpath: [courseId, partId, s.id],
      })) ?? [];
    if (sessionId) {
      const session = await getPieceWithChildren([courseId, partId, sessionId]);
      if (!session) return [];
      crumbs.push({
        name: session.name,
        idpath: [courseId, partId, sessionId],
        siblings: sessionSiblings,
      });
      const chapterSiblings =
        session.children?.map((ch) => ({
          name: ch.name,
          idpath: [courseId, partId, sessionId, ch.id],
        })) ?? [];
      if (chapterId) {
        const chapter = await getPieceWithChildren([
          courseId,
          partId,
          sessionId,
          chapterId,
        ]);
        if (!chapter) return [];
        crumbs.push({
          name: chapter.name,
          idpath: [courseId, partId, sessionId, chapterId],
          siblings: chapterSiblings,
        });
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

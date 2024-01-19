import { ContentPiece } from "@/lib/adt";
import { Dirent } from "fs";
import { readFile, writeFile } from "fs/promises";
import { basename, extname, join, join as pathJoin } from "path";
import { HASH_FILE, walkContentPieces } from "./hashes";
import * as utils from "./utils";

if (!process.env.CONTENT_ROOT) {
  throw "No content root!";
}

export const __CONTENT_ROOT = process.env.CONTENT_ROOT!;
export const __METADATA_FILENAME = ".meta.json";

export const pieceDocFilename = async (diskpath: string) => {
  for (const ent of await utils.readDirWithFileTypes(diskpath)) {
    if (ent.isFile() && ent.name.startsWith("doc.")) {
      return ent.name;
    }
  }
  return null;
};

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

export const readPieceAtSubdir = async (
  subdir: string,
  parent: ContentPiece | null = null,
): Promise<ContentPiece> => {
  const dirname = basename(subdir);
  const diskpath = pathJoin(__CONTENT_ROOT, subdir);
  const metadata = await readMetadata(diskpath);
  const name = utils.dirNameToTitle(dirname);
  let hash: string = "";
  try {
    hash = (await readFile(join(diskpath, HASH_FILE))).toString();
  } catch (e) {
    console.error(diskpath, `ERROR: Hash not found! ${e}`);
  }
  return {
    name,
    diskpath,
    hash,
    parent,
    index: 0,
    ...metadata, // <-- id
    hasDoc: (await pieceDocFilename(diskpath)) != null,
    numSlides: (await __listPieceSubdir(diskpath, "slides", utils.isSlide))?.length ?? 0,
  };
};

const __getPieceChildren = async (parent: ContentPiece, idpath: string[]) => {
  const children = [];
  for (const ent of await utils.readDirWithFileTypes(parent.diskpath)) {
    if (utils.isContentEntity(ent)) {
      const childPath = join(parent.diskpath, ent.name);
      const child = await readPieceAtSubdir(childPath, parent);
      child.idpath = [...idpath, child.id];
      child.parent = parent;
      children.push(child);
    }
  }
  children.sort((a, b) => a.diskpath.localeCompare(b.diskpath));
  return children;
};

export const getPiece = async (
  idpath: string[]
): Promise<ContentPiece | null> => {
  const [id, ...rest] = idpath;
  let piece = await readPieceAtSubdir(id);
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

export const getPieceWithChildren = async (
  idpath: string[]
): Promise<ContentPiece | null> => {
  let piece = await getPiece(idpath);
  if (!piece) {
    return null;
  }
  piece.children = await __getPieceChildren(piece, idpath);
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

export const pieceNumSlides = async (piece: ContentPiece) => {
  return (await getPieceSlideList(piece))?.length ?? 0;
};

export const getPieceDocument = async (idpath: string[]) => {
  try {
    const chapter = await getPieceWithChildren(idpath);
    if (!chapter) {
      return null;
    }
    let doc = await pieceDocFilename(chapter.diskpath);
    return doc ? readFile(pathJoin(chapter.diskpath, doc)) : null;
  } catch (e) {
    return null;
  }
};

type __FilePred = (ent: Dirent) => boolean;

const __listPieceSubdir = async (
  diskpath: string,
  subdir: string,
  predicateFn: __FilePred
): Promise<Array<string> | null> => {
  try {
    const dirpath = pathJoin(diskpath, subdir);
    const files: string[] = [];
    for (const ent of await utils.readDirWithFileTypes(dirpath)) {
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
  __listPieceSubdir(piece.diskpath, "slides", utils.isSlide);

export const getPieceImageList = async (piece: ContentPiece) =>
  __listPieceSubdir(piece.diskpath, "images", utils.isImage);

export const getPieceCoverImageFilename = async (piece: ContentPiece) => {
  for (const ent of await utils.readDirWithFileTypes(piece.diskpath)) {
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
  const [partPath, sessionPath, chapterPath] = [2, 3, 4].map((n) =>
    idpath.slice(0, n)
  );
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

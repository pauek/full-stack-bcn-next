import { Chapter, ContentPiece } from "@/lib/adt";
import { Dirent } from "fs";
import { readFile, readdir, writeFile } from "fs/promises";
import { basename, extname, join, join as pathJoin } from "path";
import * as utils from "./utils";

const { CONTENT_ROOT } = process.env;
if (!CONTENT_ROOT) {
  throw "No content root!";
}
const METADATA_FILENAME = ".meta.json";

export const readMetadata = async (dir: string): Promise<any> => {
  try {
    const metadataPath = pathJoin(dir, METADATA_FILENAME);
    const bytes = await readFile(metadataPath);
    return JSON.parse(bytes.toString());
  } catch (e) {
    return {};
  }
};

export const writeMetadata = async (dir: string, metadata: any) => {
  const json = JSON.stringify(metadata, null, 2);
  const metadataPath = pathJoin(dir, METADATA_FILENAME);
  await writeFile(metadataPath, json);
};

const readPieceAtDir = async (dirpath: string): Promise<ContentPiece> => {
  const dirname = basename(dirpath);
  const diskpath = pathJoin(CONTENT_ROOT, dirpath);
  const metadata = await readMetadata(diskpath);
  const name = utils.dirNameToTitle(dirname);
  return { index: 0, diskpath, name, ...metadata /* <-- id is here */ };
};

const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const [id, ...rest] = idpath;
  let piece = await readPieceAtDir(id);
  if (!rest || rest.length === 0) {
    piece.path = [id];
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
  piece.path = idpath;
  return piece;
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

const readRootPiece = async (id: string) => readPieceAtDir(id);

const getRootPieceWithChildren = async (
  id: string
): Promise<ContentPiece | null> => {
  const piece = await readRootPiece(id);
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

export const enumerateSessions = async (
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

export const getPieceChildren = async (diskpath: string, idpath: string[]) => {
  const children = [];
  for (const ent of await utils.readDirWithFileTypes(diskpath)) {
    if (utils.isContentEntity(ent)) {
      const childPath = join(diskpath, ent.name);
      const child = await readPieceAtDir(childPath);
      child.path = [...idpath, child.id];
      children.push(child);
    }
  }
  children.sort((a, b) => a.diskpath.localeCompare(b.diskpath));
  return children;
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
  return (await getSlideList(piece))?.length ?? 0;
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

type FilePredicateFunction = (ent: Dirent) => boolean;

const listPieceSubdir = async (
  chapter: ContentPiece,
  subdir: string,
  predicateFn: FilePredicateFunction
): Promise<Array<string> | null> => {
  try {
    const dirpath = pathJoin(chapter.diskpath, subdir);
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

export const getSlideList = async (piece: ContentPiece) =>
  listPieceSubdir(piece, "slides", utils.isSlide);

export const getImageList = async (piece: ContentPiece) =>
  listPieceSubdir(piece, "images", utils.isImage);

export const getPieceCoverImage = async (piece: ContentPiece) => {
  for (const ent of await readdir(piece.diskpath, { withFileTypes: true })) {
    if (ent.isFile() && ent.name.startsWith("cover.")) {
      const imagePath = join(piece.diskpath, ent.name);
      const extension = extname(ent.name);
      const data = await readFile(imagePath);
      return { data, extension };
    }
  }
  return null;
};

export const getAllFilePaths = async (
  id0: string,
  subdir: string,
  extensions: string[]
) => {
  // TODO: simplify getAllFilePaths
  const filePaths = [];

  const isMatch = (filename: string) => {
    for (const ext of extensions) {
      if (filename.endsWith(ext)) {
        return true;
      }
    }
    return false;
  };

  const course = await getRootPieceWithChildren(id0);
  if (course === null) {
    console.error(`Course "fullstack" not found!?!`);
    return;
  }
  for (const { id: id1 } of course.children || []) {
    const part = await getPieceWithChildren([id0, id1]);
    if (part === null) {
      console.error(`Part "${[id1].join("/")}" not found!?!`);
      continue;
    }
    for (const { id: id2 } of part.children || []) {
      const session = await getPieceWithChildren([id0, id1, id2]);
      if (session === null) {
        console.error(`Session "${[id0, id1, id2].join("/")}" not found!?!`);
        continue;
      }
      for (const { id: id3 } of session.children || []) {
        const chapter = await getPieceWithChildren([id0, id1, id2, id3]);
        if (chapter === null) {
          console.error(
            `Chapter "${[id0, id1, id2, id3].join("/")}" not found!?!`
          );
          continue;
        }
        const imageDir = pathJoin(chapter.diskpath, subdir);
        try {
          for (const ent of await utils.readDirWithFileTypes(imageDir)) {
            if (ent.isFile() && isMatch(ent.name)) {
              filePaths.push(pathJoin(id0, id1, id2, id3, subdir, ent.name));
            }
          }
        } catch (e) {
          // If directory doesn't exist, do nothing...
        }
      }
    }
  }
  return filePaths;
};

export type CrumbData = {
  name: string;
  path: string[];
  siblings?: Array<CrumbData>;
};

export const getBreadcrumbData = async (
  ...path: string[]
): Promise<CrumbData[]> => {
  // TODO: simplify getBreadcrumbs
  const crumbs: CrumbData[] = [];
  let siblings: Array<CrumbData> = [];

  const [courseId, partId, sessionId, chapterId] = path;
  if (partId) {
    const part = await getPieceWithChildren([courseId, partId]);
    if (!part) return [];
    crumbs.push({ name: part.name, path: [partId] });
    siblings =
      part.children?.map((s) => ({
        name: s.name,
        path: [courseId, partId, s.id],
      })) ?? [];
    if (sessionId) {
      const session = await getPieceWithChildren([courseId, partId, sessionId]);
      if (!session) return [];
      crumbs.push({
        name: session.name,
        path: [courseId, partId, sessionId],
        siblings,
      });
      siblings =
        session.children?.map((ch) => ({
          name: ch.name,
          path: [courseId, partId, sessionId, ch.id],
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
          path: [courseId, partId, sessionId, chapterId],
          siblings,
        });
      }
    }
  }
  return crumbs;
};

export const getAllSessionPaths = async (courseId: string) => {
  const sessionPaths = [];
  const course = await getRootPieceWithChildren(courseId);
  if (course === null) {
    return [];
  }
  for (const part of course.children || []) {
    for (const session of await getPieceChildren(part.diskpath, [courseId])) {
      sessionPaths.push({
        courseId,
        partId: part.id,
        sessionId: session.id,
      });
    }
  }
  return sessionPaths;
};

type PieceWalkFunction = (p: ContentPiece, idpath: string[]) => Promise<any>;

const walkAllChapterPaths =
  (func: PieceWalkFunction) => async (courseId: string) => {
    const course = await getRootPieceWithChildren(courseId);
    if (course === null) {
      return [];
    }
    const result = [];
    for (const _part of course.children || []) {
      const part = await getPieceWithChildren([courseId, _part.id]);
      if (part == null) {
        continue;
      }
      for (const _session of part.children || []) {
        const session = await getPieceWithChildren([
          courseId,
          _part.id,
          _session.id,
        ]);
        if (session === null) {
          continue;
        }
        for (const _chapter of session.children || []) {
          const ret = await func(_chapter, [
            courseId,
            part.id,
            session.id,
            _chapter.id,
          ]);
          if (Array.isArray(ret)) {
            result.push(...ret);
          } else {
            result.push(ret);
          }
        }
      }
    }
    return result;
  };

export const getAllChapterPaths = walkAllChapterPaths(
  async (_, path) => path
);

export const generateAllChapterParams = walkAllChapterPaths(
  async (_, path) => ({
    courseId: path[0],
    partId: path[1],
    sessionId: path[2],
    chapterId: path[3],
  })
);

const getAllSubdirParams = (subdir: string) =>
  walkAllChapterPaths(
    async (chapter, [courseId, partId, sessionId, chapterId]) => {
      const imageList = await utils.readDirWithFileTypes(
        pathJoin(chapter.diskpath, subdir)
      );
      return imageList.map((ent) => ({
        courseId,
        partId,
        sessionId,
        chapterId,
        filename: ent.name,
      }));
    }
  );

export const getAllImageParams = getAllSubdirParams("images");
export const getAllSlideParams = getAllSubdirParams("slides");

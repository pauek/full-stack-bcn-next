import { Chapter, ContentPiece } from "@/lib/adt";
import { Dirent } from "fs";
import { readFile, readdir, writeFile } from "fs/promises";
import { basename, join, join as pathJoin } from "path";
import * as utils from "./utils";

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

const { CONTENT_ROOT } = process.env;
if (!CONTENT_ROOT) {
  throw "No content root!";
}

const getPieceAtDir = async (dirpath: string): Promise<ContentPiece> => {
  const dirname = basename(dirpath);
  const diskpath = pathJoin(CONTENT_ROOT, dirpath);
  const metadata = await readMetadata(diskpath);
  const name = utils.dirNameToTitle(dirname);
  return { index: 0, diskpath, name, ...metadata /* <-- id is here */ };
};

const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const [id, ...rest] = idpath;
  let piece = await getPieceAtDir(id);
  if (!rest || rest.length === 0) {
    piece.path = [id];
    return piece;
  }
  let currpath = [id];
  for (const rid of rest) {
    let children = await getChildren(piece.diskpath);
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
  piece.children = await getChildren(piece.diskpath);
  return piece;
};

const getRootPiece = async (id: string) => getPieceAtDir(id);

const getRootPieceWithChildren = async (
  id: string
): Promise<ContentPiece | null> => {
  const piece = await getRootPiece(id);
  piece.children = await getChildren(piece.diskpath);
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

export const getChildren = async (diskpath: string) => {
  const children = [];
  for (const ent of await utils.readDirWithFileTypes(diskpath)) {
    if (utils.isContentEntity(ent)) {
      const childPath = join(diskpath, ent.name);
      children.push(await getPieceAtDir(childPath));
    }
  }
  children.sort((a, b) => a.diskpath.localeCompare(b.diskpath));
  return children;
};

export const getDoc = async (chapter: ContentPiece) => {
  for (const ent of await utils.readDirWithFileTypes(chapter.diskpath)) {
    if (ent.isFile() && ent.name.startsWith("doc.")) {
      return ent.name;
    }
  }
  return null;
};

export const pieceHasDoc = async (piece: ContentPiece) => {
  return (await getDoc(piece)) != null;
};

export const pieceNumSlides = async (piece: ContentPiece) => {
  return (await getSlideList(piece))?.length ?? 0;
};

export const getChapterDoc = async (path: string[]) => {
  try {
    const chapter = await getPieceWithChildren(path);
    if (!chapter) {
      return null;
    }
    let doc = await getDoc(chapter);
    return doc ? readFile(pathJoin(chapter.diskpath, doc)) : null;
  } catch (e) {
    return null;
  }
};

export const getChapterImage = async (
  path: string[],
  imgName: string
): Promise<Buffer | null> => {
  try {
    const chapter = await getPieceWithChildren(path);
    if (!chapter) {
      return null;
    }
    const imgPath = pathJoin(chapter.diskpath, "images", imgName);
    return readFile(imgPath);
  } catch (e) {
    return null;
  }
};

type FilePredicate = (ent: Dirent) => boolean;

export const getSubdirList = async (
  chapter: ContentPiece,
  subdir: string,
  filePred: FilePredicate
): Promise<Array<string> | null> => {
  try {
    const dirpath = pathJoin(chapter.diskpath, subdir);
    const files: string[] = [];
    for (const ent of await readdir(dirpath, { withFileTypes: true })) {
      if (filePred(ent)) {
        files.push(ent.name);
      }
    }
    return files;
  } catch (e) {
    return null;
  }
};

export const getSlideList = async (chapter: ContentPiece) =>
  getSubdirList(chapter, "slides", utils.isSlide);

export const getImageList = async (chapter: Chapter) =>
  getSubdirList(chapter, "images", utils.isImage);

export const getChapterSlide = async (
  path: string[],
  imgName: string
): Promise<Buffer | null> => {
  const chapter = await getPieceWithChildren(path);
  if (!chapter) {
    return null;
  }
  const slides = pathJoin(chapter.diskpath, "slides");
  return readFile(pathJoin(slides, imgName));
};

export const getAllFilePaths = async (
  id0: string,
  subdir: string,
  extensions: string[]
) => {
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

export const getBreadcrumbs = async (
  ...path: string[]
): Promise<CrumbData[]> => {
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
    for (const session of await getChildren(part.diskpath)) {
      sessionPaths.push({
        courseId,
        partId: part.id,
        sessionId: session.id,
      });
    }
  }
  return sessionPaths;
};

type ChapterWalkFunction = (ch: ContentPiece, path: string[]) => Promise<any>;

export const walkAllChapterPaths =
  (func: ChapterWalkFunction) => async (courseId: string) => {
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

export const generateAllChapterPaths = walkAllChapterPaths(
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

const generateAllSubdirParams = (subdir: string) =>
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

export const generateAllImageParams = generateAllSubdirParams("images");
export const generateAllSlideParams = generateAllSubdirParams("slides");

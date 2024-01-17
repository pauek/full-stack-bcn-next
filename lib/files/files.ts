import { Chapter, ContentPiece, Course } from "@/lib/adt";
import { Dirent } from "fs";
import { readFile, readdir } from "fs/promises";
import { join as pathJoin } from "path";
import * as utils from "./utils";

const METADATA_FILENAME = ".meta.json";

const _readMetadata = async (dir: string) => {
  try {
    const metadataPath = pathJoin(dir, METADATA_FILENAME);
    const bytes = await readFile(metadataPath);
    return JSON.parse(bytes.toString());
  } catch (e) {
    return {};
  }
};

const { CONTENT_ROOT } = process.env;
if (!CONTENT_ROOT) {
  throw "No content root!";
}

const getRootContentPiece = async (
  id: string
): Promise<ContentPiece | null> => {
  const path = pathJoin(CONTENT_ROOT, id);
  const metadata = await _readMetadata(path);
  const children = await getChildren(path);
  console.log(children);
  return { type: "root", id, path, children, ...metadata };
};

export const getContentPiece = async (
  path: string[]
): Promise<ContentPiece | null> => {
  const [id, ...rest] = path;
  let piece: ContentPiece | null = await getRootContentPiece(id);
  if (!piece) {
    return null;
  }
  while (rest.length > 0) {
    const [id] = rest;
    let children: ContentPiece[] | undefined = piece.children;
    if (!children) {
      children = await getChildren(piece.path);
    }
    piece = children.find((ch) => ch.id === id) || null;
    if (!piece) {
      return null;
    }
    rest.splice(0, 1);
  }
  piece.children = await getChildren(piece.path);
  return piece;
};

export const getChildren = async (dirpath: string) => {
  const children = [];
  for (const ent of await utils.readDirWithFileTypes(dirpath)) {
    if (utils.isContentEntity(ent)) {
      const path = pathJoin(dirpath, ent.name);
      const metadata = await _readMetadata(path);
      children.push({
        path: path,
        name: utils.dirNameToTitle(ent.name),
        ...metadata,
      });
    }
  }
  return children;
};

export const getSessionChapters = async (sessionPath: string) => {
  const chapters = [];
  for (const ent of await utils.readDirWithFileTypes(sessionPath)) {
    if (utils.isContentEntity(ent)) {
      const path = pathJoin(sessionPath, ent.name);
      const metadata = await _readMetadata(path);
      chapters.push({
        path,
        name: utils.dirNameToTitle(ent.name),
        ...metadata,
      });
    }
  }
  return chapters;
};

export const getDoc = async (chapter: ContentPiece) => {
  for (const ent of await utils.readDirWithFileTypes(chapter.path)) {
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
    const chapter = await getContentPiece(path);
    if (!chapter) {
      return null;
    }
    let doc = await getDoc(chapter);
    return doc ? readFile(pathJoin(chapter.path, doc)) : null;
  } catch (e) {
    return null;
  }
};

export const getChapterImage = async (
  path: string[],
  imgName: string
): Promise<Buffer | null> => {
  try {
    const chapter = await getContentPiece(path);
    if (!chapter) {
      return null;
    }
    const imgPath = pathJoin(chapter.path, "images", imgName);
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
    const dirpath = pathJoin(chapter.path, subdir);
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
  const chapter = await getContentPiece(path);
  if (!chapter) {
    return null;
  }
  const slides = pathJoin(chapter.path, "slides");
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

  const course = await getRootContentPiece(id0);
  if (course === null) {
    console.error(`Course "fullstack" not found!?!`);
    return;
  }
  for (const { id: id1 } of course.children || []) {
    const part = await getContentPiece([id0, id1]);
    if (part === null) {
      console.error(`Part "${[id1].join("/")}" not found!?!`);
      continue;
    }
    for (const { id: id2 } of part.children || []) {
      const session = await getContentPiece([id0, id1, id2]);
      if (session === null) {
        console.error(`Session "${[id0, id1, id2].join("/")}" not found!?!`);
        continue;
      }
      for (const { id: id3 } of session.children || []) {
        const chapter = await getContentPiece([id0, id1, id2, id3]);
        if (chapter === null) {
          console.error(
            `Chapter "${[id0, id1, id2, id3].join("/")}" not found!?!`
          );
          continue;
        }
        const imageDir = pathJoin(chapter.path, subdir);
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
    const part = await getContentPiece([courseId, partId]);
    if (!part) return [];
    crumbs.push({ name: part.name, path: [partId] });
    siblings =
      part.children?.map((s) => ({
        name: s.name,
        path: [courseId, partId, s.id],
      })) ?? [];
    if (sessionId) {
      const session = await getContentPiece([courseId, partId, sessionId]);
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
        const chapter = await getContentPiece([
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
  const course = await getRootContentPiece(courseId);
  if (course === null) {
    return [];
  }
  for (const part of course.children || []) {
    for (const session of await getChildren(part.path)) {
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
    const course = await getRootContentPiece(courseId);
    if (course === null) {
      return [];
    }
    const result = [];
    for (const _part of course.children || []) {
      const part = await getContentPiece([courseId, _part.id]);
      if (part == null) {
        continue;
      }
      for (const _session of part.children || []) {
        const session = await getContentPiece([courseId, _part.id, _session.id]);
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
        pathJoin(chapter.path, subdir)
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

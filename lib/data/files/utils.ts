import { FileType } from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import { env } from "@/lib/env.mjs";
import { Dirent } from "fs";
import { readdir } from "fs/promises";
import { basename, extname, join } from "path";
import { FileReference } from "../data-backend";
import { hashFile } from "../hashing";
import { readStoredHashOrThrow } from "./hashes";
import { readMetadata } from "./metadata";

export const readDirWithFileTypes = (path: string) => readdir(path, { withFileTypes: true });

export const dirNameToTitle = (dirName: string) => {
  const firstSpace = dirName.indexOf(" ");
  return firstSpace !== -1 ? dirName.slice(firstSpace + 1) : dirName;
};

const rPieceDirectory = /^[0-9X]{2} .+$/;

const imageExtensions = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".avif"];

const isMarkdown = (filename: string) => [".md", ".mdx"].includes(extname(filename));

export const isContentPiece = (ent: Dirent) => ent.isDirectory() && ent.name.match(rPieceDirectory);
export const isDoc = (ent: Dirent) =>
  ent.isFile() && ent.name.startsWith("doc.") && isMarkdown(ent.name);
export const isCover = (ent: Dirent) => ent.isFile() && ent.name.startsWith("cover.");
export const isSlide = (ent: Dirent) => ent.isFile() && extname(ent.name) === ".svg";
export const isImage = (ent: Dirent) => ent.isFile() && imageExtensions.includes(extname(ent.name));
export const isExercise = (ent: Dirent) => ent.isFile() && isMarkdown(ent.name);
export const isQuiz = (ent: Dirent) => ent.isFile() && isMarkdown(ent.name);

type FileTypeInfo = {
  subdir: string;
  predicate: (ent: Dirent) => boolean;
};

export const fileTypeInfo: Record<FileType, FileTypeInfo> = {
  doc: { predicate: isDoc, subdir: "" },
  cover: { predicate: isCover, subdir: "" },
  slide: { predicate: isSlide, subdir: "slides" },
  image: { predicate: isImage, subdir: "images" },
  exercise: { predicate: isExercise, subdir: "exercises" },
  quiz: { predicate: isQuiz, subdir: "quiz" },
  video: { predicate: () => false, subdir: "<none>" },
  other: { predicate: () => false, subdir: "" },
};

export const determineFiletype = (ent: Dirent): FileType => {
  if (isImage(ent)) {
    return FileType.image;
  } else if (isSlide(ent)) {
    return FileType.slide;
  } else if (isDoc(ent)) {
    return FileType.doc;
  } else if (isCover(ent)) {
    return FileType.cover;
  } else {
    return FileType.other;
  }
};

export type FilePred = (ent: Dirent) => boolean;

export const findFilename = async (diskpath: string, func: FilePred) => {
  for (const ent of await readDirWithFileTypes(diskpath)) {
    if (ent.isFile() && func(ent)) {
      return ent.name;
    }
  }
  return null;
};

export const findDocFilename = async (diskpath: string) =>
  findFilename(diskpath, (ent) => ent.name.startsWith("doc."));

export const findCoverImageFilename = async ({ diskpath }: ContentPiece) => {
  const filename = await findFilename(diskpath, (ent) => ent.name.startsWith("cover."));
  return filename ? join(diskpath, filename) : null;
};

export const listPieceSubdir = async (
  diskpath: string,
  filetype: FileType
): Promise<Array<FileReference>> => {
  try {
    const typeInfo = fileTypeInfo[filetype];
    const abspath = join(diskpath, typeInfo.subdir);
    const files: FileReference[] = [];
    for (const ent of await readDirWithFileTypes(abspath)) {
      if (typeInfo.predicate(ent)) {
        const filename = ent.name;
        const hash = await hashFile(join(abspath, filename));
        files.push({ filename, hash, filetype });
      }
    }
    files.sort((a, b) => a.filename.localeCompare(b.filename));
    return files;
  } catch (e) {
    return [];
  }
};

// HACK: Let's make sure we don't skip hashing except in 'bun files:hashes'!
export let _okToSkipMissingHashes = false;
export const okToSkipMissingHashes = async (func: (...args: any[]) => Promise<any>) => {
  _okToSkipMissingHashes = true;
  await func();
  _okToSkipMissingHashes = false;
};

export const readPieceAtSubdir = async (
  subdir: string,
  parentIdpath: string[]
): Promise<ContentPiece> => {
  const dirname = basename(subdir);
  const name = dirNameToTitle(dirname);
  const diskpath = join(env.CONTENT_ROOT, subdir);
  const metadata = await readMetadata(diskpath);

  let hash: string = "";
  try {
    hash = await readStoredHashOrThrow(diskpath);
  } catch (e) {
    if (_okToSkipMissingHashes) {
      console.info(`warning: missing hash for ${diskpath}`);
    } else {
      throw e;
    }
  }

  const { id } = metadata;
  if (!id) {
    throw Error(`Missing id from ContentPiece at ${diskpath}!`);
  }
  const idpath = [...parentIdpath, id];
  return {
    id,
    name,
    idpath,
    diskpath,
    hash,
    metadata,
  };
};

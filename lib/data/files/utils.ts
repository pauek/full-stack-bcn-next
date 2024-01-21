import { ContentPiece } from "@/lib/adt";
import { Dirent } from "fs";
import { readFile, readdir } from "fs/promises";
import { basename, extname, join } from "path";
import { HASH_FILE, __CONTENT_ROOT } from ".";
import { readMetadata } from "./metadata";
import { FileTypeEnum } from "@/data/schema";

export const readDirWithFileTypes = (path: string) => readdir(path, { withFileTypes: true });

export const dirNameToTitle = (dirName: string) => {
  const firstSpace = dirName.indexOf(" ");
  return firstSpace !== -1 ? dirName.slice(firstSpace + 1) : dirName;
};

const rPieceDirectory = /^[0-9X]{2} .+$/;

const imageExtensions = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".avif"];

export const isContentPiece = (ent: Dirent) => ent.isDirectory() && ent.name.match(rPieceDirectory);
export const isDoc = (ent: Dirent) => ent.isFile() && ent.name.startsWith("doc.");
export const isCover = (ent: Dirent) => ent.isFile() && ent.name.startsWith("cover.");
export const isSlide = (ent: Dirent) => ent.isFile() && extname(ent.name) === ".svg";
export const isImage = (ent: Dirent) => ent.isFile() && imageExtensions.includes(extname(ent.name));

export const determineFiletype = (ent: Dirent): FileTypeEnum => {
  if (isImage(ent)) {
    return "image";
  } else if (isSlide(ent)) {
    return "slide";
  } else if (isDoc(ent)) {
    return "doc";
  } else if (isCover(ent)) {
    return "cover";
  } else {
    return "other";
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
  subdir: string,
  predicateFn: FilePred
): Promise<Array<string> | null> => {
  try {
    const dirpath = join(diskpath, subdir);
    const files: string[] = [];
    for (const ent of await readDirWithFileTypes(dirpath)) {
      if (predicateFn(ent)) {
        files.push(ent.name);
      }
    }
    return files;
  } catch (e) {
    return null;
  }
};

export const readPieceAtSubdir = async (
  subdir: string,
  parentIdpath: string[],
  parent?: ContentPiece
): Promise<ContentPiece> => {
  const dirname = basename(subdir);
  const diskpath = join(__CONTENT_ROOT, subdir);
  const metadata = await readMetadata(diskpath);
  const name = dirNameToTitle(dirname);
  let hash: string = "";
  try {
    hash = (await readFile(join(diskpath, HASH_FILE))).toString();
  } catch (e) {
    console.error(diskpath, `ERROR: Hash not found! ${e}`);
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

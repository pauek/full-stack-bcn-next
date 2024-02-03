import { FileTypeEnum } from "@/data/schema";
import { ContentPiece } from "@/lib/adt";
import { CONTENT_ROOT } from "@/lib/env";
import { Dirent } from "fs";
import { readdir } from "fs/promises";
import { basename, extname, join } from "path";
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

export const isContentPiece = (ent: Dirent) => ent.isDirectory() && ent.name.match(rPieceDirectory);
export const isDoc = (ent: Dirent) => ent.isFile() && ent.name.startsWith("doc.");
export const isCover = (ent: Dirent) => ent.isFile() && ent.name.startsWith("cover.");
export const isSlide = (ent: Dirent) => ent.isFile() && extname(ent.name) === ".svg";
export const isImage = (ent: Dirent) => ent.isFile() && imageExtensions.includes(extname(ent.name));

type FileTypeInfo = {
  subdir: string;
  predicate: (ent: Dirent) => boolean;
};

export const fileTypeInfo: Record<FileTypeEnum, FileTypeInfo> = {
  doc: { predicate: isDoc, subdir: "" },
  cover: { predicate: isCover, subdir: "" },
  slide: { predicate: isSlide, subdir: "slides" },
  image: { predicate: isImage, subdir: "images" },
  other: { predicate: () => false, subdir: "" },
};

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
  filetype: FileTypeEnum
): Promise<Array<{ name: string; hash: string }>> => {
  try {
    const dirpath = join(diskpath, subdir);
    const files: { name: string; hash: string }[] = [];
    for (const ent of await readDirWithFileTypes(dirpath)) {
      const { predicate } = fileTypeInfo[filetype];
      if (predicate(ent)) {
        files.push({ name: ent.name, hash: await hashFile(join(dirpath, ent.name)) });
      }
    }
    files.sort((a, b) => a.name.localeCompare(b.name));
    return files;
  } catch (e) {
    return [];
  }
};

export const readPieceAtSubdir = async (
  subdir: string,
  parentIdpath: string[]
): Promise<ContentPiece> => {
  const dirname = basename(subdir);
  const name = dirNameToTitle(dirname);
  const diskpath = join(CONTENT_ROOT, subdir);
  const metadata = await readMetadata(diskpath);
  const hash = await readStoredHashOrThrow(diskpath);
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

import { ContentPiece } from "@/lib/adt";
import { Dirent } from "fs";
import { readFile, readdir } from "fs/promises";
import { basename, extname, join } from "path";
import { readMetadata } from "./metadata";
import { HASH_FILE, __CONTENT_ROOT } from ".";

export const readDirWithFileTypes = (path: string) => readdir(path, { withFileTypes: true });

export const dirNameToTitle = (dirName: string) => {
  const firstSpace = dirName.indexOf(" ");
  return firstSpace !== -1 ? dirName.slice(firstSpace + 1) : dirName;
};

const rPieceDirectory = /^[0-9X]{2} .+$/;

export const isContentPiece = (ent: Dirent) => ent.isDirectory() && ent.name.match(rPieceDirectory);

export const isSlide = (ent: Dirent) => ent.isFile() && ent.name.endsWith(".svg");

const imgExts = [".png", ".jpg", ".jpeg", ".svg", ".webp", ".avif"];

export const isImage = (ent: Dirent) => ent.isFile() && imgExts.includes(extname(ent.name));

export type FilePred = (ent: Dirent) => boolean;

const findFilename = async (diskpath: string, func: FilePred) => {
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
  parent: ContentPiece | null = null
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
  return {
    name,
    diskpath,
    hash,
    parent,
    index: 0,
    ...metadata, // <-- "id" is here (the 'slug')
    hasDoc: (await findDocFilename(diskpath)) != null,
    numSlides: (await listPieceSubdir(diskpath, "slides", isSlide))?.length ?? 0,
  };
};

import { Dirent } from "fs";
import { readdir } from "fs/promises";
import { extname } from "path";

export const readDirWithFileTypes = (path: string) =>
  readdir(path, { withFileTypes: true });

export const dirNameToTitle = (dirName: string) => {
  const firstSpace = dirName.indexOf(" ");
  return firstSpace !== -1 ? dirName.slice(firstSpace + 1) : dirName;
};

export const isContentEntity = (ent: Dirent) => {
  return (
    ent.isDirectory() &&
    !ent.name.startsWith("_") &&
    !ent.name.startsWith(".") &&
    ent.name !== "slides"
  );
};

export const isSlide = (ent: Dirent) =>
  ent.isFile() && ent.name.endsWith(".svg");

const imgExts = ["png", "jpg", "jpeg", "svg", "webp", "avif"];

export const isImage = (ent: Dirent) =>
  ent.isFile() && imgExts.includes(extname(ent.name));

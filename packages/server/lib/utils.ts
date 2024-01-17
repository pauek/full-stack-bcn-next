import { Dirent } from "fs";
import { readFile, readdir } from "fs/promises";

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

export const sha256sum = async (fullpath: string) => {
  const buf = await readFile(fullpath);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const fileExtension = (filename: string) => {
  const lastDot = filename.lastIndexOf(".");
  return lastDot > 0 ? filename.slice(lastDot + 1) : "";
};

export const isSlide = (ent: Dirent) =>
  ent.isFile() && ent.name.endsWith(".svg");

const imgExts = ["png", "jpg", "jpeg", "svg", "webp", "avif"];

export const isImage = (ent: Dirent) =>
  ent.isFile() && imgExts.includes(fileExtension(ent.name));

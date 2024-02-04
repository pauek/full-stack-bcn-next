import { extname } from "path";
import { FileReference } from "./data/data-backend";
import { R2_PUBLIC_URL } from "./env";

const BASE_DIR = "c";

export const pieceRef = (path: string) => `/${BASE_DIR}/${path}`;

export const pieceUrl = (idpath: string[]) => `/${BASE_DIR}/${idpath.join("/")}`;

export const imageUrl = (idpath: string[], src?: string) => `/img/${idpath.join("/")}/${src}`;

export const slideUrl = (idpath: string[], slide: string) => `/img/sl/${idpath.join("/")}/${slide}`;

export const coverUrl = (idpath: string[]) => `/img/cover/${idpath.join("/")}`;

export const attachmentUrl = (fileref: FileReference) =>
  `${R2_PUBLIC_URL}/${fileref.hash}${extname(fileref.filename)}}`;

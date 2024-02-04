import { extname } from "path";
import { FileReference } from "./data/data-backend";

const BASE_DIR = "c";

export const pieceRef = (path: string) => `/${BASE_DIR}/${path}`;

export const pieceUrl = (idpath: string[]) => `/${BASE_DIR}/${idpath.join("/")}`;

export const attachmentUrl = (fileref: FileReference) =>
  `${process.env.R2_PUBLIC_URL!}/${fileref.hash}${extname(fileref.filename)}`;

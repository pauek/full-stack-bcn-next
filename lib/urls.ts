const BASE_DIR = "content";

export const pieceRef = (path: string) => `/${BASE_DIR}/${path}`;

export const pieceUrl = (idpath: string[]) => `/${BASE_DIR}/${idpath.join("/")}`;

export const imageUrl = (idpath: string[], src?: string) =>
  `/${BASE_DIR}/${idpath.join("/")}/images/${src}`;

export const slideUrl = (path: string[], slide: string) =>
  `/${BASE_DIR}/${path.join("/")}/slides/${slide}`;

export const coverUrl = (idpath: string[]) => `/content/${idpath.join("/")}/cover`;

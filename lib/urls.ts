const BASE_DIR = "c";

export const pieceRef = (path: string) => `/${BASE_DIR}/${path}`;

export const pieceUrl = (idpath: string[]) => `/${BASE_DIR}/${idpath.join("/")}`;

export const imageUrl = (idpath: string[], src?: string) => `/img/${idpath.join("/")}/${src}`;

export const slideUrl = (idpath: string[], slide: string) => `/img/sl/${idpath.join("/")}/${slide}`;

export const coverUrl = (idpath: string[]) => `/img/cover/${idpath.join("/")}`;

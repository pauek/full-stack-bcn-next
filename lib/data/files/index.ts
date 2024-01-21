import { getBreadcrumbData } from "../common";
import { DataBackend } from "../data-backend";
import { getPieceWithChildren } from "../db";
import * as _backend from "./backend";

export * from "./backend";
export * from "./hashes";
export * from "./metadata";
export * from "./utils";

export const __CONTENT_ROOT = process.env.CONTENT_ROOT!;

export const backend: DataBackend = {
  ..._backend,
  getBreadcrumbData: getBreadcrumbData(getPieceWithChildren),
};
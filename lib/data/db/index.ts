import { getBreadcrumbData } from "../common";
import { DataBackend } from "../data-backend";
import * as _backend from "./backend";
import { getPieceWithChildren } from "./backend";

export * from "./backend";
export * from "./insert";
export * from "./db";
export * from "./utils"

export const backend: DataBackend = {
  ..._backend,
  getBreadcrumbData: getBreadcrumbData(getPieceWithChildren),
};

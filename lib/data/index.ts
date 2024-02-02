import { backend as dbBackendBase } from "@/lib/data/db";
import { backend as filesBackendBase } from "@/lib/data/files";
import { getAllIdpaths, getBreadcrumbData, walkContentPieces } from "./common";
import { DataBackend } from "./data-backend";

const commonBackend = {
  getBreadcrumbData,
  getAllIdpaths,
  walkContentPieces,
};

export const dbBackend: DataBackend = {
  ...dbBackendBase,
  ...commonBackend,
};

export const filesBackend: DataBackend = {
  ...filesBackendBase,
  ...commonBackend,
};

const getBackend = (): DataBackend => {
  const dbUrl = process.env.DATABASE_URL!;
  let backend: DataBackend = dbUrl === "files" ? filesBackend : dbBackend;
  if (process.env.NODE_ENV !== "production") {
    console.log(` ${backend.getInfo()}`);
  }
  return backend;
};

export default await getBackend();

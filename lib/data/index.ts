import { backend as dbBackend } from "@/lib/data/db";
import { backend as filesBackend } from "@/lib/data/files";
import { getAllIdpaths, getBreadcrumbData } from "./common";
import { DataBackend, DataBackendBase } from "./data-backend";

const getBackend = (): DataBackend => {
  const dbUrl = process.env.DATABASE_URL!;
  let backend: DataBackendBase = dbUrl === "files" ? filesBackend : dbBackend;

  if (process.env.NODE_ENV !== "production") {
    console.log(` ${backend.getInfo()}`);
  }
  
  return {
    ...backend,
    getBreadcrumbData,
    getAllIdpaths,
  };
};

export default await getBackend();

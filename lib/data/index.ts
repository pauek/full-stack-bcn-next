import { DataBackend } from "./data-backend";

import { backend as filesBackend } from "@/lib/data/files";
import { backend as dbBackend } from "@/lib/data/db";

const initBackend = (): DataBackend => {
  const dbUrl = process.env.DATABASE_URL!;
  let backend: DataBackend = dbUrl === "files" ? filesBackend : dbBackend;
  if (process.env.NODE_ENV !== "production") {
    console.log(` ${backend.getInfo()}`);
  }
  return backend;
};

export default await initBackend();

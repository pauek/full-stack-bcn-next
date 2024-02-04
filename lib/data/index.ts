
import { DataBackend } from "./data-backend";
import { dbBackend } from "./db";
import { filesBackend } from "./files";

const getBackend = (): DataBackend => {
  const dbUrl = process.env.DB_URL!;
  let backend: DataBackend = dbUrl === "files" ? filesBackend : dbBackend;
  if (process.env.NODE_ENV !== "production") {
    console.log(` ${backend.getInfo()}`);
  }
  return backend;
};

export default await getBackend();

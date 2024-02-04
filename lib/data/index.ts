import { env } from "@/lib/env.mjs";
import { DataBackend } from "./data-backend";
import { dbBackend } from "./db";
import { filesBackend } from "./files";

const getBackend = (): DataBackend => {
  const dbUrl = env.DB_URL;
  let backend: DataBackend = dbUrl === "files" ? filesBackend : dbBackend;

  /*
  const info = backend.getInfo();
  process.stdout.write(chalk.yellow(`[${info}]\n`));
  */

  return backend;
};

export default await getBackend();

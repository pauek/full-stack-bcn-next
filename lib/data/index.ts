import { DataBackend } from "./data-backend";

import { backend as filesBackend } from "@/lib/data/files";
import { backend as dbBackend } from "@/lib/data/db";

const initBackend = (): DataBackend => {
  if (process.env.MODE! === "local") {
    console.log("--> Using files backend.");
    return filesBackend;
  } else {
    console.log("--> Using database backend.");
    return dbBackend;
  }
}

export default initBackend();

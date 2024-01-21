import { DataBackend } from "./data-backend";

import { backend as filesBackend } from "@/lib/data/files";
import { backend as dbBackend } from "@/lib/data/db";

export default process.env.NODE_ENV === "production" ? dbBackend : (filesBackend as DataBackend);

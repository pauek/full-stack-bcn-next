import { env } from "@/lib/env.mjs";
import { dbBackend } from "./db";
import { filesBackend } from "./files";

export default env.BACKEND === "files" ? filesBackend : dbBackend;

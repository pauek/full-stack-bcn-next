import { env } from "@/lib/env.mjs"
import { backend as dbBackendBase } from "./db"
import { backend as filesBackendBase } from "./files"
import { commonBackend } from "./common"

export const dbBackend = {
  ...commonBackend,
  ...dbBackendBase,
}

export const filesBackend = {
  ...commonBackend,
  ...filesBackendBase,
}

export default env.BACKEND === "files" ? filesBackend : dbBackend

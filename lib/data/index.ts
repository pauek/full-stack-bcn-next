import { env } from "@/lib/env.mjs"
import { commonBackend } from "./common"
import { DataBackend } from "./data-backend"

// NOTE(pauek): I have to use "require" instead of "await import(...)" here
// because of Webpack which does not accept 'await' at top-level
// I don't know if Bun is necessary, but it might be.

const dynamicallyCreateBackend = () => {
  if (env.BACKEND === "files") {
    const files = require(`./files`)
    return { ...files.backend, ...commonBackend }
  } else {
    const db = require(`./db`)
    return { ...db.backend, ...commonBackend }
  }
}

const backend: DataBackend = dynamicallyCreateBackend()

export default backend

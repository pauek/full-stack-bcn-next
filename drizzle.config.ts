import "@/lib/env-config"
import type { Config } from "drizzle-kit"
import { env } from "./lib/env.mjs"

export default {
  schema: "./data/schema.ts",
  out: "./data/drizzle",
  driver: "turso",
  dialect: "sqlite",
  dbCredentials: {
    url: env.TURSO_URL,
    authToken: env.TURSO_TOKEN,
  },
  verbose: true,
} as Config

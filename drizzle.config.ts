import type { Config } from "drizzle-kit"
import { env } from "./lib/env.mjs"

export default {
    schema: "./data/schema.ts",
    out: "./data/drizzle",
    dialect: "turso",
    dbCredentials: {
        url: env.TURSO_URL,
        authToken: env.TURSO_TOKEN,
    },
    verbose: true,
} as Config

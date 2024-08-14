import "@/lib/env-config"
import type { Config } from "drizzle-kit"
import chalk from "chalk"

const { TURSO_TOKEN, TURSO_URL } = process.env
if (!TURSO_TOKEN || !TURSO_URL) {
  throw new Error("Missing TURSO_TOKEN or TURSO_URL in environment")
}

console.log(`TURSO_URL = ${chalk.yellow(TURSO_URL)}`)

export default {
  schema: "./data/schema.ts",
  out: "./data/drizzle",
  driver: "turso",
  dialect: "sqlite",
  dbCredentials: {
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  },
  verbose: true,
} as Config

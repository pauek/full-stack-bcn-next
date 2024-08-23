import "@/lib/env-config"
import type { Config } from "drizzle-kit"
import chalk from "chalk"

const { DB } = process.env

let TURSO_TOKEN: string | undefined
let TURSO_URL: string | undefined

console.log(`DB = ${chalk.yellow(DB)}`)

if (DB === "development") {
  TURSO_TOKEN = process.env.TURSO_TOKEN
  TURSO_URL = process.env.TURSO_URL
} else if (DB === "preview") {
  TURSO_TOKEN = process.env.TURSO_TOKEN_PREVIEW
  TURSO_URL = process.env.TURSO_URL_PREVIEW
} else if (DB === "production") {
  TURSO_TOKEN = process.env.TURSO_TOKEN_PRODUCTION
  TURSO_URL = process.env.TURSO_URL_PRODUCTION
}

if (!TURSO_TOKEN || !TURSO_URL) {
  throw new Error("TURSO_TOKEN or TURSO_URL is not defined")
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

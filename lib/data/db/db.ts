import * as schema from "@/data/schema"
import { env } from "@/lib/env.mjs"

import { createClient } from "@libsql/client"
import chalk from "chalk"
import { drizzle } from "drizzle-orm/libsql"

console.info(`DB = ${chalk.yellow(env.DB)}`)

const client = createClient({
  url: env.TURSO_URL,
  authToken: env.TURSO_TOKEN,
})

export const db = drizzle(client, { schema })

export const closeConnection = async () => {
  client.close()
}

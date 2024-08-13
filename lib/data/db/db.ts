import * as schema from "@/data/schema"
import { env } from "@/lib/env.mjs"

import { drizzle } from "drizzle-orm/libsql"
import { createClient } from "@libsql/client"

const client = createClient({
  url: env.TURSO_URL,
  authToken: env.TURSO_TOKEN,
})

export const db = drizzle(client, { schema })

export const closeConnection = async () => {
  client.close()
}

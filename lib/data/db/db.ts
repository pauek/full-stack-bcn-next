import * as schema from "@/data/schema";
import { env } from "@/lib/env.mjs";

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

neonConfig.useSecureWebSocket = true;

const isClient = typeof window !== "undefined";
const pool = new Pool({ connectionString: isClient ? env.NEXT_PUBLIC_DB_URL : env.DB_URL });
export const db = drizzle(pool, { schema });

export const closeConnection = async () => {
  await pool.end();
};

import * as schema from "@/data/schema";

import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

neonConfig.useSecureWebSocket = true;

const pool = new Pool({ connectionString: process.env.DB_URL! });
export const db = drizzle(pool, { schema });

export const closeConnection = async () => {
  await pool.end();
}


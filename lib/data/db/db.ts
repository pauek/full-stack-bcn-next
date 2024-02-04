import * as schema from "@/data/schema";
import { DATABASE_URL } from "@/lib/env";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

neonConfig.useSecureWebSocket = true;

const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle(pool, { schema });

export const closeConnection = async () => {
  await pool.end();
}


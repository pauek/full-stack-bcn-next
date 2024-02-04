import * as schema from "@/data/schema";
import { DATABASE_URL } from "@/lib/env";
import { showExecutionTime } from "@/lib/utils";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import ws from "ws";

showExecutionTime(async () => {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool, { schema });

  await migrate(db, {
    migrationsFolder: "./data/drizzle",
    migrationsTable: "migrations",
  });

  await pool.end();
});

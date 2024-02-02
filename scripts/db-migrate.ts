import * as schema from "@/data/schema";
import { closeConnection } from "@/lib/data/db";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import ws from "ws";

neonConfig.webSocketConstructor = ws;
const sql = new Pool({ connectionString: process.env.DATABASE_URL! });

export const db = drizzle(sql, { schema });

await migrate(db, {
  migrationsFolder: "./data/drizzle",
  migrationsTable: "migrations",
});

await closeConnection();

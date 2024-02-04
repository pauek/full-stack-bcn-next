import dotenv from "dotenv";
import type { Config } from "drizzle-kit";
import { env } from "@/lib/env.mjs";

const NODE_ENV = process.env.NODE_ENV || "development";
console.log("NODE_ENV is", NODE_ENV);
dotenv.config({ path: [`./.env.${NODE_ENV}.local`, `.env.local`] });
console.log("Database is", env.DB_URL);

export default {
  schema: "./data/schema.ts",
  out: "./data/drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: env.DB_URL,
  },
  verbose: true,
} as Config;

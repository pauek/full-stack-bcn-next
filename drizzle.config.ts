import dotenv from "dotenv";
import type { Config } from "drizzle-kit";

const NODE_ENV = process.env.NODE_ENV || "development";
console.log("NODE_ENV =", NODE_ENV);

dotenv.config({ path: [`./.env.${NODE_ENV}.local`, `.env.local`] });

const { TURSO_TOKEN, TURSO_URL } = process.env;
if (!TURSO_TOKEN || !TURSO_URL) {
  throw new Error("Missing TURSO_TOKEN or TURSO_URL in environment");
}

export default {
  schema: "./data/schema.ts",
  out: "./data/drizzle",
  driver: "turso",
  dbCredentials: {
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  },
  verbose: true,
} as Config;

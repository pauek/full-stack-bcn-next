import dotenv from "dotenv";
import type { Config } from "drizzle-kit";


const { NODE_ENV } = process.env;
const mode = NODE_ENV || "development";
console.log("NODE_ENV is", NODE_ENV);
dotenv.config({ path: [`./.env.${mode}.local`, `.env.local`] });
console.log("Database is", process.env.DB_URL!);

export default {
  schema: "./data/schema.ts",
  out: "./data/drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DB_URL!,
  },
  verbose: true,
} as Config;

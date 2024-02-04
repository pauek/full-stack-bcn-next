import { env } from "@/lib/env.mjs";
import { execSync } from "child_process";
const { NODE_ENV, DB_URL } = process.env;

console.log(`Database: ${NODE_ENV}\n[${env.DB_URL}]`);

execSync(`psql ${env.DB_URL}`, { stdio: "inherit" });

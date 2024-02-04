import { execSync } from "child_process";
const { NODE_ENV, DATABASE_URL } = process.env;

console.log(`Database: ${NODE_ENV}\n[${DATABASE_URL}]`);

execSync(`psql ${DATABASE_URL}`, { stdio: "inherit" });

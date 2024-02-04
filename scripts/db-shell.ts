import { execSync } from "child_process";
const { NODE_ENV, DB_URL } = process.env;

console.log(`Database: ${NODE_ENV}\n[${process.env.DB_URL!}]`);

execSync(`psql ${process.env.DB_URL!}`, { stdio: "inherit" });

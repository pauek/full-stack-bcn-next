import dotenv from "dotenv"
import chalk from "chalk"

const NODE_ENV = process.env.NODE_ENV || "development"
console.log("NODE_ENV =", chalk.yellow(NODE_ENV))
dotenv.config({ path: [`./.env.${NODE_ENV}.local`, `.env.local`] })

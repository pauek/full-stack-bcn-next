import chalk from "chalk"
import { config } from "dotenv"

export const readEnvFile = (envName: string, envFile: string) => {
  const { parsed } = config({ path: envFile })
  if (!parsed) {
    console.error(`Error parsing ${envFile}`)
    process.exit(1)
  }
  process.env.TURSO_URL = parsed.TURSO_URL
  process.env.TURSO_TOKEN = parsed.TURSO_TOKEN

  // This colors take into account the Starship.rs presets for Gruvbox Rainbow theme
  // (https://starship.rs/presets/gruvbox-rainbow)
  if (envName === "Production") {
    console.info(`${chalk.bgGreen(`     ${envName}     `)}`)
  } else {
    console.info(`${chalk.bgYellowBright(`     ${envName}     `)}`)
  }
}

import { okToSkipMissingHashes } from "@/lib/data/files"
import { showExecutionTime } from "@/lib/utils"
import { writeHashes } from "./lib"

await showExecutionTime(async () => {
  await okToSkipMissingHashes(async () => {
    writeHashes({ log: true })
  })
})

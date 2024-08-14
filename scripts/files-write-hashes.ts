import { showExecutionTime } from "@/lib/utils"
import { writeHashes } from "./lib/lib"
import { okToSkipMissingHashes } from "@/lib/data/files/utils"

await showExecutionTime(async () => {
  await okToSkipMissingHashes(async () => {
    writeHashes({ log: true })
  })
})

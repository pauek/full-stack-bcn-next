import { showExecutionTime } from "@/lib/utils"
import { rewriteAllHashes } from "../lib/lib"
import { okToSkipMissingHashes } from "@/lib/data/files/utils"

await showExecutionTime(async () => {
  await okToSkipMissingHashes(async () => {
    rewriteAllHashes({ log: true })
  })
})

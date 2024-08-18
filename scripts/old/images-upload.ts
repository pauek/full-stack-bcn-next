import { filesGetRoot } from "@/lib/data/files/utils"
import { showExecutionTime } from "@/lib/utils"
import { uploadImages } from "../lib/lib"

await showExecutionTime(async () => {
  await uploadImages(await filesGetRoot())
})

process.exit(0) // Force exit to avoid waiting

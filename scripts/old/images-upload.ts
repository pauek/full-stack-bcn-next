import { showExecutionTime } from "@/lib/utils"
import { uploadImages } from "../lib/lib"
import { filesGetRootIdpath } from "@/lib/data/files/utils"

await showExecutionTime(async () => {
  await uploadImages(filesGetRootIdpath())
})

process.exit(0) // Force exit to avoid waiting

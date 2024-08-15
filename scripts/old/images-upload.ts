import { showExecutionTime } from "@/lib/utils"
import { uploadImages } from "../lib/lib"

await showExecutionTime(uploadImages)

process.exit(0) // Force exit to avoid waiting

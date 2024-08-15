import { hashAny } from "@/lib/data/hashing"
import { R2Client } from "@/lib/data/r2"
import { showExecutionTime } from "@/lib/utils"
import { readFile } from "fs/promises"
import { extname } from "path"

const [_bun, _script, idjpath, videoPath] = process.argv
if (!videoPath || !idjpath) {
  console.log("Usage: bun run video-upload.ts <idjpath> <filename>")
  process.exit(1)
}

const typeByExt: Record<string, string> = {
  ".flv": "video/x-flv",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
}

await showExecutionTime(async () => {
  try {
    const r2client = new R2Client()
    const content = await readFile(videoPath)
    const hash = hashAny(videoPath)
    const ext = extname(videoPath)
    const mimeType = typeByExt[ext]
    if (!mimeType) {
      console.error(`Don't know mimetype for extension: ${ext}`)
      return
    }

    const key = `${hash}${ext}`
    console.log(key)

    if (!(await r2client.fileExists(key))) {
      await r2client.uploadFile(key, content, mimeType)
    }

    r2client.destroy()
  } catch (e) {
    console.error(`video-upload.ts: Error uploading video: ${e}`)
  }
})

process.exit(0) // Force exit to avoid waiting

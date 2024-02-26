import { hashAny } from "@/lib/data/hashing";
import { R2Client } from "@/lib/data/r2";
import { showExecutionTime } from "@/lib/utils";
import { readFile } from "fs/promises";
import { extname } from "path";

const [_bun, _script, videoPath] = process.argv;
if (!videoPath) {
  console.log("Usage: bun run video-upload.ts <filename>");
  process.exit(1);
}

const typeByExt: Record<string, string> = {
  ".flv": "video/x-flv",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
};

await showExecutionTime(async () => {
  try {
    const r2client = new R2Client();
    const content = await readFile(videoPath);
    const hash = hashAny(videoPath);
    const ext = extname(videoPath);
    const mimeType = typeByExt[ext];
    if (!mimeType) {
      console.error(`Don't know mimetype for extension: ${ext}`);
      return;
    }
    const key = `${hash}${ext}`;
    console.log(key);
    await r2client.uploadFile(key, content, mimeType);
    r2client.destroy();
  } catch (e) {
    console.error(`video-upload.ts: Error uploading video: ${e}`);
  }
});

process.exit(0); // Force exit to avoid waiting

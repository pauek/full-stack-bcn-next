import { dbGetAllHashmaps } from "@/lib/data/db/hashmaps"

const hashmaps = await dbGetAllHashmaps()
for (const entry of hashmaps) {
  console.log(`${entry.pieceHash} ${entry.idpath.join("/")}`)
}

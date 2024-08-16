import { A } from "@/components/mdx/dom"
import { HashmapEntry, writeGlobalHashmap } from "@/lib/data/files/hash-maps"
import { filesWalkContentPieces } from "@/lib/data/files/utils"
import { HashItem, hashPiece } from "@/lib/data/hashing"
import { env } from "@/lib/env.mjs"
import { basename } from "path"

const entries: HashmapEntry[] = []

type Item = HashItem & { level: number }

await filesWalkContentPieces<Item>([env.COURSE_ID], async ({ piece, diskpath, children }) => {
  const hash = await hashPiece(piece, children)
  const level = 1 + Math.max(0, ...children.map((c) => c.level))
  const filename = basename(diskpath)
  const idpath = piece.idpath

  entries.push({ hash, idpath, diskpath, level })

  return { hash, filename, level }
})

entries.sort((a, b) => b.level - a.level)
await writeGlobalHashmap(entries)

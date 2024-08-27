import { eq } from "drizzle-orm"
import { db } from "./db"
import { hashmap } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"

export const dbGetAllHashmaps = async () => {
  return await db.query.hashmap.findMany()
}

export const dbGetHashmapForIdpath = async (idpath: string[]) => {
  return await db.query.hashmap.findFirst({
    where: eq(hashmap.idpath, idpath),
  })
}

export const dbInsertHashmap = async (piece: ContentPiece) => {
  const { idpath, metadata } = piece
  const { level } = metadata
  await db
    .insert(hashmap)
    .values({ idpath, pieceHash: piece.hash, level })
    .onConflictDoUpdate({
      target: hashmap.idpath,
      set: { pieceHash: piece.hash },
    })
}

export const dbUpdateHashmap = async (idpath: string[], hash: string) => {
  await db.update(hashmap).set({ pieceHash: hash }).where(eq(hashmap.idpath, idpath))
}

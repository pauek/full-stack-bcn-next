import { db } from "./db"

export const dbGetAllHashmaps = async () => {
  return await db.query.hashmap.findMany()
}

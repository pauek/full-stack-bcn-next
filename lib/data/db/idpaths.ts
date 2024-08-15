import * as schema from "@/data/schema"
import { like } from "drizzle-orm"
import { db } from "./db"

export const getAllIdpaths = async (rootIdpath: string[]): Promise<string[][]> => {
  const result = await db.query.hashmap.findMany({
    where: like(schema.hashmap.idpath, `${rootIdpath.join("/")}%`),
    columns: { idpath: true },
  })
  return result.map(({ idpath }) => idpath)
}

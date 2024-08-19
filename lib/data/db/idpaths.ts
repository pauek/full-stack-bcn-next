import { db } from "./db"

export const getAllIdpaths = async (rootIdpath: string[]): Promise<string[][]> => {
  const result = await db.query.hashmap.findMany({
    columns: { idpath: true },
  })
  const rootIdjpath = rootIdpath.join("/")
  return result
    .filter(({ idpath }) => idpath.join("/").startsWith(rootIdjpath))
    .map(({ idpath }) => idpath)
}

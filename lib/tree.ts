import { Hashmap, hashmap } from "@/data/schema"
import { sql } from "drizzle-orm"
import { db } from "./data/db/db"

export type TreeNode = {
  hash: string
  id: string
  level: number
  children: TreeNode[]
}

const descendIdpath = (tree: TreeNode, idpath: string[]): TreeNode | null => {
  let curr: TreeNode = tree
  for (const id of idpath) {
    const child = tree.children.find((c) => c.id === id)
    if (child === undefined) {
      return null
    }
    curr = child
  }
  return curr
}

const insertIntoTree = (tree: TreeNode, hashmap: Hashmap) => {
  const { idpath } = hashmap
  const parentIdpath = idpath.slice(0, -1)
  const [id] = idpath.slice(-1)

  let parent = descendIdpath(tree, parentIdpath)
  if (!parent) {
    throw new Error(`Could not find "${parentIdpath}"`)
  }
  parent.children.push({ id, level: -1, hash: hashmap.pieceHash, children: [] })
}

export const dbConstructFullTree = async () => {
  const tree: TreeNode = { id: "<root>", level: 0, hash: "", children: [] }
  const pieces = await db.query.hashmap.findMany({
    orderBy: sql`json_array_length(${hashmap.idpath})`,
  })
  for (const hashmap of pieces) {
    insertIntoTree(tree, hashmap)
  }
  if (tree.children[0].id !== "fullstack") {
    throw new Error("Expected 'fullstack' course to be the root!")
  }
  return tree.children[0]
}

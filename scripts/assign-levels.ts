import { hashmap } from "@/data/schema"
import { db } from "@/lib/data/db"
import { assignLevels, constructTree, TreeNode } from "@/lib/tree"
import { eq } from "drizzle-orm"

const tree = await constructTree()
assignLevels(tree)

const printLevel = (tree: TreeNode) => {
  const print = (tree: TreeNode, indent: number) => {
    console.log(" ".repeat(indent * 4), tree.id, tree.level)
    for (const child of tree.children) {
      print(child, indent + 1)
    }
  }

  print(tree, 0)
}

const updateLevel = async (tree: TreeNode) => {
  const update = async (tree: TreeNode) => {
    await db.update(hashmap).set({ level: tree.level }).where(eq(hashmap.pieceHash, tree.hash))
    for (const child of tree.children) {
      await update(child)
    }
  }

  await update(tree)
}

await updateLevel(tree)

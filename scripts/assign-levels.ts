import { hashmap } from "@/data/schema"
import { db } from "@/lib/data/db/db"
import { updateMetadata } from "@/lib/data/files/metadata"
import { hashToDiskpath } from "@/lib/data/hash-maps"
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

const dbUpdateLevel = async (tree: TreeNode) => {
  await db.update(hashmap).set({ level: tree.level }).where(eq(hashmap.pieceHash, tree.hash))
}

const filesUpdateLevel = async (tree: TreeNode) => {
  const diskpath = await hashToDiskpath(tree.hash)
  if (!diskpath) {
    throw new Error(`Diskpath not found for hash ${tree.hash}`)
  }
  await updateMetadata(diskpath, async (metadata) => {
    metadata.level = tree.level
  })
}

const updateLevel = async (tree: TreeNode) => {
  const update = async (tree: TreeNode) => {
    await dbUpdateLevel(tree)
    await filesUpdateLevel(tree)
    for (const child of tree.children) {
      await update(child)
    }
  }

  await update(tree)
}

await updateLevel(tree)

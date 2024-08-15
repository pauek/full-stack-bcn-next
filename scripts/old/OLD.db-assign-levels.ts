import { hashmap } from "@/data/schema"
import { db } from "@/lib/data/db/db"
import { getDiskpathByHash } from "@/lib/data/files/hash-maps"
import { updateMetadata } from "@/lib/data/files/metadata"
import { computeLevels, dbConstructFullTree, TreeNode } from "@/lib/tree"
import { eq } from "drizzle-orm"

const dbUpdateLevel = async (tree: TreeNode) => {
  await db.update(hashmap).set({ level: tree.level }).where(eq(hashmap.pieceHash, tree.hash))
}

const filesUpdateLevel = async (tree: TreeNode) => {
  const diskpath = await getDiskpathByHash(tree.hash)
  if (diskpath === null) {
    throw new Error(`Could not find diskpath for hash ${tree.hash}`)
  }
  await updateMetadata(diskpath, async (metadata) => {
    metadata.level = tree.level
  })
}

const updateLevelFilesAndDB = async (tree: TreeNode) => {
  const update = async (tree: TreeNode) => {
    await dbUpdateLevel(tree)
    await filesUpdateLevel(tree)
    for (const child of tree.children) {
      await update(child)
    }
  }

  await update(tree)
}

const tree = await dbConstructFullTree()
computeLevels(tree)
await updateLevelFilesAndDB(tree)

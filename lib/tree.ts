import { hashmap } from "@/data/schema"
import { env } from "@/lib/env.mjs"
import { eq } from "drizzle-orm"
import { db } from "./data/db/db"

const getAllHashes = async () =>
  await db.query.hashmap.findMany({
    with: {
      piece: {
        columns: {
          metadata: true,
        },
      },
    },
  })

type HashWithPiece = Awaited<ReturnType<typeof getAllHashes>>[number]

export type TreeNode = {
  hash: string
  id: string
  level: number
  children: TreeNode[]
}

const findChildById = (tree: TreeNode, id: string): TreeNode | null => {
  for (const child of tree.children) {
    if (child.id === id) {
      return child
    }
  }
  return null
}

const descendIdjpath = (tree: TreeNode, idpath: string[]): TreeNode | null => {
  let curr: TreeNode = tree
  for (const id of idpath) {
    const child = findChildById(curr, id)
    if (child === null) {
      return null
    }
    curr = child
  }
  return curr
}

const insertIntoTree = (tree: TreeNode, hashmap: HashWithPiece) => {
  const { idjpath } = hashmap
  const parent = idjpath.split("/").slice(0, -1)
  const [id] = idjpath.split("/").slice(-1)

  let node = descendIdjpath(tree, parent)
  if (!node) {
    throw new Error(`Could not find "${parent}"`)
  }
  node.children.push({
    id,
    level: -1,
    hash: hashmap.pieceHash,
    children: [],
  })
  // TODO: more stuff
}



export const constructTree = async () => {
  const rootPiece = await db.query.hashmap.findFirst({
    where: eq(hashmap.idjpath, env.COURSE_ID),
    with: {
      piece: {
        columns: {
          name: true,
          metadata: true,
        },
      },
    },
  })

  if (!rootPiece) {
    console.error(`No piece found for ID = ${env.COURSE_ID}`)
    process.exit(1)
  }

  const root: TreeNode = {
    id: "<root>",
    level: -1,
    hash: "",
    children: [
      {
        id: env.COURSE_ID,
        level: 1,
        hash: rootPiece.pieceHash,
        children: [],
      },
    ],
  }

  const pieces = await getAllHashes()
  pieces.sort((a, b) => {
    const adepth = a.idjpath.split("/").length
    const bdepth = b.idjpath.split("/").length
    return adepth - bdepth
  })
  for (const hashmap of pieces.slice(1)) {
    insertIntoTree(root, hashmap)
  }

  return root.children[0]
}

export const assignLevels = async (tree: TreeNode) => {
  const assign = (node: TreeNode): number => {
    if (node.children.length === 0) {
      node.level = 0
      return 0
    }
    const childrenLevels = node.children.map(assign)
    const level = Math.max(...childrenLevels) + 1
    node.level = level
    return level
  }

  assign(tree)
}

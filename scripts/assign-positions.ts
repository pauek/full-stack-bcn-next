import { hashmap, mapPositions } from "@/data/schema";
import { db } from "@/lib/data/db";
import { env } from "@/lib/env.mjs";
import { eq } from "drizzle-orm";

const pieceLevel = (piece: HashWithPiece) => piece.idjpath.split("/").length;

const getAllHashes = async () =>
  await db.query.hashmap.findMany({
    with: {
      piece: {
        columns: {
          name: true,
          metadata: true,
        },
      },
    },
  });

type HashWithPiece = Awaited<ReturnType<typeof getAllHashes>>[number];

type TreeNode = {
  hash: string;
  id: string;
  level: number;
  name: string;
  children: TreeNode[];
};

const findChildById = (tree: TreeNode, id: string): TreeNode | null => {
  for (const child of tree.children) {
    if (child.id === id) {
      return child;
    }
  }
  return null;
};

const descendIdjpath = (tree: TreeNode, idpath: string[]): TreeNode | null => {
  let curr: TreeNode = tree;
  for (const id of idpath) {
    const child = findChildById(curr, id);
    if (child === null) {
      return null;
    }
    curr = child;
  }
  return curr;
};

const insertIntoTree = (tree: TreeNode, hashmap: HashWithPiece) => {
  const { idjpath } = hashmap;
  const parent = idjpath.split("/").slice(0, -1);
  const [id] = idjpath.split("/").slice(-1);

  let node = descendIdjpath(tree, parent);
  if (!node) {
    throw new Error(`Could not find "${parent}"`);
  }
  node.children.push({
    id,
    level: pieceLevel(hashmap),
    hash: hashmap.pieceHash,
    name: hashmap.piece.name,
    children: [],
  });
  // TODO: more stuff
};

const updatePos = async (
  hash: string,
  left: number,
  top: number,
  width: number,
  height: number,
  z: number,
  color: string
) => {
  await db
    .insert(mapPositions)
    .values({ pieceHash: hash, left, top, width, height, z, color })
    .onConflictDoUpdate({
      target: mapPositions.pieceHash,
      set: { left, top, width, height, z, color },
    });
};

const assignPosition = async (node: TreeNode) => {
  const { level } = node;
  if (level !== 1) {
    throw new Error(`Expected level 1, got ${level}`);
  }

  let y = 10;
  for (const part of node.children) {
    // Assign parts
    let partHeight = 0;
    let maxSessionWidth = 0;
    for (const session of part.children) {
      let x = 20;
      for (const chapter of session.children) {
        updatePos(chapter.hash, x, y + 20, 200, 50, 2, "red");
        x += 210;
      }
      const sessionWidth = Math.max(x, 220);
      updatePos(session.hash, 10, y + 10, sessionWidth, 70, 1, "green");
      y += 90;
      partHeight += 90;
      maxSessionWidth = Math.max(maxSessionWidth, sessionWidth);
    }
    const width = Math.max(maxSessionWidth + 20, 200);
    updatePos(part.hash, 0, y - partHeight, width, partHeight, 0, "blue");
    y += 80;
  }
};

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
});

if (!rootPiece) {
  console.error(`No piece found for ID = ${env.COURSE_ID}`);
  process.exit(1);
}

const root: TreeNode = {
  id: "",
  level: 0,
  hash: "",
  name: "<root>",
  children: [
    {
      id: env.COURSE_ID,
      level: 1,
      hash: rootPiece.pieceHash,
      name: rootPiece.piece.name,
      children: [],
    },
  ],
};

const pieces = await getAllHashes();
pieces.sort((a, b) => pieceLevel(a) - pieceLevel(b));

for (const hashmap of pieces.slice(1)) {
  insertIntoTree(root, hashmap);
}

assignPosition(root.children[0]);

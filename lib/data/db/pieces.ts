import * as schema from "@/data/schema"
import { FileType } from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { lastElement } from "@/lib/utils"
import { eq, inArray } from "drizzle-orm"
import { db } from "./db"
import { pieceHasFiletype } from "./utils"

export const pieceHasCover = (piece: ContentPiece) => pieceHasFiletype(piece.hash, FileType.cover)
export const pieceHasDoc = (piece: ContentPiece) => pieceHasFiletype(piece.hash, FileType.doc)

export const getPiece = async (idpath: string[]): Promise<ContentPiece | null> => {
  const result = await db.query.hashmap.findFirst({
    where: eq(schema.hashmap.idpath, idpath),
    with: {
      piece: {
        columns: {
          pieceHash: true,
          name: true,
          metadata: true,
        },
      },
    },
  })
  if (!result) {
    console.log(`getPiece: piece not found for idpath "${idpath.join("/")}"`)
    return null
  }

  return {
    ...result.piece,
    hash: result.pieceHash,
    id: lastElement(idpath),
    idpath,
    children: [],
  }
}

const dbPieceToContentPiece = (
  idpath: string[],
  dbPiece: schema.DBPiece,
  children?: ContentPiece[]
): ContentPiece => {
  const { name, metadata, pieceHash } = dbPiece
  return {
    name,
    metadata,
    hash: pieceHash,
    idpath,
    id: lastElement(idpath),
    children,
  }
}

const idpathForHash = async (hash: string): Promise<string[] | null> => {
  const result = await db.query.hashmap.findFirst({
    where: eq(schema.hashmap.pieceHash, hash),
  })
  if (!result) {
    return null
  }
  return result.idpath
}

export const getPieceWithChildren = async (idpath: string[]): Promise<ContentPiece | null> => {
  const pieceResult = await db.query.hashmap.findFirst({
    where: eq(schema.hashmap.idpath, idpath),
    with: {
      piece: {
        with: {
          children: { with: { child: true } },
        },
      },
    },
  })
  if (!pieceResult) {
    return null
  }

  // NOTE(pauek): We don't ever filter hidden piece, just until the moment of 
  // showing them to the user.
  const childrenHashes = pieceResult.piece.children
    .map(({ child }) => child.pieceHash)

  const childrenResult = await db.query.pieces.findMany({
    where: inArray(schema.pieces.pieceHash, childrenHashes),
    with: {
      hashmapEntry: {
        columns: { idpath: true },
      },
    },
  })

  const children: ContentPiece[] = []
  for (const child of childrenResult) {
    if (child.metadata.hidden) {
      continue
    }
    const childIdpath = await idpathForHash(child.pieceHash)
    if (childIdpath === null) {
      console.warn(
        `getPieceWithChildren: child idpath not found ` +
          `for "${child.pieceHash}" (parent: ${idpath.join("/")})`
      )
      continue
    }
    children.push(dbPieceToContentPiece(childIdpath, child))
  }

  children.sort((a, b) => a.metadata.index - b.metadata.index)

  return dbPieceToContentPiece(idpath, pieceResult.piece, children)
}

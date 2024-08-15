import * as schema from "@/data/schema"
import { ContentPiece } from "@/lib/adt"
import { lastElement } from "@/lib/utils"
import { eq } from "drizzle-orm"
import { db } from "./db"
import { hashToPath, pathToHash } from "./utils"
import { getPiece } from "./pieces"

type Options = {
  level: number
}
export const getContentTree = async (idpath: string[], { level }: Options) => {

  const _getContentTree = async (idpath: string[], level: number) => {
    if (level === 0) {
      return await getPiece(idpath)
    }

  }

  const hash = await pathToHash(idpath)
  if (!hash) {
    return null
  }

  // TODO: Implement other levels??
  if (level !== 2) {
    throw Error(`Unimplemented tree with level != 2 (level = ${level})`)
  }

  const result = await db.query.pieces.findFirst({
    where: eq(schema.pieces.pieceHash, hash),
    with: {
      children: {
        with: {
          child: {
            with: {
              children: {
                with: {
                  child: true,
                },
              },
            },
          },
        },
      },
    },
  })
  if (!result) {
    return null
  }

  type Result = schema.DBPiece & { children?: { child: Result }[] }

  const __convert = async (res: Result): Promise<ContentPiece> => {
    const idpath = await hashToPath(res.pieceHash)
    if (!idpath) {
      throw Error(`getContentTree: path not found for "${res.pieceHash}"?!?`)
    }
    const children: ContentPiece[] = []
    for (const { child } of res.children || []) {
      children.push(await __convert(child))
    }
    const piece: ContentPiece = {
      ...res,
      hash: res.pieceHash,
      id: lastElement(idpath),
      idpath,
      children,
    }
    return piece
  }

  return await __convert(result)
}

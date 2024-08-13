import { MapPosition, mapPositions } from "@/data/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { assignLevels } from "@/lib/tree";
import { hash } from "bun";

export const dbMapPositionsGetAll = async () => {
  const results = await db.query.mapPositions.findMany({
    with: {
      piece: {
        columns: { name: true },
        with: {
          children: {
            columns: {
              childHash: true,
            },
          },
          hashmapEntry: {
            columns: {
              idjpath: true,
              level: true,
            },
          },
        },
      },
    },
  });

  const _find = (hash: string) => {
    const result = results.find((result) => result.pieceHash === hash);
    if (!result) {
      throw new Error(`Could not find piece with hash ${hash}`);
    }
    return result;
  }

  return results.map((result) => {
    const {
      left,
      top,
      width,
      height,
      color,
      pieceHash,
      piece: { name, hashmapEntry, children },
    } = result;

    return {
      left,
      top,
      width,
      height,
      color,
      name,
      pieceHash,
      idjpath: hashmapEntry?.idjpath,
      level: hashmapEntry?.level || -1,
      children: children.map((child) => _find(child.childHash)),
    };
  });
};

export type MapPositionWithPiece = Awaited<ReturnType<typeof dbMapPositionsGetAll>>[number];

export const dbMapPositionsUpdate = async (positionList: MapPosition[]) => {
  for (const position of positionList) {
    await db
      .update(mapPositions)
      .set(position)
      .where(eq(mapPositions.pieceHash, position.pieceHash));
  }
};

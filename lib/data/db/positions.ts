import { MapPosition, mapPositions } from "@/data/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { assignLevels } from "@/lib/tree";

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
      z: hashmapEntry?.level || -10,
      name,
      pieceHash,
      idjpath: hashmapEntry?.idjpath,
      level: hashmapEntry?.level,
      children: children.map((child) => child.childHash),
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

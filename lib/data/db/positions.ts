import { MapPosition, mapPositions } from "@/data/schema";
import { eq } from "drizzle-orm";
import { db } from "./db";

export const dbMapPositionsGetAll = async () => {
  return await db.query.mapPositions.findMany({
    with: {
      piece: {
        columns: { name: true },
        with: {
          hashmapEntry: {
            columns: { idjpath: true },
          },
        },
      },
    },
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

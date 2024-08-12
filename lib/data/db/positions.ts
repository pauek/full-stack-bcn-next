import { eq } from "drizzle-orm";
import { db } from "./db";
import { MapPosition, mapPositions, pieces } from "@/data/schema";

export const dbPositionsGetAll = async () => {
  return await db.query.mapPositions.findMany({
    with: {
      piece: { columns: { name: true } },
    },
  });
};

export type MapPositionWithPiece = MapPosition & { piece: { name: string } };

export const dbPositionsUpdate = async (positionList: MapPosition[]) => {
  for (const position of positionList) {
    await db
      .update(mapPositions)
      .set(position)
      .where(eq(mapPositions.pieceHash, position.pieceHash));
  }
};

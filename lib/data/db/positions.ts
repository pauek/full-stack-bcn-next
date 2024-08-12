import { eq } from "drizzle-orm";
import { db } from "./db";
import { MapPosition, mapPositions } from "@/data/schema";

export const dbPositionsGetAll = async () => {
  return await db.query.mapPositions.findMany();
};

export const dbPositionsUpdate = async (positionList: MapPosition[]) => {
  for (const position of positionList) {
    await db
      .update(mapPositions)
      .set(position)
      .where(eq(mapPositions.pieceHash, position.pieceHash));
  }
};

"use server";

import { MapPosition } from "@/data/schema";
import { dbPositionsGetAll, dbPositionsUpdate } from "@/lib/data/db/positions";

export async function actionLoadRectangles() {
  return await dbPositionsGetAll();
}

export async function actionRectangleUpdate(rectlist: MapPosition[]) {
  await dbPositionsUpdate(rectlist);
}

"use server"

import { MapPosition } from "@/data/schema"
import { dbMapPositionsGetAll, dbMapPositionsUpdate } from "@/lib/data/db/positions"

export async function actionLoadMapPositions() {
  return await dbMapPositionsGetAll()
}

export async function actionMapPositionsUpdate(rectlist: MapPosition[]) {
  await dbMapPositionsUpdate(rectlist)
}

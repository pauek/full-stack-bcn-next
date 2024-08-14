"use server"

import { MapPosition } from "@/data/schema"
import { dbMapPositionsUpdate } from "@/lib/data/db/positions"
import { filesMapPositionsGetAll } from "@/lib/data/files/positions"

export async function actionLoadMapPositions() {
  return await filesMapPositionsGetAll()
}

export async function actionMapPositionsUpdate(rectlist: MapPosition[]) {
  await dbMapPositionsUpdate(rectlist)
}

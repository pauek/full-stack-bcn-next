"use server"

import { MapPosition } from "@/data/schema"
import data from "@/lib/data"

export async function actionLoadMapPositions() {
  return await data.getMapPositionsExtended()
}

export const actionMapPositionsUpdate = async (mapPositions: MapPosition<number>[]) => {
  await data.updateMapPositions(mapPositions)
}

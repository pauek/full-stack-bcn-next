import { MapPosition } from "@/data/schema"
import { CanvasController } from "@/lib/canvas-controller"
import { MapPositionsAdapter } from "@/lib/map-positions-adapter"

export type MapItem = MapPosition<number>
export type MapController = CanvasController<MapItem>
export type MapAdapter = MapPositionsAdapter

export type MapSize = {
  width: number
  height: number
}

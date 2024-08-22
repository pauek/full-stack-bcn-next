import { CanvasController } from "@/lib/canvas-controller"
import { MapPositionsAdapter } from "@/lib/map-positions-adapter"
import { MapItem } from "./types"

// Global variables
export const globalCanvasController = new CanvasController<MapItem>()
export const globalMapPositionsAdapter = new MapPositionsAdapter()

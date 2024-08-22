// A component to have just one in-memory copy of the map, its controller and adapter

"use client"

import { actionLoadMapPositions } from "@/actions/positions"
import { MapPosition } from "@/data/schema"
import { CanvasController } from "@/lib/canvas-controller"
import { MapPositionsAdapter } from "@/lib/map-positions-adapter"
import { createContext, useEffect, useState } from "react"

export type MapItem = MapPosition<number>
export type MapController = CanvasController<MapItem>
export type MapAdapter = MapPositionsAdapter

export type MapSize = {
  width: number
  height: number
}

// MapState
type MapState = {
  items: MapItem[]
}

// Map context is just to hold the items in the map permanently
export const MapContext = createContext<MapState | null>(null)

type Props1 = {
  items: MapItem[]
  children: React.ReactNode
}
const Provider = ({ items, children }: Props1) => {
  console.log(new Date(), "MapStateProvider")
  return <MapContext.Provider value={{ items }}>{children}</MapContext.Provider>
}

type Props2 = {
  children: React.ReactNode
}
const PositionsLoader = ({ children }: Props2) => {
  console.log("MapPositionsLoader", Date.now())
  const [positions, setPositions] = useState<MapItem[] | undefined>()

  useEffect(() => {
    actionLoadMapPositions().then(setPositions)
  }, [])

  return positions && <Provider items={positions}>{children}</Provider>
}

export default PositionsLoader

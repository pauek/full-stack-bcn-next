// A component to have just one in-memory copy of the map, its controller and adapter

"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback, useContext, useEffect, useState } from "react"
import {
  MapContext,
  MapItem,
  MapSize,
} from "./map-context"
import { globalCanvasElement } from "./canvas"
import { globalCanvasController, globalMapPositionsAdapter } from "./map-globals"

const useCanvasResizeEvent = () => {
  const [size, setSize] = useState<MapSize>({ width: 0, height: 0 })

  // Resize event
  useEffect(() => {
    const resize = () => {
      const { innerWidth: width, innerHeight: height } = window
      setSize({ width, height })
      globalCanvasElement.width = width
      globalCanvasElement.height = height
    }
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [])

  // Paint when changing size
  useEffect(() => {
    if (size.width !== 0 && size.height !== 0) {
      globalCanvasController.paint()
    }
  }, [size])

  return [size]
}

const useWindowKeydownEvents = () => {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      globalCanvasController.onKeyDown(e)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])
}

const useMapStateInitialization = (items: MapItem[] | null) => {
  const router = useRouter()

  const go = useCallback((url: string) => router.push(url), [router])

  useEffect(() => {
    globalMapPositionsAdapter.init(globalCanvasController, items, go)
    globalCanvasController.init(globalMapPositionsAdapter)
  }, [items, go])
}

const useChangeOfPathname = () => {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/m") {
      // The pathname does not contain the @x,y,scale part
      const { innerWidth: width, innerHeight: height } = window
      globalCanvasController.resetScale(width, height)
    } else {
      globalCanvasController.parseUrlPath(pathname)
    }
  }, [pathname])
}

const useSetMouseAndTouchEvents = () => {
  useEffect(() => {
    globalCanvasController.setEvents(globalCanvasElement)
  }, [])
}

export const useMap = () => {
  const mapState = useContext(MapContext)

  useChangeOfPathname()
  useCanvasResizeEvent()
  useMapStateInitialization(mapState?.items ?? null)
  useSetMouseAndTouchEvents()
  useWindowKeydownEvents()

  return { canvasElement: globalCanvasElement }
}

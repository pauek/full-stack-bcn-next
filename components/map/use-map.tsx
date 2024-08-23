// A component to have just one in-memory copy of the map, its controller and adapter

"use client"

import { usePathname, useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { globalCanvasController, globalMapPositionsAdapter } from "./map-globals"
import { MapItem, MapSize } from "./types"

const useCanvasResizeEvent = (canvas: HTMLCanvasElement | null) => {
  const [size, setSize] = useState<MapSize>({ width: 0, height: 0 })

  // Resize event
  useEffect(() => {
    const resize = () => {
      const { innerWidth: width, innerHeight: height } = window
      setSize({ width, height })
      if (canvas) {
        canvas.width = width
        canvas.height = height
      }
    }
    resize()
    window.addEventListener("resize", resize)
    return () => window.removeEventListener("resize", resize)
  }, [canvas])

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

const useMapStateInitialization = (items: MapItem[]) => {
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

const useSetMouseAndTouchEvents = (canvas: HTMLCanvasElement | null) => {
  useEffect(() => {
    if (canvas) {
      globalCanvasController.setEvents(canvas)
    }
  }, [canvas])
}

export const useMap = (items: MapItem[]) => {
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = document.createElement("canvas")
    setCanvas(canvas)
    globalCanvasController.setCanvas(canvas)
  }, [])

  useChangeOfPathname()
  useCanvasResizeEvent(canvas)
  useMapStateInitialization(items)
  useSetMouseAndTouchEvents(canvas)
  useWindowKeydownEvents()
  return {
    canvasElement: canvas,
  }
}

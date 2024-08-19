"use client"

import { MapPositionExtended } from "@/data/schema"
import { CanvasController } from "@/lib/canvas-controller"
import { MapPositionsAdapter } from "@/lib/map-positions-adapter"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type MapSize = {
  width: number
  height: number
}

type Controller = CanvasController<MapPositionExtended>

interface Props {
  mapPositions: MapPositionExtended[]
}
export default function Map({ mapPositions }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<Controller>(
    new CanvasController(canvasRef, pathname, new MapPositionsAdapter(router, mapPositions)),
  )

  const [size, setSize] = useState<MapSize>({ width: 0, height: 0 })
  const { current: state } = stateRef

  useEffect(() => {
    state.loadItems()
    if (pathname === "/m") {
      const pageBox = document.getElementById("page-box")
      if (!pageBox) {
        throw new Error("page-box not found")
      }
      const { width, height } = pageBox.getBoundingClientRect()
      state.resetScale(width, height)
    }
  }, [size, state, pathname])

  useEffect(() => {
    const resize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }

    resize()

    window.addEventListener("resize", resize)
    return () => {
      window.removeEventListener("resize", resize)
    }
  }, [state])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => state.onKeyDown(e)
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [state])

  useEffect(() => {
    if (size.width !== 0 && size.height !== 0) {
      state.paint()
    }
  }, [size, state])

  return (
    <canvas
      ref={canvasRef}
      {...size}
      onMouseDown={(e) => state.onMouseDown(e)}
      onMouseMove={(e) => state.onMouseMove(e)}
      onMouseUp={(e) => state.onMouseUp(e)}
      onTouchStart={(e) => state.onTouchStart(e)}
      onTouchMove={(e) => state.onTouchMove(e)}
      onTouchEnd={(e) => state.onTouchEnd(e)}
      onWheel={(e) => state.onWheel(e)}
    ></canvas>
  )
}

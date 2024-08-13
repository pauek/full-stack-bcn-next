"use client"

import { actionLoadMapPositions, actionMapPositionsUpdate } from "@/actions/positions"
import { CanvasController } from "@/lib/canvas-controller"
import { MapPositionWithPiece } from "@/lib/data/db/positions"
import { pointWithinRect } from "@/lib/geometry"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

type MapSize = {
  width: number
  height: number
}

type Item = MapPositionWithPiece
type Controller = CanvasController<Item>

type Router = ReturnType<typeof useRouter>

class MapPositionsAdapter {
  router: Router

  constructor(router: any) {
    this.router = router
  }

  saveItems(positions: Item[]) {
    actionMapPositionsUpdate(positions)
      .then(
        () => console.log("Updated:", positions), // TODO: better message
      )
      .catch((e) => {
        console.error(`Error updating positions: `, e) // TODO: show user
      })
  }

  async loadItems() {
    return await actionLoadMapPositions()
  }

  paintMinimal(controller: Controller, ctx: CanvasRenderingContext2D, item: Item) {
    const { left, top, width, height } = item
    const over = pointWithinRect(controller.mouse, { left, top, width, height })
    if (controller.mode === "edit" && over) {
      ctx.fillStyle = "lightblue"
    } else if (item.level === 0) {
      ctx.fillStyle = "white"
      ctx.fillRect(left, top, width, height)
    }
  }

  paintLevel0(ctx: CanvasRenderingContext2D, item: Item) {
    const { left, top, width, height } = item
    if (item.level === 0) {
      ctx.fillStyle = "white"
    } else {
      ctx.fillStyle = "darkgray"
    }
    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 5)
    ctx.closePath()
    ctx.fill()

    ctx.font = "12px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "black"
    ctx.fillText(`${item.name}`, left + width / 2, top + height / 2)
  }

  paintLevelHigher(ctx: CanvasRenderingContext2D, item: Item) {
    const { left, top, width, height } = item
    ctx.strokeStyle = "lightgray"
    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 5)
    ctx.closePath()
    ctx.stroke()

    ctx.font = "12px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "white"
    ctx.fillText(`${item.name} - ${item.children.length}`, left + width / 2, top + 12)
  }

  paintItem(controller: Controller, ctx: CanvasRenderingContext2D, item: Item) {
    if (controller.scale < 0.2) {
      this.paintMinimal(controller, ctx, item)
    } else {
      if (item.level === 0) {
        this.paintLevel0(ctx, item)
      } else {
        this.paintLevelHigher(ctx, item)
      }
    }
  }

  clickItem(item: Item) {
    if (item.idjpath) {
      this.router.push(`/c/${item.idjpath}`)
    }
  }
}

export default function Map() {
  const router = useRouter()
  const pathname = usePathname()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<Controller>(
    new CanvasController(canvasRef, pathname, new MapPositionsAdapter(router)),
  )

  const [size, setSize] = useState<MapSize>({ width: 0, height: 0 })
  const { current: state } = stateRef

  useEffect(() => {
    state.loadItems()
    if (pathname === "/") {
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
      onMouseUp={() => state.onMouseUp(window)}
      onWheel={(e) => state.onWheel(e)}
    ></canvas>
  )
}

import { actionLoadMapPositions, actionMapPositionsUpdate } from "@/actions/positions"
import { pointWithinRect } from "./geometry"
import { MapPositionWithPiece } from "./data/db/positions"
import { CanvasController } from "./canvas-controller"
import { useRouter } from "next/navigation"

type Item = MapPositionWithPiece

type Router = ReturnType<typeof useRouter>

export class MapPositionsAdapter {
  router: Router

  constructor(router: any) {
    this.router = router
  }

  saveItems(positions: Item[]) {
    actionMapPositionsUpdate(positions)
      .then(
        () => console.log("Updated:", positions) // TODO: better message
      )
      .catch((e) => {
        console.error(`Error updating positions: `, e) // TODO: show user
      })
  }

  async loadItems() {
    return await actionLoadMapPositions()
  }

  paintMinimal(controller: CanvasController<Item>, ctx: CanvasRenderingContext2D, item: Item) {
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

  paintItem(controller: CanvasController<Item>, ctx: CanvasRenderingContext2D, item: Item) {
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

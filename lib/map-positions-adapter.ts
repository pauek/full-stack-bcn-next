import { actionMapPositionsUpdate } from "@/actions/positions"
import { MapPositionExtended } from "@/data/schema"
import { useRouter } from "next/navigation"
import { CanvasController } from "./canvas-controller"
import { pointWithinRect } from "./geometry"

type Item = MapPositionExtended

type Router = ReturnType<typeof useRouter>

export class MapPositionsAdapter {
  router: Router
  items: Item[]

  constructor(router: any, items: Item[]) {
    this.router = router
    this.items = items
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
    return this.items
  }

  paintMinimal(controller: CanvasController<Item>, ctx: CanvasRenderingContext2D, item: Item) {
    const { left, top, width, height } = item
    const over = pointWithinRect(controller.pointer, { left, top, width, height })
    if (controller.mode === "edit" && over) {
      ctx.fillStyle = "lightblue"
    } else if (item.level === 0) {
      ctx.fillStyle = "white"
      ctx.fillRect(left, top, width, height)
    }
  }

  paintLevel0(controller: CanvasController<Item>, ctx: CanvasRenderingContext2D, item: Item) {
    const { left, top, width, height } = item

    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 5)
    ctx.closePath()
    ctx.save()
    ctx.fillStyle = "white"
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
    ctx.shadowBlur = 3 * controller.scale
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 3 * controller.scale
    ctx.fill()
    ctx.restore()

    ctx.font = "12px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "black"
    ctx.fillText(`${item.name}`, left + width / 2, top + height / 2)
  }

  paintLevel1(controller: CanvasController<Item>, ctx: CanvasRenderingContext2D, item: Item) {
    const { left, top, width, height } = item

    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 5)
    ctx.closePath()
    ctx.stroke()
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
    ctx.fill()

    ctx.font = "bold 12px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "black"
    ctx.fillText(`${item.name}`, left + width / 2, top + 12)
  }

  paintLevel2(controller: CanvasController<Item>, ctx: CanvasRenderingContext2D, item: Item) {
    const { left, top, width, height } = item

    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 5)
    ctx.closePath()
    ctx.stroke()

    ctx.font = "bold 20px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#aaa"
    ctx.fillText(`${item.name.toUpperCase()}`, left + width / 2, top + 22)
  }

  paintItem(controller: CanvasController<Item>, ctx: CanvasRenderingContext2D, item: Item) {
    switch (item.level) {
      case 0:
        this.paintLevel0(controller, ctx, item)
        break
      case 1:
        this.paintLevel1(controller, ctx, item)
        break
      case 2:
        this.paintLevel2(controller, ctx, item)
        break
    }
  }

  clickItem(item: Item) {
    if (item.idpath) {
      this.router.push(`/c/${item.idpath.join("/")}`)
    }
  }
}

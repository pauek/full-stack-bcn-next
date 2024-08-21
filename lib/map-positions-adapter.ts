import { actionMapPositionsUpdate } from "@/actions/positions"
import { FileType, MapPosition } from "@/data/schema"
import { useRouter } from "next/navigation"
import { CanvasController } from "./canvas-controller"
import { pointWithinRect } from "./geometry"

type Item = MapPosition<number>

type Router = ReturnType<typeof useRouter>

export class MapPositionsAdapter {
  router: Router
  items: Item[]
  _controller: null | CanvasController<Item> = null

  constructor(router: any, items: Item[]) {
    this.router = router
    this.items = items
  }

  get controller() {
    if (!this._controller) {
      throw new Error("Controller not set")
    }
    return this._controller
  }

  setController(controller: CanvasController<Item>) {
    this._controller = controller
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
    return this.items
  }

  paintMinimal(ctx: CanvasRenderingContext2D, item: Item) {
    const { left, top, width, height } = item.rectangle
    const over = pointWithinRect(this.controller.pointer, { left, top, width, height })
    if (this.controller.mode === "edit" && over) {
      ctx.fillStyle = "lightblue"
    } else if (item.level === 0) {
      ctx.fillStyle = "white"
      ctx.fillRect(left, top, width, height)
    }
  }

  roundedRectangle(ctx: CanvasRenderingContext2D, item: Item, color: string) {
    ctx.save()

    const { left, top, width, height } = item.rectangle
    const { scale } = this.controller
    ctx.fillStyle = color
    ctx.shadowColor = "rgba(0, 0, 0, 0.1)"
    ctx.shadowBlur = 3 * scale
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 3 * scale
    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 5)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
  }

  paintExercise(ctx: CanvasRenderingContext2D, item: Item) {
    this.roundedRectangle(ctx, item, "lightblue")

    const { left, top, width, height } = item.rectangle

    ctx.font = "12px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "black"

    const name = `${item.name}`
    ctx.fillText(`${name}`, left + width / 2, top + height / 2)
  }

  paintDoc(ctx: CanvasRenderingContext2D, item: Item) {
    this.roundedRectangle(ctx, item, "white")

    const { left, top, width, height } = item.rectangle

    ctx.font = "12px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "black"

    ctx.fillText(`${item.name}`, left + width / 2, top + height / 2)
  }

  paintActivity(ctx: CanvasRenderingContext2D, item: Item) {
    if (item.kind === FileType.exercise) {
      this.paintExercise(ctx, item)
    } else if (item.kind === FileType.doc) {
      this.paintDoc(ctx, item)
    } else {
      this.roundedRectangle(ctx, item, "red")
    }
  }

  paintChapter(ctx: CanvasRenderingContext2D, item: Item) {
    const { left, top, width, height } = item.rectangle

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

  paintSession(ctx: CanvasRenderingContext2D, item: Item) {
    const { left, top, width, height } = item.rectangle

    ctx.strokeStyle = "#ddd"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 10)
    ctx.closePath()
    ctx.stroke()

    ctx.font = "18px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#aaa"
    ctx.fillText(`${item.name.toUpperCase()}`, left + width / 2, top + 18)
  }

  paintPart(ctx: CanvasRenderingContext2D, item: Item) {
    const { left, top, width, height } = item.rectangle

    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 15)
    ctx.closePath()
    ctx.stroke()

    ctx.font = "bold 24px Inter"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = "#aaa"
    ctx.fillText(`${item.name.toUpperCase()}`, left + width / 2, top + 22)
  }

  paintItem(ctx: CanvasRenderingContext2D, item: Item) {
    const paintFunction = [
      this.paintActivity.bind(this),
      this.paintChapter.bind(this),
      this.paintSession.bind(this),
      this.paintPart.bind(this),
    ]
    paintFunction[item.level](ctx, item)
  }

  clickItem(item: Item) {
    if (item.idpath) {
      this.router.push(`/c/${item.idpath.join("/")}`)
    }
  }
}

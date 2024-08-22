"use client"

import { actionMapPositionsUpdate } from "@/actions/positions"
import { FileType, MapPosition } from "@/data/schema"
import { useRouter } from "next/navigation"
import { CanvasController } from "./canvas-controller"
import { pointWithinRect } from "./geometry"
import { colorToCSS, factorFromInterval, interpolateColor } from "./utils"

type Item = MapPosition<number>

type Router = ReturnType<typeof useRouter>

const iconNames = {
  doc: "menu-book",
  exercise: "edit",
}

export class MapPositionsAdapter {
  router: Router
  items: Item[]
  _controller: null | CanvasController<Item> = null

  _icons: Map<string, HTMLImageElement> = new Map()

  constructor(router: any, items: Item[]) {
    this.router = router
    this.items = items

    this.loadIcons()
  }

  loadIcons() {
    // TODO(pauek): make sure images are loaded before rendering
    for (const filename of Object.values(iconNames)) {
      const icon = new Image()
      icon.src = `/icons/${filename}.svg`
      this._icons.set(filename, icon)
    }
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


  sizeAndMargin(item: Item) {
    const margin = 0.1 * item.rectangle.height
    const size = 0.8 * item.rectangle.height
    return { size, margin }
  }

  computeItemBounds(ctx: CanvasRenderingContext2D, item: Item, text: string) {
    ctx.font = "10px Inter"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    const textWidth = ctx.measureText(text)

    // Compute bounds: recompute width and change the original rectangle (!)
    const { size, margin } = this.sizeAndMargin(item)
    item.rectangle.width = 3 * margin + size + 2 * margin + textWidth.width + 3 * margin
    item.rectangle.height = 20 // Force height to be 20 now...
  }

  paintItemIcon(ctx: CanvasRenderingContext2D, item: Item, iconName: string) {
    const { left, top, height } = item.rectangle
    const size = 0.8 * height
    const margin = 0.1 * height
    const icon = this._icons.get(iconName)
    if (icon === undefined) {
      console.warn(`Icon not available yet: ${iconName}`)
      return
    }
    ctx.save()
    ctx.globalAlpha = 0.65
    ctx.drawImage(icon, left + 3 * margin, top + margin, size, size)
    ctx.restore()
  }

  paintItemText(ctx: CanvasRenderingContext2D, item: Item, text: string) {
    const f = factorFromInterval(this.controller.scale, 0.5, 2.0)
    const light = { r: 0, g: 0, b: 0, a: 0.1 }
    const dark = { r: 0, g: 0, b: 0, a: 1 }
    const cssColor = colorToCSS(interpolateColor(light, dark, f))

    ctx.font = "9px Inter"
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillStyle = cssColor

    const { left, top, height } = item.rectangle
    const { size, margin } = this.sizeAndMargin(item)
    ctx.fillText(text, left + size + 5 * margin, top + height / 2)
  }

  paintDoc(ctx: CanvasRenderingContext2D, item: Item) {
    const text = `Reading`
    this.computeItemBounds(ctx, item, text)
    this.controller.itemRectangle(ctx, item.rectangle, "white")
    this.paintItemIcon(ctx, item, iconNames.doc)
    this.paintItemText(ctx, item, text)
  }

  paintExercise(ctx: CanvasRenderingContext2D, item: Item) {
    const text = `Practice`
    this.computeItemBounds(ctx, item, text)
    this.controller.itemRectangle(ctx, item.rectangle, "lightblue")
    this.paintItemIcon(ctx, item, iconNames.exercise)
    this.paintItemText(ctx, item, text)
  }


  paintActivity(ctx: CanvasRenderingContext2D, item: Item) {
    if (item.kind === FileType.exercise) {
      this.paintExercise(ctx, item)
    } else if (item.kind === FileType.doc) {
      this.paintDoc(ctx, item)
    } else {
      this.controller.itemRectangle(ctx, item.rectangle, "red")
    }
  }

  paintChapter(ctx: CanvasRenderingContext2D, item: Item) {
    const fontSize = 12
    const { left, top, width, height } = item.rectangle

    ctx.strokeStyle = "#ccc"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 5)
    ctx.closePath()
    ctx.stroke()
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)"
    ctx.fill()

    const f = factorFromInterval(this.controller.scale, 0.5, 2.0)
    const light = { r: 0, g: 0, b: 0, a: 0.1 }
    const dark = { r: 0, g: 0, b: 0, a: 1 }
    const cssColor = colorToCSS(interpolateColor(light, dark, f))

    ctx.font = `bold ${fontSize}px Inter`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = cssColor
    ctx.fillText(`${item.name}`, left + width / 2, top + fontSize)
  }

  paintSession(ctx: CanvasRenderingContext2D, item: Item) {
    const f = factorFromInterval(this.controller.scale, 0.3, 1.5)
    const light = { r: 240, g: 240, b: 240, a: 1 }
    const dark = { r: 0, g: 0, b: 0, a: 1 }
    const cssColor = colorToCSS(interpolateColor(light, dark, f))

    const fontSize = 18
    const { left, top, width, height } = item.rectangle

    ctx.strokeStyle = cssColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 10)
    ctx.closePath()
    ctx.stroke()

    ctx.font = `${fontSize}px Inter`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = cssColor
    ctx.fillText(`${item.name.toUpperCase()}`, left + width / 2, top + height / 2)
  }

  paintPart(ctx: CanvasRenderingContext2D, item: Item) {
    const f = factorFromInterval(this.controller.scale, 0.3, 1.2)
    const light = { r: 240, g: 240, b: 240, a: 1 }
    const dark = { r: 0, g: 0, b: 0, a: 1 }
    const cssColor = colorToCSS(interpolateColor(dark, light, f))

    const fontSize = 64
    const { left, top, width, height } = item.rectangle

    ctx.strokeStyle = cssColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(left, top, width, height, 15)
    ctx.closePath()
    ctx.stroke()

    ctx.font = `bold ${fontSize}px Inter`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillStyle = cssColor
    ctx.fillText(`${item.name.toUpperCase()}`, left + width / 2, top + height / 2)
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

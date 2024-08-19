import {
  checkRectangle,
  eventPoint,
  getKnobPositions,
  IRectangle,
  Point,
  pointToString,
  pointWithinCircle,
  pointWithinRect,
  ptAdd,
  ptDistance,
  ptMul,
  ptSub,
  rectangleEnlarge,
  rectangleListUnion,
  rectIntersectsRect,
} from "@/lib/geometry"
import { RefObject } from "react"
import { clamp, setUnion, snap } from "./utils"

export const MAP_MAX_WIDTH = 4000
export const MAP_MAX_HEIGHT = 4000
export const MIN_SCALE = 0.24
export const MAX_SCALE = 2

interface CanvasAdapter<ItemType extends RectangularItem> {
  loadItems: () => Promise<ItemType[]>
  saveItems: (items: ItemType[]) => void
  paintItem: (
    ctrl: CanvasController<ItemType>,
    ctx: CanvasRenderingContext2D,
    item: ItemType,
  ) => void
  clickItem(item: ItemType): void
}

interface RectangularItem extends IRectangle {
  level: number
  children: number[]
}

export class CanvasController<ItemType extends RectangularItem> {
  mode: "view" | "edit" = "view"

  adapter: CanvasAdapter<ItemType>
  canvasRef: RefObject<HTMLCanvasElement>
  items: ItemType[]

  pointer: Point
  scale: number
  origin: Point

  panning: null | {
    click: Point
    origin: Point
  } = null

  rubberbanding: null | {
    click: Point
    rect: IRectangle
  } = null

  dragging: null | {
    click: Point
    origins: Point[]
    updatedIndices: Set<number>
  } = null

  resizing: null | {
    click: Point
    initial: ItemType
    item: ItemType
    knob: number
    updatedIndices: Set<number>
  } = null

  zooming: null | {
    distInitial: number
  } = null

  overRect: ItemType | null = null
  selected: ItemType[] = []

  debug: boolean = false

  constructor(
    ref: RefObject<HTMLCanvasElement>,
    urlPath: string,
    adapter: CanvasAdapter<ItemType>,
  ) {
    this.adapter = adapter
    this.canvasRef = ref
    this.items = []

    // default values
    this.scale = 1
    this.origin = { x: 0, y: 0 }

    this.parseUrlPath(urlPath)

    this.pointer = { x: 0, y: 0 }
    this.panning = null
  }

  scaleToUrl() {
    window.history.replaceState(null, "", `/m/${this.getUrlPath()}`)
  }

  getCanvas() {
    const canvas = this.canvasRef.current
    if (!canvas) {
      throw new Error(`Canvas is null!`)
    }
    return canvas
  }

  getModelBounds() {
    const { width, height } = this.getCanvas()
    return this.rectClientToModel({ left: 0, top: 0, width, height })
  }

  getClientBounds() {
    return this.rectModelToClient({
      left: 0,
      top: 0,
      width: MAP_MAX_WIDTH,
      height: MAP_MAX_HEIGHT,
    })
  }

  resetScale(width: number, height: number) {
    const xscale = width / MAP_MAX_WIDTH
    const yscale = height / MAP_MAX_HEIGHT
    this.scale = Math.min(xscale, yscale)
    const xwidth = MAP_MAX_WIDTH * this.scale
    const xheight = MAP_MAX_HEIGHT * this.scale
    this.origin = { x: (width - xwidth) / 2, y: (height - xheight) / 2 }
    this.scaleToUrl()
  }

  getUrlPath() {
    const { origin, scale } = this
    return `@${origin.x.toFixed(0)},${origin.y.toFixed(0)},${scale.toFixed(6)}`
  }

  parseUrlPath(pathname: string) {
    const [_, state] = pathname.split("@")
    if (!state) {
      return
    }

    const [_x, _y, _s] = state.split(",")
    const x = Number(_x)
    const y = Number(_y)
    const s = Number(_s)
    if (isNaN(x) || isNaN(y) || isNaN(s)) {
      return
    }
    this.scale = s
    this.origin = { x, y }
  }

  async loadItems() {
    this.items = await this.adapter.loadItems()
    this.paint()
  }

  clientToModel(pclient: Point) {
    return ptMul(ptSub(pclient, this.origin), 1 / this.scale)
  }

  modelToClient(pmodel: Point) {
    return ptAdd(ptMul(pmodel, this.scale), this.origin)
  }

  rectClientToModel(rect: IRectangle): IRectangle {
    const tl = { x: rect.left, y: rect.top }
    const br = { x: rect.left + rect.width, y: rect.top + rect.height }
    const { x: left, y: top } = this.clientToModel(tl)
    const { x: right, y: bottom } = this.clientToModel(br)
    return { ...rect, left, top, width: right - left, height: bottom - top }
  }

  rectModelToClient(rect: IRectangle): IRectangle {
    const tl = { x: rect.left, y: rect.top }
    const br = { x: rect.left + rect.width, y: rect.top + rect.height }
    const { x: left, y: top } = this.modelToClient(tl)
    const { x: right, y: bottom } = this.modelToClient(br)
    return { ...rect, left, top, width: right - left, height: bottom - top }
  }

  updateOver() {
    this.overRect =
      this.items.findLast((item) => item.level === 0 && pointWithinRect(this.pointer, item)) || null
  }

  updateParents(): number[] {
    const updated: number[] = []
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]
      if (item.level > 0 && checkRectangle(item)) {
        const childrenRects = item.children.map((index) => this.items[index]).filter(checkRectangle)
        const outline = rectangleEnlarge(rectangleListUnion(childrenRects), 10)

        // Space for the title
        if (item.level === 1) {
          outline.top -= 16
          outline.height += 16
        } else if (item.level === 2) {
          outline.top -= 32
          outline.height += 32
        }

        const { left, top, width, height } = outline
        if (
          item.left !== left ||
          item.top !== top ||
          item.width !== width ||
          item.height !== height
        ) {
          item.left = left
          item.top = top
          item.width = width
          item.height = height
          updated.push(i)
        }
      }
    }
    return updated
  }

  paintGrid(ctx: CanvasRenderingContext2D, bounds: IRectangle) {
    const left = bounds.left - (bounds.left % 10)
    for (let _x = 0; _x <= bounds.width; _x += 10) {
      const x = _x + left
      ctx.lineWidth = 0.2
      ctx.strokeStyle = "rgba(20, 20, 20, 0.1)"
      ctx.beginPath()
      ctx.moveTo(x, bounds.top)
      ctx.lineTo(x, bounds.top + bounds.height)
      ctx.stroke()
    }
    const top = bounds.top - (bounds.top % 10)
    for (let _y = 0; _y < bounds.height; _y += 10) {
      const y = _y + top
      ctx.lineWidth = 0.2
      ctx.strokeStyle = "rgba(20, 20, 20, 0.1)"
      ctx.beginPath()
      ctx.moveTo(bounds.left, y)
      ctx.lineTo(bounds.left + bounds.width, y)
      ctx.stroke()
    }
  }

  mouseWithinKnob(rect: ItemType): number {
    const knobPositions = getKnobPositions(rect)
    for (let i = 0; i < knobPositions.length; i++) {
      const { x, y } = knobPositions[i]
      if (pointWithinCircle(this.pointer, { x, y }, 10)) {
        return i + 1
      }
    }
    return -1
  }

  paintSelected(ctx: CanvasRenderingContext2D, rect: ItemType) {
    const { left, top, width, height } = rect
    if (this.scale < 0.2) {
      ctx.fillStyle = "blue"
      ctx.fillRect(left, top, width, height)
    } else {
      ctx.strokeStyle = "blue"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(left, top, width, height, 5)
      ctx.closePath()
      ctx.stroke()
    }
  }

  paintKnobs(ctx: CanvasRenderingContext2D, rect: ItemType) {
    const paintKnob = (x: number, y: number, knob: number) => {
      const knobWidth = 8

      let left = x - knobWidth / 2
      let top = y - knobWidth / 2
      let width = knobWidth
      let height = knobWidth

      if (knob === 1 || knob === 3) {
        top -= knobWidth
        height *= 3
      } else if (knob === 2 || knob === 4) {
        left -= knobWidth
        width *= 3
      }

      const knobRect = { left, top, width, height }
      const mouseInside = pointWithinRect(this.pointer, knobRect)
      const dragging = this.resizing && this.resizing.knob === knob

      ctx.beginPath()
      ctx.roundRect(left, top, width, height, knobWidth / 2)
      ctx.closePath()
      ctx.fillStyle = dragging || mouseInside ? "white" : "blue"
      ctx.fill()
    }

    const knobPositions = getKnobPositions(rect)
    for (let i = 0; i < knobPositions.length; i++) {
      const { x, y } = knobPositions[i]
      paintKnob(x, y, i + 1)
    }
  }

  paintOverRect(ctx: CanvasRenderingContext2D, rect: ItemType) {
    const { left, top, width, height } = rect
    if (this.scale < 0.2) {
      ctx.fillStyle = "rgba(0, 0, 255, 0.6)"
      ctx.fillRect(left, top, width, height)
    } else {
      if (this.mode === "edit") {
        ctx.strokeStyle = "blue"
        ctx.lineWidth = 2
      } else {
        ctx.strokeStyle = "black"
        ctx.lineWidth = 1
      }
      ctx.beginPath()
      ctx.roundRect(left, top, width, height, 5)
      ctx.closePath()
      ctx.stroke()
    }
  }

  paintRubberband(ctx: CanvasRenderingContext2D, rect: IRectangle) {
    ctx.strokeStyle = "blue"
    ctx.lineWidth = 2
    ctx.strokeRect(rect.left, rect.top, rect.width, rect.height)
  }

  paintDebugInfo(ctx: CanvasRenderingContext2D) {
    showText(ctx, `mode:     ${this.mode}`, 0, 0)
    showText(ctx, `scale:    ${this.scale.toFixed(6)}`, 1, 0)
    showText(ctx, `origin:   ${pointToString(this.origin)}`, 2, 0)
    showText(ctx, `mouse:    ${pointToString(this.pointer)}`, 3, 0)

    const { left, top, width, height } = this.getClientBounds()
    showText(
      ctx,
      `bounds:   ${left.toFixed(0)}, ${top.toFixed(0)}, ${width.toFixed(0)}, ${height.toFixed(0)}`,
      4,
      0,
    )
  }

  clearBackground(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, width, height)
  }

  paintBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#fafafa"
    ctx.fillRect(0, 0, MAP_MAX_WIDTH, MAP_MAX_HEIGHT)
  }

  paintEditMode(ctx: CanvasRenderingContext2D, bounds: IRectangle) {
    ctx.strokeStyle = "red"
    const lw = 5 / this.scale
    ctx.lineWidth = lw
    ctx.strokeRect(bounds.left + lw / 2, bounds.top + lw / 2, bounds.width - lw, bounds.height - lw)
  }

  paintItems(ctx: CanvasRenderingContext2D, bounds: IRectangle) {
    for (let i = 0; i < this.items.length; i++) {
      const rect = this.items[i]
      if (rectIntersectsRect(rect, bounds)) {
        this.adapter.paintItem(this, ctx, this.items[i])
      }
    }
  }

  paint() {
    const canvas = this.canvasRef.current
    if (!canvas) {
      return
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error(`Canvas 2D context is null!`)
    }

    const { scale, origin } = this

    this.clearBackground(ctx)

    ctx.save()
    ctx.translate(origin.x, origin.y)
    ctx.scale(scale, scale)

    this.paintBackground(ctx)

    const bounds = this.getModelBounds()

    if (scale > 1 && this.mode === "edit") {
      this.paintGrid(ctx, bounds)
    }

    this.paintItems(ctx, bounds)

    if (this.selected.length > 0) {
      for (const rect of this.selected) {
        this.paintSelected(ctx, rect)
      }
      if (this.selected.length === 1) {
        this.paintKnobs(ctx, this.selected[0])
      }
    } else if (this.overRect) {
      this.paintOverRect(ctx, this.overRect)
    }

    if (this.mode === "edit") {
      this.paintEditMode(ctx, bounds)
    }

    ctx.restore()

    if (this.rubberbanding) {
      this.paintRubberband(ctx, this.rubberbanding.rect)
    }
    if (this.debug) {
      this.paintDebugInfo(ctx)
    }
  }

  // Panning

  startPanning(point: Point) {
    this.selected = []
    this.dragging = null
    this.panning = { click: point, origin: { ...this.origin } }
  }

  clampOrigin() {
    // Limit the origin
    const { width, height } = this.getCanvas()
    const bounds = this.getClientBounds()

    const xfree = width - bounds.width
    if (xfree > 0) {
      if (this.origin.x < xfree / 2) {
        this.origin.x = xfree / 2
      } else if (this.origin.x > width - bounds.width - xfree / 2) {
        this.origin.x = width - bounds.width - xfree / 2
      }
    } else {
      if (this.origin.x > 100) {
        this.origin.x = 100
      } else if (this.origin.x < width - 100) {
        this.origin.x = width - 100
      }
    }

    const yfree = height - bounds.height
    if (yfree > 0) {
      if (this.origin.y < yfree / 2) {
        this.origin.y = yfree / 2
      } else if (this.origin.y > height - bounds.height - yfree / 2) {
        this.origin.y = height - bounds.height - yfree / 2
      }
    }
  }

  doPanning(point: Point) {
    if (!this.panning) {
      return
    }

    this.overRect = null
    const { click, origin } = this.panning
    const diff = ptSub(point, click)
    this.origin = ptAdd(origin, diff)
    // this.clampOrigin();
  }

  // Dragging

  startDragging(click: Point) {
    const [first] = this.selected
    if (first) {
      this.dragging = {
        click,
        origins: this.selected.map((rect) => ({ x: rect.left, y: rect.top })),
        updatedIndices: new Set<number>(),
      }
    }
  }

  doDragging(point: Point) {
    if (!this.dragging || this.selected.length === 0) {
      return
    }

    const { click, origins } = this.dragging
    const clientDiff = ptSub(point, click)

    for (let i = 0; i < this.selected.length; i++) {
      const item = this.selected[i]
      const origin = origins[i]
      item.left = snap(origin.x + clientDiff.x / this.scale, 10)
      item.top = snap(origin.y + clientDiff.y / this.scale, 10)
    }

    const updated = this.updateParents()
    this.dragging.updatedIndices = setUnion(this.dragging.updatedIndices, updated)
  }

  endDragging() {
    if (!this.dragging || this.selected.length === 0) {
      return
    }
    const updatedIndices = this.updateParents()
    this.dragging.updatedIndices = setUnion(this.dragging.updatedIndices, updatedIndices)
    const updated: ItemType[] = []
    for (const index of this.dragging.updatedIndices) {
      updated.push(this.items[index])
    }
    this.adapter.saveItems([...this.selected, ...updated])
    this.dragging = null
  }

  // Resizing

  startResizing(click: Point, knob: number) {
    if (this.selected.length === 0) {
      return
    }
    const rect = this.selected[0]
    this.resizing = {
      click,
      initial: { ...rect },
      item: rect,
      knob,
      updatedIndices: new Set<number>(),
    }
  }

  doResizing(point: Point) {
    if (!this.resizing) {
      return
    }

    const { click, initial, item: rect, knob } = this.resizing
    const clientDiff = ptSub(point, click)
    const modelDiff = ptMul(clientDiff, 1 / this.scale)
    switch (knob) {
      case 1: {
        // left
        rect.left = snap(initial.left + modelDiff.x, 10)
        rect.width = snap(initial.width - modelDiff.x, 10)
        break
      }
      case 2: {
        // top
        rect.top = snap(initial.top + modelDiff.y, 10)
        rect.height = snap(initial.height - modelDiff.y, 10)
        break
      }
      case 3: {
        // right
        rect.width = snap(initial.width + modelDiff.x, 10)
        break
      }
      case 4: {
        // bottom
        rect.height = snap(initial.height + modelDiff.y, 10)
        break
      }
    }

    const updated = this.updateParents()
    this.resizing.updatedIndices = setUnion(this.resizing.updatedIndices, updated)
  }

  endResizing() {
    if (!this.resizing) {
      return
    }
    const updatedIndices = this.updateParents()
    this.resizing.updatedIndices = setUnion(this.resizing.updatedIndices, updatedIndices)
    const updated: ItemType[] = []
    for (const index of this.resizing.updatedIndices) {
      updated.push(this.items[index])
    }
    this.adapter.saveItems([this.resizing.item, ...updated])
    this.resizing = null
  }

  // Rubberbanding

  startRubberbanding(point: Point) {
    const { x, y } = point
    this.rubberbanding = {
      click: { x, y },
      rect: { left: x, top: y, width: 0, height: 0 },
    }
  }

  doRubberbanding(point: Point) {
    if (!this.rubberbanding) {
      return
    }

    const { x: x1, y: y1 } = this.rubberbanding.click
    const { x: x2, y: y2 } = point
    this.rubberbanding.rect = {
      left: Math.min(x1, x2),
      top: Math.min(y1, y2),
      width: Math.abs(x1 - x2),
      height: Math.abs(y1 - y2),
    }
    const rubberbandModel = this.rectClientToModel(this.rubberbanding.rect)
    this.selected = this.items.filter(
      (item) => item.level === 0 && rectIntersectsRect(item, rubberbandModel),
    )
  }

  endRubberbanding() {
    if (!this.rubberbanding) {
      return
    }

    const rubberbandModel = this.rectClientToModel(this.rubberbanding.rect)
    this.selected = this.items.filter(
      (item) => item.level === 0 && rectIntersectsRect(item, rubberbandModel),
    )
    this.rubberbanding = null
  }

  // Abstract Events

  onMouseOrTouchDown(point: Point, shiftKey: boolean) {
    if (this.selected.length > 0) {
      const knob = this.mouseWithinKnob(this.selected[0])
      if (knob != -1) {
        this.startResizing(point, knob)
      } else if (this.selected.some((rect) => pointWithinRect(this.pointer, rect))) {
        this.startDragging(point)
      } else if (this.overRect) {
        if (shiftKey) {
          this.selected.push(this.overRect)
        } else {
          this.selected = [this.overRect]
          this.startDragging(point)
        }
      } else {
        this.startRubberbanding(point)
      }
    } else if (this.overRect) {
      if (this.mode === "edit") {
        this.selected = [this.overRect]
        this.startDragging(point)
      } else {
        this.adapter.clickItem(this.overRect)
      }
    } else {
      if (this.mode === "view") {
        this.startPanning(point)
      } else {
        this.startRubberbanding(point)
      }
    }
    this.paint()
  }

  onMouseOrTouchMove(point: Point) {
    if (this.rubberbanding) {
      this.doRubberbanding(point)
    } else if (this.resizing) {
      this.doResizing(point)
    } else if (this.dragging) {
      this.doDragging(point)
    } else if (this.panning) {
      this.doPanning(point)
    } else {
      this.updateOver()
    }
    this.pointer = this.clientToModel(point)
    if (this.canvasRef.current) {
      this.canvasRef.current.style.cursor = this.overRect ? "pointer" : "auto"
    }
    this.paint()
  }

  onMouseOrTouchUp() {
    if (this.rubberbanding) {
      this.endRubberbanding()
    } else if (this.resizing) {
      this.endResizing()
    } else if (this.dragging) {
      this.endDragging()
    } else if (this.panning) {
      this.panning = null
      this.scaleToUrl()
      this.updateOver()
    }
    this.paint()
  }

  // Mouse events

  onMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    this.onMouseOrTouchDown(eventPoint(event), event.shiftKey)
  }

  onMouseMove(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    this.onMouseOrTouchMove(eventPoint(event))
  }

  onMouseUp(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    this.onMouseOrTouchUp()
  }

  /* We have to implement ourselves the pinch-to-zoom feature 
     using the number of touch points and the distance between them */

  onTouchStart(event: React.TouchEvent<HTMLCanvasElement>) {
    this.updateOver()
    if (event.touches.length === 1) {
      this.onMouseOrTouchDown(eventPoint(event.touches[0]), false)
    } else if (event.touches.length === 2) {
      const f1 = event.touches[0] // finger 1
      const f2 = event.touches[1]
      this.zooming = {
        distInitial: ptDistance(eventPoint(f1), eventPoint(f2)),
      }
    }
  }

  onTouchMove(event: React.TouchEvent<HTMLCanvasElement>) {
    if (this.zooming) {
      if (event.touches.length === 2) {
        const f1 = event.touches[0]
        const f2 = event.touches[1]
        const dist = ptDistance(eventPoint(f1), eventPoint(f2))
        const { distInitial } = this.zooming
        this.scale = clamp(this.scale * (dist / distInitial), MIN_SCALE, MAX_SCALE)
      }
    } else if (event.touches.length === 1) {
      this.onMouseOrTouchMove(eventPoint(event.touches[0]))
    }
  }

  onTouchEnd(event: React.TouchEvent<HTMLCanvasElement>) {
    this.onMouseOrTouchUp()
    this.zooming = null
  }

  // Mouse Wheel (zoom on desktop)

  onWheel(event: React.WheelEvent<HTMLCanvasElement>) {
    let dscale = 1 - event.deltaY / 1000
    let newScale = clamp(this.scale * dscale, MIN_SCALE, MAX_SCALE)
    dscale = newScale / this.scale

    const clientZoomCenter = eventPoint(event)
    const diff = ptSub(clientZoomCenter, this.origin)
    const scaledDiff = ptMul(diff, dscale)
    this.origin = ptSub(clientZoomCenter, scaledDiff)
    // this.clampOrigin();
    this.scale *= dscale
    this.scaleToUrl()
    this.paint()
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === "d") {
      this.debug = !this.debug
      this.paint()
    } else if (event.key === "Escape") {
      if (this.mode === "edit") {
        this.mode = "view"
        this.selected = []
      } else {
        this.mode = "edit"
      }
      this.paint()
    }
  }
}

const showText = (ctx: CanvasRenderingContext2D, str: string, lin: number, col: number) => {
  ctx.textBaseline = "middle"
  ctx.fillStyle = "white"
  ctx.font = "12px monospace"
  ctx.fillText(str, 6 * col + 6, 16 * lin + 16)
}

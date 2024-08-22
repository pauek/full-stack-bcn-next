import {
  checkRectangle,
  eventPoint,
  getKnobPositions,
  IRectangle,
  Point,
  pointToString,
  pointWithinRect,
  ptAdd,
  ptDistance,
  ptMul,
  ptSub,
  rectangleEnlarge,
  rectangleListUnion,
  rectIntersectsRect,
} from "@/lib/geometry"
import { clamp, setUnion, snap } from "./utils"
import { globalCanvasElement } from "@/components/map/canvas"

export const MAP_MAX_WIDTH = 4000
export const MAP_MAX_HEIGHT = 4000
export const MIN_SCALE = 0.25
export const MAX_SCALE = 3
const KNOB_WIDTH = 8

interface CanvasAdapter<ItemType extends RectangularItem> {
  loadItems: () => Promise<ItemType[]>
  saveItems: (items: ItemType[]) => void
  paintItem: (ctx: CanvasRenderingContext2D, item: ItemType) => void
  clickItem(item: ItemType): void
}

interface RectangularItem {
  rectangle: IRectangle
  level: number
  children?: number[]
}

export class CanvasController<ItemType extends RectangularItem> {
  // Things that have to be initialized
  _adapter: CanvasAdapter<ItemType> | null = null
  _canvas: HTMLCanvasElement | null = null
  
  // Internal fields
  mode: "view" | "edit" = "view"
  items: ItemType[] = []
  pointer: Point = { x: 0, y: 0 }
  scale: number = 1
  origin: Point = { x: 0, y: 0 }
  overRect: ItemType | null = null
  selected: Set<ItemType> = new Set()
  debug: boolean = false

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
    origins: Map<ItemType, Point>
    updatedIndices: Set<number>
  } = null

  resizing: null | {
    click: Point
    initial: IRectangle
    item: ItemType
    knob: number
    updatedIndices: Set<number>
  } = null

  zooming: null | {
    distInitial: number
  } = null

  ///

  constructor() {
    console.log(`------- Canvas Controller CONSTRUCTOR -------`)
    this._canvas = globalCanvasElement
  }

  init(adapter: CanvasAdapter<ItemType>) {
    this._adapter = adapter
    this.loadItems()
  }

  setEvents(canvas: HTMLCanvasElement) {
    canvas.addEventListener("mousedown", (e) => this.onMouseDown(e))
    canvas.addEventListener("mousemove", (e) => this.onMouseMove(e))
    canvas.addEventListener("mouseup", (e) => this.onMouseUp(e))
    canvas.addEventListener("touchstart", (e) => this.onTouchStart(e))
    canvas.addEventListener("touchmove", (e) => this.onTouchMove(e))
    canvas.addEventListener("touchend", (e) => this.onTouchEnd(e))
    canvas.addEventListener("wheel", (e) => this.onWheel(e))
  }

  get adapter() {
    if (this._adapter === null) {
      throw new Error(`Uninitialized adapter!`)
    }
    return this._adapter
  }

  get canvas() {
    if (this._canvas === null) {
      throw new Error(`Canvas is null!`)
    }
    return this._canvas
  }


  scaleToUrl() {
    window.history.replaceState(null, "", `/m/${this.getUrlPath()}`)
  }

  getModelBounds() {
    const { width, height } = this.canvas
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
      this.items.findLast(
        (item) => item.level === 0 && pointWithinRect(this.pointer, item.rectangle)
      ) || null
  }

  updateParents(): number[] {
    const updated: number[] = []
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]
      if (item.level > 0 && checkRectangle(item.rectangle)) {
        // Do not update if there are no children
        if (!item.children || item.children.length === 0) {
          continue
        }

        const childrenRects = item.children
          .map((index) => this.items[index].rectangle)
          .filter(checkRectangle)

        const outline = rectangleEnlarge(rectangleListUnion(childrenRects), 10)

        let { left, top, width, height } = outline

        // For the header of chapters (no-one else)
        if (item.level === 1 /* Chapter */) {
          top -= 12
          height += 12
        }

        if (
          item.rectangle.left !== left ||
          item.rectangle.top !== top ||
          item.rectangle.width !== width ||
          item.rectangle.height !== height
        ) {
          item.rectangle = { left, top, width, height }
          updated.push(i)
        }
      }
    }
    return updated
  }

  itemRectangle(ctx: CanvasRenderingContext2D, item: IRectangle, fillStyle: string) {
    ctx.save()

    const { left, top, width, height } = item
    ctx.fillStyle = fillStyle
    ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
    ctx.shadowBlur = 2 * this.scale
    ctx.shadowOffsetX = 0
    ctx.shadowOffsetY = 2 * this.scale

    ctx.beginPath()
    ctx.roundRect(left, top, width, height, height / 2)
    ctx.closePath()
    ctx.fill()

    ctx.restore()
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

  knobRectangle(x: number, y: number, knob: number): IRectangle {
    let left = x - KNOB_WIDTH / 2
    let top = y - KNOB_WIDTH / 2
    let width = KNOB_WIDTH
    let height = KNOB_WIDTH

    if (knob === 1 || knob === 3) {
      top -= KNOB_WIDTH
      height *= 3
    } else if (knob === 2 || knob === 4) {
      left -= KNOB_WIDTH
      width *= 3
    }

    return { left, top, width, height }
  }

  mouseWithinKnob(item: ItemType): number {
    return -1 // Resizing is disabled for now
    const positions = getKnobPositions(item.rectangle)
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i]
      const { x, y } = pos
      const knobRect = this.knobRectangle(x, y, i + 1)
      if (pointWithinRect(this.pointer, knobRect)) {
        return i + 1
      }
    }
    return -1
  }

  paintSelected(ctx: CanvasRenderingContext2D, item: ItemType) {
    const { left, top, width, height } = item.rectangle
    if (this.scale < 0.2) {
      ctx.fillStyle = "blue"
      ctx.fillRect(left, top, width, height)
    } else {
      ctx.strokeStyle = "blue"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(left, top, width, height, height / 2)
      ctx.closePath()
      ctx.stroke()
    }
  }

  paintKnobs(ctx: CanvasRenderingContext2D, item: ItemType) {
    const paintKnob = (x: number, y: number, knob: number) => {
      const knobRect = this.knobRectangle(x, y, knob)

      const mouseInside = pointWithinRect(this.pointer, knobRect)
      const dragging = this.resizing && this.resizing.knob === knob

      const { left, top, width, height } = knobRect
      ctx.beginPath()
      ctx.roundRect(left, top, width, height, KNOB_WIDTH / 2)
      ctx.closePath()
      ctx.fillStyle = dragging || mouseInside ? "white" : "blue"
      ctx.fill()
    }

    const knobPositions = getKnobPositions(item.rectangle)
    for (let i = 0; i < knobPositions.length; i++) {
      const { x, y } = knobPositions[i]
      paintKnob(x, y, i + 1)
    }
  }

  paintOverRect(ctx: CanvasRenderingContext2D, item: ItemType) {
    const outlineDistance = 1.5
    const { left, top, width, height } = rectangleEnlarge(item.rectangle, outlineDistance)
    if (this.scale < 0.2) {
      ctx.fillStyle = "rgba(0, 0, 255, 0.6)"
      ctx.fillRect(left, top, width, height)
    } else {
      if (this.mode === "edit") {
        ctx.strokeStyle = "blue"
        ctx.lineWidth = 1
      } else {
        ctx.strokeStyle = "black"
        ctx.lineWidth = 1
      }
      ctx.beginPath()
      ctx.roundRect(left, top, width, height, height / 2)
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
    showText(ctx, `mode:   ${this.mode}`, 0, 0)
    showText(ctx, `scale:  ${this.scale.toFixed(6)}`, 1, 0)
    showText(ctx, `origin: ${pointToString(this.origin)}`, 2, 0)
    showText(ctx, `mouse:  ${pointToString(this.pointer)}`, 3, 0)

    const { left, top, width, height } = this.getClientBounds()
    showText(
      ctx,
      `bounds: ${left.toFixed(0)}, ${top.toFixed(0)}, ${width.toFixed(0)}, ${height.toFixed(0)}`,
      4,
      0
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
      const item = this.items[i]
      if (rectIntersectsRect(item.rectangle, bounds)) {
        this.adapter.paintItem(ctx, this.items[i])
      }
    }
  }

  paint() {
    if (!this.canvas) {
      return
    }
    const ctx = this.canvas.getContext("2d")
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

    if (this.selected.size > 0) {
      for (const rect of this.selected) {
        this.paintSelected(ctx, rect)
      }
      // Resizing is disabled for now
      // if (this.selected.length === 1) {
      //   this.paintKnobs(ctx, this.selected[0])
      // }
    }

    if (this.overRect) {
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
    this.selected.clear()
    this.dragging = null
    this.panning = { click: point, origin: { ...this.origin } }
  }

  clampOrigin() {
    // Limit the origin
    const { width, height } = this.canvas
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
    const updatedIndices = new Set<number>()
    const origins: Map<ItemType, Point> = new Map()
    for (const item of this.selected) {
      origins.set(item, {
        x: item.rectangle.left,
        y: item.rectangle.top,
      })
    }

    if (first) {
      this.dragging = { click, origins, updatedIndices }
    }
  }

  doDragging(point: Point) {
    if (!this.dragging || this.selected.size === 0) {
      return
    }

    const { click, origins } = this.dragging
    const clientDiff = ptSub(point, click)

    for (const item of this.selected) {
      const rectangle = item.rectangle
      const origin = origins.get(item)!
      rectangle.left = snap(origin.x + clientDiff.x / this.scale, 10)
      rectangle.top = snap(origin.y + clientDiff.y / this.scale, 10)
    }

    const updated = this.updateParents()
    this.dragging.updatedIndices = setUnion(this.dragging.updatedIndices, updated)
  }

  endDragging() {
    if (!this.dragging || this.selected.size === 0) {
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

  // Resizing (WARNING: RESIZING IS DISABLED FOR NOW)

  startResizing(click: Point, knob: number) {
    if (this.selected.size === 0) {
      return
    }
    const [first] = this.selected.values()
    this.resizing = {
      click,
      initial: { ...first.rectangle }, // copy!
      item: first,
      knob,
      updatedIndices: new Set<number>(),
    }
  }

  doResizing(point: Point) {
    if (!this.resizing) {
      return
    }

    const {
      click,
      initial,
      item: { rectangle },
      knob,
    } = this.resizing
    const clientDiff = ptSub(point, click)
    const modelDiff = ptMul(clientDiff, 1 / this.scale)
    switch (knob) {
      case 1: {
        // left
        rectangle.left = snap(initial.left + modelDiff.x, 10)
        rectangle.width = snap(initial.width - modelDiff.x, 10)
        break
      }
      case 2: {
        // top
        rectangle.top = snap(initial.top + modelDiff.y, 10)
        rectangle.height = snap(initial.height - modelDiff.y, 10)
        break
      }
      case 3: {
        // right
        rectangle.width = snap(initial.width + modelDiff.x, 10)
        break
      }
      case 4: {
        // bottom
        rectangle.height = snap(initial.height + modelDiff.y, 10)
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
    this.selected = new Set(
      this.items.filter(
        (item) => item.level === 0 && rectIntersectsRect(item.rectangle, rubberbandModel)
      )
    )
  }

  endRubberbanding() {
    if (!this.rubberbanding) {
      return
    }

    const rubberbandModel = this.rectClientToModel(this.rubberbanding.rect)
    this.selected = new Set(
      this.items.filter(
        (item) => item.level === 0 && rectIntersectsRect(item.rectangle, rubberbandModel)
      )
    )
    this.rubberbanding = null
  }

  // Abstract Events
  mouseOverSelectedItem() {
    return [...this.selected].some((item) => pointWithinRect(this.pointer, item.rectangle))
  }

  onMouseOrTouchDown(point: Point, shiftKey: boolean) {
    if (this.selected.size > 0) {
      const knob = this.mouseWithinKnob(this.selected.values().next().value)
      if (knob != -1) {
        this.startResizing(point, knob)
      } else if (this.overRect) {
        if (shiftKey) {
          if (this.selected.has(this.overRect)) {
            this.selected.delete(this.overRect)
          } else {
            this.selected.add(this.overRect)
          }
        } else {
          if (!this.mouseOverSelectedItem()) {
            this.selected = new Set([this.overRect])
          }
          this.startDragging(point)
        }
      } else {
        this.startRubberbanding(point)
      }
    } else if (this.overRect) {
      if (this.mode === "edit") {
        this.selected = new Set([this.overRect])
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
    if (this.canvas) {
      this.canvas.style.cursor = this.overRect ? "pointer" : "auto"
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

  onMouseDown(event: MouseEvent) {
    this.onMouseOrTouchDown(eventPoint(event), event.shiftKey)
  }

  onMouseMove(event: MouseEvent) {
    this.onMouseOrTouchMove(eventPoint(event))
  }

  onMouseUp(event: MouseEvent) {
    this.onMouseOrTouchUp()
  }

  /* We have to implement ourselves the pinch-to-zoom feature 
     using the number of touch points and the distance between them */

  onTouchStart(event: TouchEvent) {
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

  onTouchMove(event: TouchEvent) {
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

  onTouchEnd(event: TouchEvent) {
    this.onMouseOrTouchUp()
    this.zooming = null
  }

  // Mouse Wheel (zoom on desktop)

  onWheel(event: WheelEvent) {
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
        this.selected.clear()
      } else {
        this.mode = "edit"
      }
      this.paint()
    }
  }
}

const showText = (ctx: CanvasRenderingContext2D, str: string, lin: number, col: number) => {
  ctx.textBaseline = "middle"
  ctx.fillStyle = "black"
  ctx.font = "12px monospace"
  ctx.fillText(str, 6 * col + 6, 16 * lin + 16)
}

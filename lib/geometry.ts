import { z } from "zod"

export type Point = {
  x: number
  y: number
}

export type State = {
  state: "idle" | "panning"
  viewRect: {
    top: number
    left: number
    right: number
    bottom: number
  }
  pan: Point
  click: Point
}

export const ptAdd = (a: Point, b: Point): Point => ({
  x: a.x + b.x,
  y: a.y + b.y,
})

export const ptSub = (a: Point, b: Point): Point => ({
  x: a.x - b.x,
  y: a.y - b.y,
})

export const ptMul = (a: Point, s: number): Point => ({
  x: a.x * s,
  y: a.y * s,
})

export const ptMod = ({ x, y }: Point): number => Math.sqrt(x * x + y * y)

export const ptDistance = (a: Point, b: Point): number => ptMod(ptSub(a, b))

interface IMouseEvent {
  clientX: number
  clientY: number
}
export const eventPoint = (event: IMouseEvent): Point => {
  return { x: event.clientX, y: event.clientY }
}

export const pointToString = (p: Point): string => {
  return `(${p.x.toFixed(0)}, ${p.y.toFixed(0)})`
}

export const zRectangle = z.object({
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
})

export interface IRectangle {
  left: number
  top: number
  width: number
  height: number
}
export const pointWithinRect = (p: Point, rect: IRectangle): boolean =>
  p.x >= rect.left &&
  p.x <= rect.left + rect.width &&
  p.y >= rect.top &&
  p.y <= rect.top + rect.height

export const pointWithinCircle = (p: Point, center: Point, radius: number): boolean =>
  (p.x - center.x) ** 2 + (p.y - center.y) ** 2 <= radius * radius

export const rectIntersectsRect = (rect: IRectangle, bounds: IRectangle): boolean => {
  return (
    rect.left < bounds.left + bounds.width &&
    rect.left + rect.width > bounds.left &&
    rect.top < bounds.top + bounds.height &&
    rect.top + rect.height > bounds.top
  )
}

export const getKnobPositions = (rect: IRectangle): Point[] => {
  const { left, top, width, height } = rect
  return [
    { x: left, y: top + height / 2 }, // left
    { x: left + width / 2, y: top }, // top
    { x: left + width, y: top + height / 2 }, // right
    { x: left + width / 2, y: top + height }, // bottom
  ]
}

export const rectangleUnion = (a: IRectangle, b: IRectangle): IRectangle => {
  const left = Math.min(a.left, b.left)
  const top = Math.min(a.top, b.top)
  const right = Math.max(a.left + a.width, b.left + b.width)
  const bottom = Math.max(a.top + a.height, b.top + b.height)
  return {
    left,
    top,
    width: right - left,
    height: bottom - top,
  }
}

export const checkRectangle = ({ left, top, width, height }: IRectangle): boolean => {
  return (
    typeof left === "number" &&
    typeof top === "number" &&
    typeof width === "number" &&
    typeof height === "number" &&
    !Number.isNaN(left) &&
    !Number.isNaN(top) &&
    !Number.isNaN(width) &&
    !Number.isNaN(height)
  )
}

export const rectangleListUnion = (rects: IRectangle[]): IRectangle => {
  if (rects.length === 0) {
    return { left: 0, top: 0, width: 0, height: 0 }
  } else {
    return rects.reduce(rectangleUnion)
  }
}

export const rectangleEnlarge = (rect: IRectangle, amount: number): IRectangle => {
  return {
    left: rect.left - amount,
    top: rect.top - amount,
    width: rect.width + 2 * amount,
    height: rect.height + 2 * amount,
  }
}

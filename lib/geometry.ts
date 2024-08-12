export type Point = {
  x: number;
  y: number;
};

export type State = {
  state: "idle" | "panning";
  viewRect: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  pan: Point;
  click: Point;
};

export const ptAdd = (a: Point, b: Point): Point => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const ptSub = (a: Point, b: Point): Point => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const ptMul = (a: Point, s: number): Point => ({
  x: a.x * s,
  y: a.y * s,
});

interface IMouseEvent {
  clientX: number;
  clientY: number;
}
export const eventPoint = (event: IMouseEvent): Point => {
  return { x: event.clientX, y: event.clientY };
};

export const pointToString = (p: Point): string => {
  return `(${p.x.toFixed(0)}, ${p.y.toFixed(0)})`;
};

export interface IRectangle {
  left: number;
  top: number;
  width: number;
  height: number;
  color?: string;
}
export const pointWithinRect = (p: Point, rect: IRectangle): boolean =>
  p.x >= rect.left &&
  p.x <= rect.left + rect.width &&
  p.y >= rect.top &&
  p.y <= rect.top + rect.height;

export const pointWithinCircle = (p: Point, center: Point, radius: number): boolean =>
  (p.x - center.x) ** 2 + (p.y - center.y) ** 2 <= radius * radius;

export const withinBounds = (rect: IRectangle, bounds: IRectangle): boolean => {
  const corners = [
    { x: rect.left, y: rect.top },
    { x: rect.left, y: rect.top + rect.height },
    { x: rect.left + rect.width, y: rect.top },
    { x: rect.left + rect.width, y: rect.top + rect.height },
  ];
  return corners.some((corner) => pointWithinRect(corner, bounds));
};

export const getKnobPositions = (rect: IRectangle): Point[] => {
  const { left, top, width, height } = rect;
  return [
    { x: left, y: top + height / 2 }, // left
    { x: left + width / 2, y: top }, // top
    { x: left + width, y: top + height / 2 }, // right
    { x: left + width / 2, y: top + height }, // bottom
  ];
};
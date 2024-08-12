import { actionLoadRectangles, actionRectangleUpdate } from "@/actions/positions";
import {
  eventPoint,
  getKnobPositions,
  IRectangle,
  Point,
  pointToString,
  pointWithinCircle,
  pointWithinRect,
  ptAdd,
  ptMul,
  ptSub,
  withinBounds,
} from "@/lib/geometry";
import { RefObject } from "react";
import { clamp, snap } from "./utils";
import { MapPosition } from "@/data/schema";

export const MAP_MAX_WIDTH = 10000;
export const MAP_MAX_HEIGHT = 10000;

export class CanvasController {
  mode: "view" | "edit" = "view";

  canvasRef: RefObject<HTMLCanvasElement>;
  positions: MapPosition[];

  mouse: Point;
  scale: number;
  origin: Point;

  panning: null | { click: Point; origin: Point } = null;
  dragging: null | { click: Point; origins: Point[] } = null;
  resizing: null | {
    click: Point;
    initial: MapPosition;
    rect: MapPosition;
    knob: number;
  } = null;
  rubberbanding: null | { click: Point; rect: IRectangle } = null;

  overRect: MapPosition | null = null;
  selected: MapPosition[] = [];

  debug: boolean = false;

  constructor(ref: RefObject<HTMLCanvasElement>, urlPath: string) {
    this.canvasRef = ref;
    this.positions = [];

    // default values
    this.scale = 1;
    this.origin = { x: 0, y: 0 };

    this.parseUrlPath(urlPath);

    this.mouse = { x: 0, y: 0 };
    this.panning = null;
  }

  scaleToUrl() {
    window.history.replaceState(null, "", `/m/${this.getUrlPath()}`);
  }

  getCanvas() {
    const canvas = this.canvasRef.current;
    if (!canvas) {
      throw new Error(`Canvas is null!`);
    }
    return canvas;
  }

  getModelBounds() {
    const { width, height } = this.getCanvas();
    return this.rectClientToModel({ left: 0, top: 0, width, height });
  }

  getClientBounds() {
    return this.rectModelToClient({
      left: 0,
      top: 0,
      width: MAP_MAX_WIDTH,
      height: MAP_MAX_HEIGHT,
    });
  }

  resetScale(width: number, height: number) {
    const xscale = width / MAP_MAX_WIDTH;
    const yscale = height / MAP_MAX_HEIGHT;
    this.scale = Math.min(xscale, yscale);
    this.scaleToUrl();
  }

  getUrlPath() {
    const { origin, scale } = this;
    return `@${origin.x.toFixed(0)},${origin.y.toFixed(0)},${scale.toFixed(6)}`;
  }

  parseUrlPath(pathname: string) {
    const [_, state] = pathname.split("@");
    if (!state) {
      return;
    }

    const [_x, _y, _s] = state.split(",");
    const x = Number(_x);
    const y = Number(_y);
    const s = Number(_s);
    if (isNaN(x) || isNaN(y) || isNaN(s)) {
      return;
    }
    this.scale = s;
    this.origin = { x, y };
  }

  async loadPositions() {
    this.positions = await actionLoadRectangles();
    console.log("positions", this.positions);
    this.paint();
  }

  clientToModel(pclient: Point) {
    return ptMul(ptSub(pclient, this.origin), 1 / this.scale);
  }

  modelToClient(pmodel: Point) {
    return ptAdd(ptMul(pmodel, this.scale), this.origin);
  }

  rectClientToModel(pos: IRectangle): IRectangle {
    const tl = { x: pos.left, y: pos.top };
    const br = { x: pos.left + pos.width, y: pos.top + pos.height };
    const { x: left, y: top } = this.clientToModel(tl);
    const { x: right, y: bottom } = this.clientToModel(br);
    return { left, top, width: right - left, height: bottom - top };
  }

  rectModelToClient(rect: IRectangle): IRectangle {
    const tl = { x: rect.left, y: rect.top };
    const br = { x: rect.left + rect.width, y: rect.top + rect.height };
    const { x: left, y: top } = this.modelToClient(tl);
    const { x: right, y: bottom } = this.modelToClient(br);
    return { left, top, width: right - left, height: bottom - top };
  }

  paintRectMinimal(ctx: CanvasRenderingContext2D, _: number, rect: MapPosition) {
    const { left, top, width, height, color } = rect;
    const over = pointWithinRect(this.mouse, { left, top, width, height });
    ctx.fillStyle = color || "gray";
    if (this.mode === "edit" && over) {
      ctx.fillStyle = "white";
    }
    ctx.fillRect(left, top, width, height);
    return over;
  }

  paintRectFull(ctx: CanvasRenderingContext2D, i: number, rect: MapPosition) {
    const { left, top, width, height, color } = rect;
    ctx.fillStyle = color || "gray";
    ctx.beginPath();
    ctx.roundRect(left, top, width, height, 5);
    ctx.closePath();
    ctx.fill();

    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText(`${i}`, left + width / 2, top + height / 2);

    return false;
  }

  paintRect(ctx: CanvasRenderingContext2D, i: number, rect: MapPosition) {
    if (this.scale < 0.2) {
      return this.paintRectMinimal(ctx, i, rect);
    } else {
      return this.paintRectFull(ctx, i, rect);
    }
  }

  paintGrid(ctx: CanvasRenderingContext2D, bounds: IRectangle) {
    const left = bounds.left - (bounds.left % 10);
    for (let _x = 0; _x <= bounds.width; _x += 10) {
      const x = _x + left;
      ctx.lineWidth = 0.2;
      ctx.strokeStyle = "rgba(20, 20, 20, 0.5)";
      ctx.beginPath();
      ctx.moveTo(x, bounds.top);
      ctx.lineTo(x, bounds.top + bounds.height);
      ctx.stroke();
    }
    const top = bounds.top - (bounds.top % 10);
    for (let _y = 0; _y < bounds.height; _y += 10) {
      const y = _y + top;
      ctx.lineWidth = 0.2;
      ctx.strokeStyle = "rgba(20, 20, 20, 0.5)";
      ctx.beginPath();
      ctx.moveTo(bounds.left, y);
      ctx.lineTo(bounds.left + bounds.width, y);
      ctx.stroke();
    }
  }

  mouseWithinKnob(rect: MapPosition): number {
    const knobPositions = getKnobPositions(rect);
    for (let i = 0; i < knobPositions.length; i++) {
      const { x, y } = knobPositions[i];
      if (pointWithinCircle(this.mouse, { x, y }, 10)) {
        return i + 1;
      }
    }
    return -1;
  }

  paintSelected(ctx: CanvasRenderingContext2D, rect: MapPosition) {
    const { left, top, width, height } = rect;
    if (this.scale < 0.2) {
      ctx.fillStyle = "white";
      ctx.fillRect(left, top, width, height);
    } else {
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(left, top, width, height, 5);
      ctx.closePath();
      ctx.stroke();
    }
  }

  paintKnobs(ctx: CanvasRenderingContext2D, rect: MapPosition) {
    const paintKnob = (x: number, y: number, knob: number) => {
      const knobWidth = 8;

      let left = x - knobWidth / 2;
      let top = y - knobWidth / 2;
      let width = knobWidth;
      let height = knobWidth;

      if (knob === 1 || knob === 3) {
        top -= knobWidth;
        height *= 3;
      } else if (knob === 2 || knob === 4) {
        left -= knobWidth;
        width *= 3;
      }

      const knobRect = { left, top, width, height };
      const mouseInside = pointWithinRect(this.mouse, knobRect);
      const dragging = this.resizing && this.resizing.knob === knob;

      ctx.beginPath();
      ctx.roundRect(left, top, width, height, knobWidth / 2);
      ctx.closePath();
      ctx.fillStyle = dragging || mouseInside ? "blue" : "white";
      ctx.fill();
    };

    const knobPositions = getKnobPositions(rect);
    for (let i = 0; i < knobPositions.length; i++) {
      const { x, y } = knobPositions[i];
      paintKnob(x, y, i + 1);
    }
  }

  paintOverRect(ctx: CanvasRenderingContext2D, rect: MapPosition) {
    const { left, top, width, height } = rect;
    if (this.scale < 0.2) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillRect(left, top, width, height);
    } else {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(left, top, width, height, 5);
      ctx.closePath();
      ctx.stroke();
    }
  }

  paintRubberband(ctx: CanvasRenderingContext2D, rect: IRectangle) {
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
  }

  paintDebugInfo(ctx: CanvasRenderingContext2D) {
    showText(ctx, `mode:     ${this.mode}`, 0, 0);
    showText(ctx, `scale:    ${this.scale.toFixed(6)}`, 1, 0);
    showText(ctx, `origin:   ${pointToString(this.origin)}`, 2, 0);
    showText(ctx, `mouse:    ${pointToString(this.mouse)}`, 3, 0);

    const { left, top, width, height } = this.getClientBounds();
    showText(
      ctx,
      `bounds:   ${left.toFixed(0)}, ${top.toFixed(0)}, ${width.toFixed(0)}, ${height.toFixed(0)}`,
      4,
      0
    );
  }

  clearBackground(ctx: CanvasRenderingContext2D) {
    const { width, height } = ctx.canvas;
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);
  }

  paintBackground(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#020202";
    ctx.fillRect(0, 0, MAP_MAX_WIDTH, MAP_MAX_HEIGHT);
  }

  paintEditMode(ctx: CanvasRenderingContext2D, bounds: IRectangle) {
    ctx.strokeStyle = "red";
    const lw = 5 / this.scale;
    ctx.lineWidth = lw;
    ctx.strokeRect(
      bounds.left + lw / 2,
      bounds.top + lw / 2,
      bounds.width - lw,
      bounds.height - lw
    );
  }

  paintRectangles(ctx: CanvasRenderingContext2D, bounds: IRectangle) {
    for (let i = 0; i < this.positions.length; i++) {
      const rect = this.positions[i];
      if (withinBounds(rect, bounds)) {
        this.paintRect(ctx, i, this.positions[i]);
      }
    }
  }

  paint() {
    const canvas = this.canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error(`Canvas 2D context is null!`);
    }

    const { scale, origin } = this;

    this.clearBackground(ctx);

    ctx.save();
    ctx.translate(origin.x, origin.y);
    ctx.scale(scale, scale);

    this.paintBackground(ctx);

    const bounds = this.getModelBounds();

    if (scale > 1) {
      this.paintGrid(ctx, bounds);
    }

    this.paintRectangles(ctx, bounds);

    if (this.selected.length > 0) {
      for (const rect of this.selected) {
        this.paintSelected(ctx, rect);
      }
      if (this.selected.length === 1) {
        this.paintKnobs(ctx, this.selected[0]);
      }
    } else if (this.overRect) {
      this.paintOverRect(ctx, this.overRect);
    }

    if (this.mode === "edit") {
      this.paintEditMode(ctx, bounds);
    }

    ctx.restore();

    if (this.rubberbanding) {
      this.paintRubberband(ctx, this.rubberbanding.rect);
    }
    if (this.debug) {
      this.paintDebugInfo(ctx);
    }
  }

  saveRectangleList(rectangles: MapPosition[]) {
    actionRectangleUpdate(rectangles)
      .then(
        () => console.log("Updated:", rectangles) // TODO: better message
      )
      .catch((e) => {
        console.error(`Error updating rectangles: `, e); // TODO: show user
      });
  }

  // Panning

  startPanning(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    this.selected = [];
    this.dragging = null;
    this.panning = {
      click: eventPoint(event),
      origin: { ...this.origin },
    };
  }

  clampOrigin() {
    // Limit the origin
    const { width, height } = this.getCanvas();
    const bounds = this.getClientBounds();

    const xfree = width - bounds.width;
    if (xfree > 0) {
      if (this.origin.x < xfree / 2) {
        this.origin.x = xfree / 2;
      } else if (this.origin.x > width - bounds.width - xfree / 2) {
        this.origin.x = width - bounds.width - xfree / 2;
      }
    } else {
      if (this.origin.x > 100) {
        this.origin.x = 100;
      } else if (this.origin.x < width - 100) {
        this.origin.x = width - 100;
      }
    }

    const yfree = height - bounds.height;
    if (yfree > 0) {
      if (this.origin.y < yfree / 2) {
        this.origin.y = yfree / 2;
      } else if (this.origin.y > height - bounds.height - yfree / 2) {
        this.origin.y = height - bounds.height - yfree / 2;
      }
    }
  }

  doPanning(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!this.panning) return;

    this.overRect = null;
    const { click, origin } = this.panning;
    const diff = ptSub(eventPoint(event), click);
    this.origin = ptAdd(origin, diff);
    // this.clampOrigin();
  }

  // Dragging

  startDragging(click: Point) {
    const [first] = this.selected;
    if (first) {
      this.dragging = {
        click,
        origins: this.selected.map((rect) => ({ x: rect.left, y: rect.top })),
      };
    }
  }

  dragRectangle(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!this.dragging || !this.selected) return;

    const { click, origins } = this.dragging;
    const p = eventPoint(event);
    const clientDiff = ptSub(p, click);

    for (let i = 0; i < this.selected.length; i++) {
      const rect = this.selected[i];
      const origin = origins[i];
      rect.left = snap(origin.x + clientDiff.x / this.scale, 10);
      rect.top = snap(origin.y + clientDiff.y / this.scale, 10);
    }
  }

  endDragging() {
    if (!this.dragging || !this.selected) return;
    this.saveRectangleList(this.selected);
    this.dragging = null;
  }

  // Resizing

  startResizing(click: Point, knob: number) {
    if (!this.selected) return;
    const rect = this.selected[0];
    this.resizing = { click, initial: { ...rect }, rect, knob };
  }

  resizeRectangle(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!this.resizing) return;

    const { click, initial, rect, knob } = this.resizing;
    const p = eventPoint(event);
    const clientDiff = ptSub(p, click);
    const modelDiff = ptMul(clientDiff, 1 / this.scale);
    switch (knob) {
      case 1: {
        // left
        rect.left = snap(initial.left + modelDiff.x, 10);
        rect.width = snap(initial.width - modelDiff.x, 10);
        break;
      }
      case 2: {
        // top
        rect.top = snap(initial.top + modelDiff.y, 10);
        rect.height = snap(initial.height - modelDiff.y, 10);
        break;
      }
      case 3: {
        // right
        rect.width = snap(initial.width + modelDiff.x, 10);
        break;
      }
      case 4: {
        // bottom
        rect.height = snap(initial.height + modelDiff.y, 10);
        break;
      }
    }
  }

  endResizing() {
    if (!this.resizing) return;
    this.saveRectangleList([this.resizing.rect]);
    this.resizing = null;
  }

  // Rubberbanding

  startRubberbanding(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    const { x, y } = eventPoint(event);
    this.rubberbanding = {
      click: { x, y },
      rect: { left: x, top: y, width: 0, height: 0 },
    };
  }

  doRubberbanding(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (!this.rubberbanding) return;

    const { x: x1, y: y1 } = this.rubberbanding.click;
    const { x: x2, y: y2 } = eventPoint(event);
    this.rubberbanding.rect = {
      left: Math.min(x1, x2),
      top: Math.min(y1, y2),
      width: Math.abs(x1 - x2),
      height: Math.abs(y1 - y2),
    };
    const rubberbandModel = this.rectClientToModel(this.rubberbanding.rect);
    this.selected = this.positions.filter((rect) => withinBounds(rect, rubberbandModel));
  }

  endRubberbanding() {
    if (!this.rubberbanding) return;

    const rubberbandModel = this.rectClientToModel(this.rubberbanding.rect);
    this.selected = this.positions.filter((rect) => withinBounds(rect, rubberbandModel));
    this.rubberbanding = null;
  }

  // Mouse events

  onMouseDown(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (this.selected.length > 0) {
      const knob = this.mouseWithinKnob(this.selected[0]);
      if (knob != -1) {
        this.startResizing(eventPoint(event), knob);
      } else if (this.selected.some((rect) => pointWithinRect(this.mouse, rect))) {
        this.startDragging(eventPoint(event));
      } else if (this.overRect) {
        if (event.shiftKey) {
          this.selected.push(this.overRect);
        } else {
          this.selected = [this.overRect];
          this.startDragging(eventPoint(event));
        }
      } else {
        this.startRubberbanding(event);
      }
    } else if (this.overRect) {
      if (this.mode === "edit") {
        this.selected = [this.overRect];
        this.startDragging(eventPoint(event));
      } else {
        this.startPanning(event);
      }
    } else {
      if (this.mode === "view") {
        this.startPanning(event);
      } else {
        this.startRubberbanding(event);
      }
    }
    this.paint();
  }

  onMouseMove(event: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
    if (this.rubberbanding) {
      this.doRubberbanding(event);
    } else if (this.resizing) {
      this.resizeRectangle(event);
    } else if (this.dragging) {
      this.dragRectangle(event);
    } else if (this.panning) {
      this.doPanning(event);
    } else {
      this.overRect = this.positions.find((rect) => pointWithinRect(this.mouse, rect)) || null;
    }

    this.mouse = this.clientToModel(eventPoint(event));
    if (this.canvasRef.current) {
      this.canvasRef.current.style.cursor = this.overRect ? "pointer" : "auto";
    }
    this.paint();
  }

  onMouseUp(window: Window) {
    if (this.rubberbanding) {
      this.endRubberbanding();
    } else if (this.resizing) {
      this.endResizing();
    } else if (this.dragging) {
      this.endDragging();
    } else if (this.panning) {
      this.panning = null;
      this.scaleToUrl();
      this.overRect = this.positions.find((rect) => pointWithinRect(this.mouse, rect)) || null;
    }
    this.paint();
  }

  onWheel(event: React.WheelEvent<HTMLCanvasElement>) {
    let dscale = 1 - event.deltaY / 1000;
    let newScale = clamp(this.scale * dscale, 0.015, 5);
    dscale = newScale / this.scale;

    const clientZoomCenter = eventPoint(event);
    const diff = ptSub(clientZoomCenter, this.origin);
    const scaledDiff = ptMul(diff, dscale);
    this.origin = ptSub(clientZoomCenter, scaledDiff);
    // this.clampOrigin();
    this.scale *= dscale;
    this.scaleToUrl();
    this.paint();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === "d") {
      this.debug = !this.debug;
      this.paint();
    } else if (event.key === "Escape") {
      if (this.mode === "edit") {
        this.mode = "view";
        this.selected = [];
      } else {
        this.mode = "edit";
      }
      this.paint();
    }
  }
}

const showText = (ctx: CanvasRenderingContext2D, str: string, lin: number, col: number) => {
  ctx.textBaseline = "middle";
  ctx.fillStyle = "white";
  ctx.font = "12px monospace";
  ctx.fillText(str, 6 * col + 6, 16 * lin + 16);
};

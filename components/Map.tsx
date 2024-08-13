"use client";

import { actionLoadMapPositions, actionMapPositionsUpdate } from "@/actions/positions";
import { CanvasController } from "@/lib/canvas-controller";
import { MapPositionWithPiece } from "@/lib/data/db/positions";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type MapSize = {
  width: number;
  height: number;
};

type Item = MapPositionWithPiece;
type Controller = CanvasController<Item>;

type Router = ReturnType<typeof useRouter>;

class MapPositionsAdapter {
  router: Router;

  constructor(router: any) {
    this.router = router;
  }

  saveItems(positions: Item[]) {
    actionMapPositionsUpdate(positions)
      .then(
        () => console.log("Updated:", positions) // TODO: better message
      )
      .catch((e) => {
        console.error(`Error updating positions: `, e); // TODO: show user
      });
  }

  async loadItems() {
    return await actionLoadMapPositions();
  }

  paintItem(controller: Controller, ctx: CanvasRenderingContext2D, item: Item) {
    if (controller.scale < 0.2) {
      return controller.paintRectMinimal(ctx, 0, item);
    }

    const { left, top, width, height, color } = item;
    ctx.fillStyle = color || "gray";
    ctx.beginPath();
    ctx.roundRect(left, top, width, height, 5);
    ctx.closePath();
    ctx.fill();

    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.fillText(`${item.piece.name}`, left + width / 2, top + height / 2);
  }

  clickItem(item: Item) {
    const { hashmapEntry } = item.piece;
    if (hashmapEntry) {
      this.router.push(`/c/${hashmapEntry.idjpath}`)
    }
  }
};

export default function Map() {
  const router = useRouter();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<Controller>(
    new CanvasController(canvasRef, pathname, new MapPositionsAdapter(router))
  );

  const [size, setSize] = useState<MapSize>({ width: 0, height: 0 });
  const { current: state } = stateRef;

  useEffect(() => {
    state.loadItems();
    if (pathname === "/") {
      const pageBox = document.getElementById("page-box");
      if (!pageBox) {
        throw new Error("page-box not found");
      }
      const { width, height } = pageBox.getBoundingClientRect();
      state.resetScale(width, height);
    }
  }, [size, state, pathname]);

  useEffect(() => {
    const resize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    resize();

    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [state]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => state.onKeyDown(e);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [state]);

  useEffect(() => {
    if (size.width !== 0 && size.height !== 0) {
      state.paint();
    }
  }, [size, state]);

  return (
    <canvas
      ref={canvasRef}
      {...size}
      onMouseDown={(e) => state.onMouseDown(e)}
      onMouseMove={(e) => state.onMouseMove(e)}
      onMouseUp={() => state.onMouseUp(window)}
      onWheel={(e) => state.onWheel(e)}
    ></canvas>
  );
}

"use client"

import { useMap } from "@/components/map/use-map"
import { LegacyRef } from "react"

export default function Map() {
  const { canvasElement } = useMap()

  const appendCanvas: LegacyRef<HTMLDivElement> = (div) => {
    console.log("appendCanvas", div === null, canvasElement === null)
    if (div && canvasElement) {
      div.appendChild(canvasElement)
    }
  }

  return <div ref={appendCanvas} className="absolute top-0 left-0 right-0 bottom-0"></div>
}

"use client"

import { actionLoadMapPositions } from "@/actions/positions"
import { useMap } from "@/components/map/use-map"
import { useEffect, useRef, useState } from "react"
import { MapItem } from "./types"

const Container = ({ items }: { items: MapItem[] }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { canvasElement } = useMap(items)

  useEffect(() => {
    if (ref.current && canvasElement) {
      ref.current.appendChild(canvasElement)
    }
  }, [ref, canvasElement])

  return <div ref={ref} className="absolute top-0 left-0 right-0 bottom-0 -z-10"></div>
}

export default function Map() {
  const [items, setItems] = useState<MapItem[] | null>(null)

  useEffect(() => {
    actionLoadMapPositions().then((items) => {
      console.log(`Loaded ${items.length} items`)
      setItems(items)
    })
  }, [])

  return items && <Container items={items} />
}
